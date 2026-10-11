import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && session.user.role === "ADMIN" ? session.user : null;
}

const createAdminSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
});

const updateCredentialsSchema = z.object({
  newEmail: z.string().email("Invalid email").optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
});

// GET /api/admin/admins - List all administrators
export async function GET() {
  try {
    const adminUser = await checkAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const admins = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            fullName: true,
            branch: true,
            year: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ admins }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/admin/admins error:", error);
    return NextResponse.json({ error: "Failed to fetch administrators" }, { status: 500 });
  }
}

// POST /api/admin/admins - Create a new Admin account (e.g. HOD Sir)
export async function POST(req: Request) {
  try {
    const adminUser = await checkAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = createAdminSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const email = parseResult.data.email.trim().toLowerCase();
    const password = parseResult.data.password;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists as student, upgrade them to admin
      if (existingUser.role !== Role.ADMIN) {
        const upgraded = await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: Role.ADMIN },
          select: { id: true, email: true, role: true, createdAt: true },
        });
        return NextResponse.json(
          {
            message: `User ${email} was found and has been successfully granted Admin privileges.`,
            admin: upgraded,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "An administrator with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.ADMIN,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: `Admin account for ${email} created successfully. They can now log in directly!`,
        admin: newAdmin,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/admins error:", error);
    return NextResponse.json({ error: "Failed to create administrator account" }, { status: 500 });
  }
}

// PUT /api/admin/admins - Update personal credentials (Email/Password)
export async function PUT(req: Request) {
  try {
    const adminUser = await checkAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = updateCredentialsSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Invalid credentials format" },
        { status: 400 }
      );
    }

    const { newEmail, newPassword } = parseResult.data;
    const updateData: any = {};

    if (newEmail) {
      const email = newEmail.trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== adminUser.id) {
        return NextResponse.json(
          { error: "That email is already in use by another account." },
          { status: 409 }
        );
      }
      updateData.email = email;
    }

    if (newPassword) {
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: adminUser.id },
      data: updateData,
      select: { id: true, email: true, role: true, updatedAt: true },
    });

    return NextResponse.json(
      {
        message: "Your admin credentials have been successfully updated.",
        user: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/admin/admins error:", error);
    return NextResponse.json({ error: "Failed to update admin credentials" }, { status: 500 });
  }
}
