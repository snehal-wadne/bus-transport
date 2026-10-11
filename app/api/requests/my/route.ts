import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/requests/my - Get authenticated student's pass requests
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
        },
        digitalId: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        {
          hasProfile: false,
          isProfileComplete: false,
          latestRequest: null,
          allRequests: [],
        },
        { status: 200 }
      );
    }

    const isProfileComplete =
      Boolean(student.fullName?.trim()) &&
      Boolean(student.year?.trim()) &&
      Boolean(student.branch?.trim()) &&
      Boolean(student.mobile?.trim()) &&
      Boolean(student.routeId);

    const latestRequest = student.idRequests[0] || null;

    return NextResponse.json(
      {
        hasProfile: true,
        isProfileComplete,
        latestRequest,
        allRequests: student.idRequests,
        digitalId: student.digitalId,
        student: {
          id: student.id,
          fullName: student.fullName,
          route: student.route,
          feesPaid: student.feesPaid,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/requests/my error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pass request status" },
      { status: 500 }
    );
  }
}
