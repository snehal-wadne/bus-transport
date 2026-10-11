import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public GET /api/verify/[idNumber] - Verify transit pass validity
export async function GET(
  req: Request,
  { params }: { params: { idNumber: string } }
) {
  try {
    const { idNumber } = params;

    if (!idNumber) {
      return NextResponse.json({ valid: false, error: "ID number is required" }, { status: 400 });
    }

    const digitalId = await prisma.digitalID.findUnique({
      where: { idNumber: idNumber.trim() },
      include: {
        student: {
          include: {
            route: true,
          },
        },
      },
    });

    if (!digitalId) {
      return NextResponse.json(
        {
          valid: false,
          error: `No active transit pass found for ID number: ${idNumber}`,
        },
        { status: 404 }
      );
    }

    const student = digitalId.student;
    const issuedYear = new Date(digitalId.issuedAt).getFullYear();
    const validity = `30 June ${issuedYear + 1}`;

    return NextResponse.json(
      {
        valid: true,
        digitalId: {
          idNumber: digitalId.idNumber,
          issuedAt: digitalId.issuedAt,
          validity,
          status: "ACTIVE_VERIFIED",
        },
        student: {
          fullName: student.fullName,
          year: student.year,
          branch: student.branch,
          route: student.route ? student.route.name : "Unassigned",
          college: "College of Engineering & Technology",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/verify/[idNumber] error:", error);
    return NextResponse.json(
      { valid: false, error: "Internal error during pass verification" },
      { status: 500 }
    );
  }
}
