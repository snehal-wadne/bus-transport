import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper: Ensure authenticated user is ADMIN
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return false;
  }
  return true;
}

const createRouteSchema = z.object({
  name: z.string().trim().min(2, "Route name must be at least 2 characters long"),
  fee: z.coerce.number().positive("Route fee must be a positive number"),
});

const updateRouteSchema = z.object({
  id: z.string().min(1, "Route ID is required"),
  name: z.string().trim().min(2, "Route name must be at least 2 characters long"),
  fee: z.coerce.number().positive("Route fee must be a positive number"),
});

// GET /api/admin/routes - List all routes with enrolled student count
export async function GET() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const routes = await prisma.route.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { fee: "desc" },
    });

    const formattedRoutes = routes.map((r) => ({
      id: r.id,
      name: r.name,
      fee: r.fee,
      studentCount: r._count.students,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return NextResponse.json({ routes: formattedRoutes }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/admin/routes error:", error);
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
  }
}

// POST /api/admin/routes - Create a new route
export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = createRouteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: parseResult.error.errors[0]?.message || "Invalid route data",
        },
        { status: 400 }
      );
    }

    const { name, fee } = parseResult.data;

    // Check if route name already exists
    const existing = await prisma.route.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A route with this name already exists" },
        { status: 409 }
      );
    }

    const newRoute = await prisma.route.create({
      data: { name, fee },
    });

    return NextResponse.json(
      {
        message: "Route created successfully",
        route: { ...newRoute, studentCount: 0 },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/routes error:", error);
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 });
  }
}

// PUT /api/admin/routes - Update route name or fee
export async function PUT(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = updateRouteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: parseResult.error.errors[0]?.message || "Invalid route data",
        },
        { status: 400 }
      );
    }

    const { id, name, fee } = parseResult.data;

    // Check if route exists
    const route = await prisma.route.findUnique({
      where: { id },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Check if new name collides with another route
    const duplicate = await prisma.route.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Another route with this name already exists" },
        { status: 409 }
      );
    }

    const updatedRoute = await prisma.route.update({
      where: { id },
      data: { name, fee },
      include: {
        _count: { select: { students: true } },
      },
    });

    return NextResponse.json(
      {
        message: "Route updated successfully",
        route: {
          ...updatedRoute,
          studentCount: updatedRoute._count.students,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/admin/routes error:", error);
    return NextResponse.json({ error: "Failed to update route" }, { status: 500 });
  }
}

// DELETE /api/admin/routes - Delete route (blocked if students are enrolled)
export async function DELETE(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Route ID is required" }, { status: 400 });
    }

    // Check student count
    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Block deleting if route has students
    if (route._count.students > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete route "${route.name}" because ${route._count.students} student(s) are currently enrolled on it.`,
        },
        { status: 400 }
      );
    }

    await prisma.route.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: `Route "${route.name}" deleted successfully` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/admin/routes error:", error);
    return NextResponse.json({ error: "Failed to delete route" }, { status: 500 });
  }
}
