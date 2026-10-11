import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && session.user.role === "ADMIN";
}

export async function PUT(
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
    const remark = body?.remark?.trim();

    if (!remark || remark.length < 3) {
      return NextResponse.json(
        {
          error:
            "A specific administrative remark is required explaining the reason for rejection (minimum 3 characters).",
        },
        { status: 400 }
      );
    }

    const existingRequest = await prisma.iDRequest.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updatedRequest = await prisma.iDRequest.update({
      where: { id },
      data: {
        status: RequestStatus.REJECTED,
        adminRemark: remark,
      },
    });

    // Auto-create notification for student
    await createNotification({
      userId: existingRequest.student.userId,
      title: "Pass Request Rejected",
      message: `Your bus pass application was rejected with remark: "${remark}". Please review and resubmit.`,
      type: "WARNING",
      link: "/student/dashboard",
    });

    return NextResponse.json(
      {
        message: `Pass application rejected. Student ${existingRequest.student.fullName} has been notified with your remark.`,
        request: updatedRequest,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/admin/requests/[id]/reject error:", error);
    return NextResponse.json({ error: "Failed to reject pass application" }, { status: 500 });
  }
}
