import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import QRCode from "qrcode";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

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
        digitalId: true,
        idRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const latestRequest = student.idRequests[0];
    const isApproved = latestRequest?.status === RequestStatus.APPROVED && !!student.digitalId;

    if (!isApproved) {
      return NextResponse.json(
        {
          error:
            "Your digital bus ID pass has not been approved yet. Digital ID cards are only accessible once verified by the transport administration.",
        },
        { status: 403 }
      );
    }

    const digitalId = student.digitalId!;
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify/${digitalId.idNumber}`;

    // Generate high-resolution QR code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 300,
      color: {
        dark: "#1e1b4b", // deep indigo
        light: "#ffffff",
      },
    });

    const issuedYear = new Date(digitalId.issuedAt).getFullYear();
    const validity = `30 June ${issuedYear + 1}`;

    return NextResponse.json(
      {
        digitalId: {
          id: digitalId.id,
          idNumber: digitalId.idNumber,
          issuedAt: digitalId.issuedAt,
          validity,
          verificationUrl,
          qrCodeDataUrl,
        },
        student: {
          id: student.id,
          fullName: student.fullName,
          year: student.year,
          branch: student.branch,
          mobile: student.mobile,
          feesPaid: student.feesPaid,
        },
        route: student.route
          ? {
              id: student.route.id,
              name: student.route.name,
              fee: student.route.fee,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/student/id error:", error);
    return NextResponse.json({ error: "Failed to load digital ID pass" }, { status: 500 });
  }
}
