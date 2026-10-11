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

    const students = await prisma.student.findMany({
      include: {
        user: { select: { email: true } },
        route: true,
        digitalId: true,
        idRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { fullName: "asc" },
    });

    const headers = [
      "Student ID",
      "Full Name",
      "Email Address",
      "Mobile Number",
      "Academic Year",
      "Engineering Branch",
      "Assigned Bus Route",
      "Annual Route Fee (INR)",
      "Fees Paid (INR)",
      "Pending Fees (INR)",
      "Fee Status",
      "Pass Request Status",
      "Digital ID Number",
      "Registered On",
    ];

    const escapeCsv = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = students.map((s) => {
      const totalFee = s.route ? s.route.fee : 0;
      const feesPaid = s.feesPaid;
      const pendingFees = Math.max(0, totalFee - feesPaid);
      const latestRequest = s.idRequests[0];
      const requestStatus = latestRequest ? latestRequest.status : "NOT_SUBMITTED";
      const feeStatus = pendingFees === 0 ? "CLEARED" : "PENDING";
      const digitalIdNum = s.digitalId ? s.digitalId.idNumber : "N/A";

      return [
        escapeCsv(s.id),
        escapeCsv(s.fullName),
        escapeCsv(s.user.email),
        escapeCsv(s.mobile),
        escapeCsv(s.year),
        escapeCsv(s.branch),
        escapeCsv(s.route?.name || "Unassigned"),
        escapeCsv(totalFee),
        escapeCsv(feesPaid),
        escapeCsv(pendingFees),
        escapeCsv(feeStatus),
        escapeCsv(requestStatus),
        escapeCsv(digitalIdNum),
        escapeCsv(new Date(s.createdAt).toISOString().split("T")[0]),
      ].join(",");
    });

    const csvContent = [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
    const dateStr = new Date().toISOString().split("T")[0];

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Students-Transport-Export-${dateStr}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/export/students error:", error);
    return NextResponse.json({ error: "Failed to export student CSV" }, { status: 500 });
  }
}
