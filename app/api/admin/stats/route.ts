import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && session.user.role === "ADMIN";
}

export async function GET() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const [
      students,
      routes,
      pendingRequests,
      approvedIDs,
      rejectedRequests,
    ] = await Promise.all([
      prisma.student.findMany({ include: { route: true } }),
      prisma.route.findMany({
        include: { _count: { select: { students: true } } },
        orderBy: { fee: "desc" },
      }),
      prisma.iDRequest.count({ where: { status: "PENDING" } }),
      prisma.digitalID.count(),
      prisma.iDRequest.count({ where: { status: "REJECTED" } }),
    ]);

    const totalStudents = students.length;
    const totalRevenueExpected = students.reduce((acc, s) => acc + (s.route?.fee || 0), 0);
    const totalCollected = students.reduce((acc, s) => acc + s.feesPaid, 0);
    const totalPending = Math.max(0, totalRevenueExpected - totalCollected);

    // Branch breakdown
    const branchCounts: Record<string, number> = {
      Computer: 0,
      Civil: 0,
      Mechanical: 0,
    };
    students.forEach((s) => {
      if (branchCounts[s.branch] !== undefined) {
        branchCounts[s.branch] += 1;
      }
    });

    // Year breakdown
    const yearCounts: Record<string, number> = {
      "1st Year": 0,
      "2nd Year": 0,
      "3rd Year": 0,
    };
    students.forEach((s) => {
      if (yearCounts[s.year] !== undefined) {
        yearCounts[s.year] += 1;
      }
    });

    const routeStats = routes.map((r) => ({
      id: r.id,
      name: r.name,
      fee: r.fee,
      studentCount: r._count.students,
      revenueExpected: r._count.students * r.fee,
    }));

    return NextResponse.json(
      {
        overview: {
          totalStudents,
          pendingRequests,
          approvedIDs,
          rejectedRequests,
          totalRevenueExpected,
          totalCollected,
          totalPending,
        },
        routeStats,
        branchCounts,
        yearCounts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
