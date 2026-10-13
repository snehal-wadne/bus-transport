import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, sanitizeText } from "@/lib/rateLimit";

const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: Request) {
  try {
    // Rate Limit: 5 requests per minute per IP
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous-client";
    const rateCheck = checkRateLimit(`register:${ip}`, 5, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: "Too many registration attempts. Please wait a minute before trying again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.resetInMs / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json();

    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: parseResult.error.errors[0]?.message || "Invalid input data",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const email = parseResult.data.email.trim().toLowerCase();
    const password = parseResult.data.password;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create student user
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.STUDENT,
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
        message: "Registration successful. You can now log in.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    const errorMessage = error?.message || "";
    const lowerMessage = errorMessage.toLowerCase();
    const isDbError =
      Boolean(error?.code?.startsWith?.("P")) ||
      Boolean(error?.errorCode?.startsWith?.("P")) ||
      Boolean(error?.name?.toLowerCase()?.includes("prisma")) ||
      lowerMessage.includes("database") ||
      lowerMessage.includes("can't reach database server") ||
      lowerMessage.includes("tenant/user") ||
      lowerMessage.includes("econnrefused") ||
      lowerMessage.includes("connection") ||
      lowerMessage.includes("postgresql") ||
      lowerMessage.includes("postgres") ||
      lowerMessage.includes("password authentication failed") ||
      lowerMessage.includes("environment variable");

    let clientError = "Internal server error during registration";
    if (isDbError) {
      clientError =
        "Database connection error. Please ensure PostgreSQL is running and DATABASE_URL in .env is valid.";
    } else if (errorMessage && process.env.NODE_ENV !== "production") {
      clientError = `Registration error: ${errorMessage}`;
    }

    return NextResponse.json(
      {
        error: clientError,
        details: process.env.NODE_ENV !== "production" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
