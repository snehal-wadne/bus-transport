import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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

    if (!student || !student.digitalId) {
      return NextResponse.json(
        { error: "No approved bus pass found for this student" },
        { status: 404 }
      );
    }

    const latestRequest = student.idRequests[0];
    if (latestRequest?.status !== RequestStatus.APPROVED) {
      return NextResponse.json(
        { error: "Your bus pass application has not been approved yet." },
        { status: 403 }
      );
    }

    const digitalId = student.digitalId;
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify/${digitalId.idNumber}`;

    // Generate QR Code PNG Buffer
    const qrPngBuffer = await QRCode.toBuffer(verificationUrl, {
      type: "png",
      margin: 1,
      width: 250,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff",
      },
    });

    // Create PDF Document using pdf-lib (serverless safe, pure JS)
    const pdfDoc = await PDFDocument.create();

    // Standard high-res transit pass card dimensions (480 x 300 points)
    const cardWidth = 480;
    const cardHeight = 300;
    const page = pdfDoc.addPage([cardWidth, cardHeight]);

    // Embed fonts
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Embed QR Code
    const qrImage = await pdfDoc.embedPng(qrPngBuffer);

    // Color definitions
    const primaryNavy = rgb(0.12, 0.16, 0.38); // Deep Navy Indigo
    const accentIndigo = rgb(0.31, 0.27, 0.89);
    const bgCard = rgb(0.98, 0.98, 1.0);
    const darkText = rgb(0.08, 0.1, 0.15);
    const mutedText = rgb(0.4, 0.45, 0.53);
    const borderGray = rgb(0.85, 0.88, 0.94);
    const white = rgb(1, 1, 1);
    const gold = rgb(0.85, 0.65, 0.13);

    // 1. Background Fill & Rounded Border Box
    page.drawRectangle({
      x: 0,
      y: 0,
      width: cardWidth,
      height: cardHeight,
      color: bgCard,
    });

    // 2. Header Banner
    page.drawRectangle({
      x: 0,
      y: cardHeight - 65,
      width: cardWidth,
      height: 65,
      color: primaryNavy,
    });

    // Gold accent bar below header
    page.drawRectangle({
      x: 0,
      y: cardHeight - 69,
      width: cardWidth,
      height: 4,
      color: gold,
    });

    // Header Text
    page.drawText("COLLEGE OF ENGINEERING & TECHNOLOGY", {
      x: 20,
      y: cardHeight - 26,
      size: 13,
      font: fontBold,
      color: white,
    });

    page.drawText("CAMPUS TRANSIT • OFFICIAL STUDENT BUS PASS", {
      x: 20,
      y: cardHeight - 44,
      size: 9,
      font: fontBold,
      color: rgb(0.8, 0.85, 1.0),
    });

    // ID Badge Chip in Top Right
    page.drawText(digitalId.idNumber, {
      x: cardWidth - 145,
      y: cardHeight - 26,
      size: 11,
      font: fontBold,
      color: gold,
    });

    page.drawText("ACADEMIC YEAR 2026-27", {
      x: cardWidth - 145,
      y: cardHeight - 42,
      size: 8,
      font: fontRegular,
      color: white,
    });

    // 3. Left Section: Student Information
    const startX = 24;
    let currentY = cardHeight - 95;

    // Student Name
    page.drawText("STUDENT FULL NAME", {
      x: startX,
      y: currentY,
      size: 7,
      font: fontBold,
      color: mutedText,
    });
    currentY -= 15;
    page.drawText(student.fullName.toUpperCase(), {
      x: startX,
      y: currentY,
      size: 13,
      font: fontBold,
      color: darkText,
    });

    // Academic Year & Branch
    currentY -= 24;
    page.drawText("ENROLLMENT & DEPARTMENT", {
      x: startX,
      y: currentY,
      size: 7,
      font: fontBold,
      color: mutedText,
    });
    currentY -= 14;
    page.drawText(`${student.year} • ${student.branch} Engineering`, {
      x: startX,
      y: currentY,
      size: 10,
      font: fontBold,
      color: accentIndigo,
    });

    // Bus Route
    currentY -= 24;
    page.drawText("DESIGNATED BUS ROUTE", {
      x: startX,
      y: currentY,
      size: 7,
      font: fontBold,
      color: mutedText,
    });
    currentY -= 14;
    page.drawText(student.route?.name || "General Corridor", {
      x: startX,
      y: currentY,
      size: 11,
      font: fontBold,
      color: darkText,
    });

    // Contact Mobile & Validity
    currentY -= 24;
    page.drawText("CONTACT MOBILE", {
      x: startX,
      y: currentY,
      size: 7,
      font: fontBold,
      color: mutedText,
    });
    page.drawText("PASS VALID TILL", {
      x: startX + 130,
      y: currentY,
      size: 7,
      font: fontBold,
      color: mutedText,
    });

    currentY -= 14;
    page.drawText(`+91 ${student.mobile}`, {
      x: startX,
      y: currentY,
      size: 9,
      font: fontRegular,
      color: darkText,
    });

    const issuedYear = new Date(digitalId.issuedAt).getFullYear();
    page.drawText(`30 JUNE ${issuedYear + 1}`, {
      x: startX + 130,
      y: currentY,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.6, 0.3),
    });

    // 4. Right Section: QR Code Box
    const qrBoxX = cardWidth - 150;
    const qrBoxY = 45;
    const qrBoxSize = 125;

    // QR Code Frame
    page.drawRectangle({
      x: qrBoxX,
      y: qrBoxY,
      width: qrBoxSize,
      height: qrBoxSize,
      color: white,
      borderColor: borderGray,
      borderWidth: 1,
    });

    // Draw QR Code
    page.drawImage(qrImage, {
      x: qrBoxX + 10,
      y: qrBoxY + 18,
      width: 105,
      height: 105,
    });

    // Scan Label
    page.drawText("SCAN TO VERIFY AUTHENTICITY", {
      x: qrBoxX + 8,
      y: qrBoxY + 6,
      size: 6.5,
      font: fontBold,
      color: accentIndigo,
    });

    // 5. Card Footer
    page.drawLine({
      start: { x: 20, y: 32 },
      end: { x: cardWidth - 20, y: 32 },
      thickness: 0.5,
      color: borderGray,
    });

    page.drawText(
      "Notice: This pass is non-transferable and must be presented to bus conductor upon boarding.",
      {
        x: 20,
        y: 16,
        size: 6.5,
        font: fontOblique,
        color: mutedText,
      }
    );

    page.drawText("Authorized Signatory: Transport Officer", {
      x: cardWidth - 180,
      y: 16,
      size: 6.5,
      font: fontBold,
      color: primaryNavy,
    });

    // Serialize to bytes (in memory, no disk writing)
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="College-Bus-Pass-${digitalId.idNumber}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("GET /api/student/id/download error:", error);
    return NextResponse.json(
      { error: "Failed to generate serverless PDF bus pass" },
      { status: 500 }
    );
  }
}
