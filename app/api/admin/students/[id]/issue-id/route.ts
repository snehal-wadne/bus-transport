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

// POST /api/admin/students/[id]/issue-id
// Allows Admin to directly generate and issue the Digital ID Pass from the student inspection drawer
export async function POST(
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
        digitalId: true,
        idRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!student.routeId) {
      return NextResponse.json(
        { error: "Student must have an assigned bus route before an ID card can be generated." },
        { status: 400 }
      );
    }

    // If digital ID already exists
    if (student.digitalId) {
      return NextResponse.json(
        {
          message: `Digital ID pass is already active (${student.digitalId.idNumber}).`,
          digitalId: student.digitalId,
        },
        { status: 200 }
      );
    }

    // Atomic transaction: generate ID and update/create IDRequest
    const [digitalId, updatedRequest] = await prisma.$transaction(async (tx) => {
      // 1. Generate sequential TRN-YYYY-XXXX
      const year = new Date().getFullYear();
      const prefix = `TRN-${year}-`;
      const currentCount = await tx.digitalID.count();
      let seq = currentCount + 1;
      let idNumber = `${prefix}${seq.toString().padStart(4, "0")}`;

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

      // 2. Mark or create IDRequest as APPROVED
      let reqToUpdate = student.idRequests[0];
      if (reqToUpdate) {
        reqToUpdate = await tx.iDRequest.update({
          where: { id: reqToUpdate.id },
          data: {
            status: RequestStatus.APPROVED,
            adminRemark: "Pass generated and issued directly by Administrator",
          },
        });
      } else {
        reqToUpdate = await tx.iDRequest.create({
          data: {
            studentId: student.id,
            status: RequestStatus.APPROVED,
            adminRemark: "Pass generated and issued directly by Administrator",
          },
        });
      }

      return [digId, reqToUpdate];
    });

    // Notify student
    await createNotification({
      userId: student.userId,
      title: "Bus Pass Approved & Issued! 🎉",
      message: `Your college bus pass has been verified. Digital Transit ID ${digitalId.idNumber} is now ready for use and download!`,
      type: "SUCCESS",
      link: "/student/dashboard",
    });

    return NextResponse.json(
      {
        message: `Pass generated successfully! ID ${digitalId.idNumber} issued for ${student.fullName}.`,
        digitalId,
        request: updatedRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/students/[id]/issue-id error:", error);
    return NextResponse.json(
      { error: "Failed to issue digital ID pass" },
      { status: 500 }
    );
  }
}
