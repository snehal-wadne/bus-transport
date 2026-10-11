import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const studentProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters long"),
  year: z.enum(["1st Year", "2nd Year", "3rd Year"], {
    errorMap: () => ({ message: "Year must be 1st Year, 2nd Year, or 3rd Year" }),
  }),
  branch: z.enum(["Civil", "Mechanical", "Computer"], {
    errorMap: () => ({ message: "Branch must be Civil, Mechanical, or Computer" }),
  }),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  routeId: z.string().min(1, "Please select a valid bus route"),
  feesPaid: z.coerce
    .number()
    .min(0, "Fees paid cannot be negative"),
});

// GET /api/student/profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        route: true,
        idRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        digitalId: true,
      },
    });

    if (!student) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const totalFee = student.route ? student.route.fee : 0;
    const feesPaid = student.feesPaid;
    const pendingFees = Math.max(0, totalFee - feesPaid);
    const latestRequest = student.idRequests[0] || null;

    return NextResponse.json(
      {
        profile: {
          ...student,
          totalFee,
          pendingFees,
          latestRequest,
          isApproved: latestRequest?.status === RequestStatus.APPROVED,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/student/profile error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve student profile" },
      { status: 500 }
    );
  }
}

// POST or PUT /api/student/profile (Create or Update)
async function handleProfileSave(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = studentProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: parseResult.error.errors[0]?.message || "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { fullName, year, branch, mobile, routeId, feesPaid } = parseResult.data;

    // Verify route exists
    const route = await prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      return NextResponse.json(
        { error: "Selected route not found" },
        { status: 404 }
      );
    }

    if (feesPaid > route.fee) {
      return NextResponse.json(
        {
          error: `Fees paid (₹${feesPaid.toLocaleString("en-IN")}) cannot exceed the route fee (₹${route.fee.toLocaleString("en-IN")})`,
        },
        { status: 400 }
      );
    }

    // Check if student profile already exists
    const existingStudent = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        idRequests: {
          where: { status: RequestStatus.APPROVED },
        },
      },
    });

    // Rule: Update only if the request is not yet approved
    if (existingStudent && existingStudent.idRequests.length > 0) {
      return NextResponse.json(
        {
          error:
            "Profile cannot be updated because your bus pass has already been approved by the administration.",
        },
        { status: 403 }
      );
    }

    const totalFee = route.fee;
    const pendingFees = Math.max(0, totalFee - feesPaid);

    let savedStudent;
    if (existingStudent) {
      // Update existing student
      savedStudent = await prisma.student.update({
        where: { id: existingStudent.id },
        data: {
          fullName,
          year,
          branch,
          mobile,
          routeId,
          feesPaid,
        },
        include: {
          route: true,
          idRequests: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
    } else {
      // Create new student profile
      savedStudent = await prisma.student.create({
        data: {
          userId: session.user.id,
          fullName,
          year,
          branch,
          mobile,
          routeId,
          feesPaid,
        },
        include: {
          route: true,
          idRequests: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
    }

    // Automatically create a PENDING IDRequest if no request exists yet
    let activeRequest = savedStudent.idRequests[0] || null;
    if (!activeRequest) {
      activeRequest = await prisma.iDRequest.create({
        data: {
          studentId: savedStudent.id,
          status: RequestStatus.PENDING,
          adminRemark: null,
        },
      });

      await createNotification({
        userId: session.user.id,
        title: "Pass Application Submitted",
        message: `Your bus pass application for ${route.name} has been submitted and is currently under administrative review.`,
        type: "INFO",
        link: "/student/dashboard",
      });
    }

    return NextResponse.json(
      {
        message: existingStudent
          ? "Student profile updated successfully"
          : "Student profile registered successfully",
        profile: {
          ...savedStudent,
          totalFee,
          pendingFees,
          latestRequest: activeRequest,
        },
      },
      { status: existingStudent ? 200 : 201 }
    );
  } catch (error: any) {
    console.error("Save /api/student/profile error:", error);
    return NextResponse.json(
      { error: "Failed to save student profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return handleProfileSave(req);
}

export async function PUT(req: Request) {
  return handleProfileSave(req);
}
