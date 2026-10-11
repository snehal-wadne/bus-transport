import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { z } from "zod";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && session.user.role === "ADMIN";
}

const updateStudentSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  mobile: z.string().trim().regex(/^[0-9]{10}$/).optional(),
  year: z.string().optional(),
  branch: z.string().optional(),
  routeId: z.string().optional(),
  feesPaid: z.coerce.number().min(0).optional(),
  paymentNote: z.string().optional(),
});

// GET /api/admin/students/[id] - Get student details with payments and ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { id } = params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        route: true,
        user: { select: { email: true } },
        digitalId: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
        idRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const totalFee = student.route ? student.route.fee : 0;
    const pendingFees = Math.max(0, totalFee - student.feesPaid);

    return NextResponse.json(
      {
        student: {
          ...student,
          totalFee,
          pendingFees,
          isCleared: pendingFees === 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/admin/students/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch student details" }, { status: 500 });
  }
}

// PATCH /api/admin/students/[id] - Update student profile or adjust feesPaid
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const parseResult = updateStudentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const currentStudent = await prisma.student.findUnique({
      where: { id },
      include: { route: true },
    });

    if (!currentStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const updateData: any = {};
    const { fullName, mobile, year, branch, routeId, feesPaid, paymentNote } = parseResult.data;

    if (fullName) updateData.fullName = fullName;
    if (mobile) updateData.mobile = mobile;
    if (year) updateData.year = year;
    if (branch) updateData.branch = branch;
    if (routeId) updateData.routeId = routeId;

    let feeDiff = 0;
    if (feesPaid !== undefined) {
      updateData.feesPaid = feesPaid;
      feeDiff = feesPaid - currentStudent.feesPaid;
    }

    // Execute update in transaction with payment log if fee increased
    const [updatedStudent] = await prisma.$transaction(async (tx) => {
      const updated = await tx.student.update({
        where: { id },
        data: updateData,
        include: {
          route: true,
          user: { select: { email: true } },
          digitalId: true,
        },
      });

      if (feeDiff > 0) {
        await tx.payment.create({
          data: {
            studentId: id,
            amount: feeDiff,
            date: new Date(),
            note: paymentNote || "Admin fee adjustment",
          },
        });
      }

      return [updated];
    });

    const routeFee = updatedStudent.route ? updatedStudent.route.fee : 0;
    const newPendingFees = Math.max(0, routeFee - updatedStudent.feesPaid);

    // If fees changed, send notification to student
    if (feeDiff !== 0) {
      await createNotification({
        userId: updatedStudent.userId,
        title: feeDiff > 0 ? "Fee Payment Updated ✅" : "Fee Record Adjusted",
        message:
          feeDiff > 0
            ? `Your account was credited with ₹${feeDiff.toLocaleString("en-IN")}. Total fees paid: ₹${updatedStudent.feesPaid.toLocaleString("en-IN")}. Pending balance: ₹${newPendingFees.toLocaleString("en-IN")}.`
            : `Your fee record was adjusted to ₹${updatedStudent.feesPaid.toLocaleString("en-IN")}. Pending balance: ₹${newPendingFees.toLocaleString("en-IN")}.`,
        type: "SUCCESS",
        link: "/student/dashboard",
      });
    }

    return NextResponse.json(
      {
        message: "Student profile & fee records updated successfully!",
        student: {
          ...updatedStudent,
          totalFee: routeFee,
          pendingFees: newPendingFees,
          isCleared: newPendingFees === 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PATCH /api/admin/students/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update student profile or fees" },
      { status: 500 }
    );
  }
}
