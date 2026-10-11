import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

// POST /api/requests - Submit a bus pass ID request
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find student record
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        route: true,
        idRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        {
          error:
            "Please create and complete your student profile before requesting a digital bus ID.",
        },
        { status: 400 }
      );
    }

    // Check if profile is complete
    const isProfileComplete =
      Boolean(student.fullName?.trim()) &&
      Boolean(student.year?.trim()) &&
      Boolean(student.branch?.trim()) &&
      Boolean(student.mobile?.trim()) &&
      Boolean(student.routeId);

    if (!isProfileComplete) {
      return NextResponse.json(
        {
          error:
            "Incomplete profile: Full Name, Year, Branch, Mobile Number, and Bus Route are required before requesting an ID pass.",
        },
        { status: 400 }
      );
    }

    // Check active requests
    const latestRequest = student.idRequests[0];
    if (latestRequest) {
      if (latestRequest.status === RequestStatus.PENDING) {
        return NextResponse.json(
          {
            error:
              "You already have an active pass application currently under administrative review.",
          },
          { status: 400 }
        );
      }

      if (latestRequest.status === RequestStatus.APPROVED) {
        return NextResponse.json(
          {
            error:
              "Your bus pass application is already approved and issued.",
          },
          { status: 400 }
        );
      }
    }

    // Create new IDRequest in PENDING state (resubmission or initial submission)
    const newRequest = await prisma.iDRequest.create({
      data: {
        studentId: student.id,
        status: RequestStatus.PENDING,
        adminRemark: null,
      },
    });

    // Auto-create notification for student
    await createNotification({
      userId: session.user.id,
      title: "Pass Request Submitted",
      message: `Your bus pass request for ${student.route?.name || "selected route"} has been submitted and is currently under administrative review.`,
      type: "INFO",
      link: "/student/dashboard",
    });

    return NextResponse.json(
      {
        message: "Digital ID pass application submitted successfully! It is now under review.",
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/requests error:", error);
    return NextResponse.json(
      { error: "Failed to submit digital ID request" },
      { status: 500 }
    );
  }
}
