import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && session.user.role === "ADMIN";
}

const recordPaymentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  amount: z.coerce.number().positive("Payment amount must be greater than zero"),
  note: z.string().optional().nullable(),
  date: z.string().optional(),
});

// GET /api/admin/payments - Returns all students' fee ledger and payments
export async function GET() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const students = await prisma.student.findMany({
      include: {
        route: true,
        user: { select: { email: true } },
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { fullName: "asc" },
    });

    const studentLedgers = students.map((s) => {
      const totalFee = s.route ? s.route.fee : 0;
      const feesPaid = s.feesPaid;
      const pendingFees = Math.max(0, totalFee - feesPaid);
      return {
        id: s.id,
        fullName: s.fullName,
        email: s.user.email,
        mobile: s.mobile,
        year: s.year,
        branch: s.branch,
        route: s.route ? { id: s.route.id, name: s.route.name, fee: s.route.fee } : null,
        totalFee,
        feesPaid,
        pendingFees,
        isCleared: pendingFees === 0,
        payments: s.payments,
      };
    });

    // Overview Stats
    const totalRevenueExpected = studentLedgers.reduce((acc, s) => acc + s.totalFee, 0);
    const totalCollected = studentLedgers.reduce((acc, s) => acc + s.feesPaid, 0);
    const totalPending = studentLedgers.reduce((acc, s) => acc + s.pendingFees, 0);

    return NextResponse.json(
      {
        ledgers: studentLedgers,
        stats: {
          totalStudents: studentLedgers.length,
          totalRevenueExpected,
          totalCollected,
          totalPending,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/admin/payments error:", error);
    return NextResponse.json({ error: "Failed to fetch fee ledger" }, { status: 500 });
  }
}

// POST /api/admin/payments - Record a new student payment
export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = recordPaymentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Invalid payment data" },
        { status: 400 }
      );
    }

    const { studentId, amount, note, date } = parseResult.data;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { route: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const paymentDate = date ? new Date(date) : new Date();

    // Execute payment creation and student feesPaid update atomically
    const [newPayment, updatedStudent] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          studentId,
          amount,
          date: paymentDate,
          note: note || "Fee payment recorded by admin",
        },
      }),
      prisma.student.update({
        where: { id: studentId },
        data: {
          feesPaid: { increment: amount },
        },
        include: { route: true },
      }),
    ]);

    const totalFee = updatedStudent.route ? updatedStudent.route.fee : 0;
    const pendingFees = Math.max(0, totalFee - updatedStudent.feesPaid);

    // Auto-create notification for student
    await createNotification({
      userId: student.userId,
      title: "Fee Payment Credited",
      message: `A payment of ₹${amount.toLocaleString("en-IN")} has been recorded on your bus pass account. Remaining balance: ₹${pendingFees.toLocaleString("en-IN")}.`,
      type: "SUCCESS",
      link: "/student/dashboard",
    });

    return NextResponse.json(
      {
        message: `Payment of ₹${amount.toLocaleString("en-IN")} recorded successfully for ${student.fullName}`,
        payment: newPayment,
        student: {
          id: updatedStudent.id,
          feesPaid: updatedStudent.feesPaid,
          pendingFees,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/payments error:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
