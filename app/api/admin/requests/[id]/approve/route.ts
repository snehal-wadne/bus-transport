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

    const existingRequest = await prisma.iDRequest.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const student = existingRequest.student;

    // Atomic Transaction: Approve IDRequest + Issue DigitalID (TRN-YYYY-XXXX format)
    const [updatedRequest, digitalId] = await prisma.$transaction(async (tx) => {
      // 1. Mark request as APPROVED
      const request = await tx.iDRequest.update({
        where: { id },
        data: {
          status: RequestStatus.APPROVED,
          adminRemark: "Application approved by Transport Administration",
        },
      });

      // 2. Check if student already has a digital ID
      const existingDigitalId = await tx.digitalID.findUnique({
        where: { studentId: student.id },
      });

      if (existingDigitalId) {
        return [request, existingDigitalId];
      }

      // 3. Generate sequential format: TRN-2026-0001
      const year = new Date().getFullYear();
      const prefix = `TRN-${year}-`;
      const currentCount = await tx.digitalID.count();
      let seq = currentCount + 1;
      let idNumber = `${prefix}${seq.toString().padStart(4, "0")}`;

      // Collision avoidance
      while (await tx.digitalID.findUnique({ where: { idNumber } })) {
        seq += 1;
        idNumber = `${prefix}${seq.toString().padStart(4, "0")}`;
      }

      const digId = await tx.digitalID.create({
        data: {
          studentId: student.id,
          idNumber,
          issuedAt: new Date(),
        },
      });

      return [request, digId];
    });

    // Auto-create notification for student
    await createNotification({
      userId: student.userId,
      title: "Bus Pass Approved! 🎉",
      message: `Your college bus pass has been verified and approved. Digital ID ${digitalId.idNumber} is ready for download!`,
      type: "SUCCESS",
      link: "/student/dashboard",
    });

    return NextResponse.json(
      {
        message: `Pass application approved! Digital ID ${digitalId.idNumber} generated for ${student.fullName}.`,
        request: updatedRequest,
        digitalId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/admin/requests/[id]/approve error:", error);
    return NextResponse.json({ error: "Failed to approve pass application" }, { status: 500 });
  }
}
