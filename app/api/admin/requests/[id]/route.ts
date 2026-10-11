import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && session.user.role === "ADMIN";
}

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

    const request = await prisma.iDRequest.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            route: true,
            user: { select: { email: true } },
            digitalId: true,
            payments: { orderBy: { createdAt: "desc" } },
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const student = request.student;
    const totalFee = student.route ? student.route.fee : 0;
    const feesPaid = student.feesPaid;
    const pendingFees = Math.max(0, totalFee - feesPaid);

    return NextResponse.json(
      {
        request: {
          id: request.id,
          status: request.status,
          adminRemark: request.adminRemark,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          student: {
            ...student,
            totalFee,
            pendingFees,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/admin/requests/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch request detail" }, { status: 500 });
  }
}
