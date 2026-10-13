import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  const isLocalhost = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
  const isConfigured = Boolean(dbUrl);

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        dbConfigured: isConfigured,
        isLocalhost,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        dbConfigured: isConfigured,
        isLocalhost,
        error: error?.message || "Database connection error",
        advice: isLocalhost
          ? "On Vercel, localhost:5432 cannot be reached. Set DATABASE_URL to a cloud-hosted PostgreSQL database in Vercel Project Settings."
          : !isConfigured
          ? "DATABASE_URL is not set in Vercel Environment Variables."
          : "Check that your database server is active and credentials are correct.",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
