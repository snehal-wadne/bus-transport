import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && session.user.role === "ADMIN";
}

// GET /api/admin/requests - Filter by status, search by name, filter by branch/route, pagination
export async function GET(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);

    // Query parameters
    const statusParam = searchParams.get("status"); // PENDING, APPROVED, REJECTED, ALL
    const search = searchParams.get("search")?.trim() || "";
    const branch = searchParams.get("branch")?.trim() || "";
    const routeId = searchParams.get("routeId")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    // Build Prisma where clause
    const whereClause: any = {};

    // 1. Status Filter
    if (statusParam && ["PENDING", "APPROVED", "REJECTED"].includes(statusParam.toUpperCase())) {
      whereClause.status = statusParam.toUpperCase() as RequestStatus;
    }

    // 2. Student criteria filters
    const studentWhere: any = {};

    if (search) {
      studentWhere.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (branch && ["Civil", "Mechanical", "Computer"].includes(branch)) {
      studentWhere.branch = branch;
    }

    if (routeId) {
      studentWhere.routeId = routeId;
    }

    if (Object.keys(studentWhere).length > 0) {
      whereClause.student = studentWhere;
    }

    // Query data and count in parallel
    const [requests, totalCount, stats] = await Promise.all([
      prisma.iDRequest.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              route: true,
              user: { select: { email: true } },
              digitalId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.iDRequest.count({ where: whereClause }),
      prisma.iDRequest.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    // Format output with live fee calculations
    const formattedRequests = requests.map((r) => {
      const student = r.student;
      const totalFee = student.route ? student.route.fee : 0;
      const feesPaid = student.feesPaid;
      const pendingFees = Math.max(0, totalFee - feesPaid);

      return {
        id: r.id,
        status: r.status,
        adminRemark: r.adminRemark,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        student: {
          id: student.id,
          fullName: student.fullName,
          email: student.user.email,
          mobile: student.mobile,
          year: student.year,
          branch: student.branch,
          route: student.route
            ? { id: student.route.id, name: student.route.name, fee: student.route.fee }
            : null,
          feesPaid,
          totalFee,
          pendingFees,
          digitalId: student.digitalId,
        },
      };
    });

    const statusCounts = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
    };
    stats.forEach((s) => {
      statusCounts[s.status] = s._count.status;
    });

    return NextResponse.json(
      {
        requests: formattedRequests,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1,
        },
        counts: {
          all: statusCounts.PENDING + statusCounts.APPROVED + statusCounts.REJECTED,
          ...statusCounts,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/admin/requests error:", error);
    return NextResponse.json({ error: "Failed to fetch pass requests" }, { status: 500 });
  }
}
