import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { fee: "desc" },
    });

    return NextResponse.json({ routes }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      { error: "Failed to retrieve routes" },
      { status: 500 }
    );
  }
}
