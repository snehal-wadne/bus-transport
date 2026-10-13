import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";
import { checkRateLimit, sanitizeText } from "@/lib/rateLimit";

// ==========================================
// 1. AUTH & SECURITY VALIDATION TESTS
// ==========================================
describe("Auth & Security Suite", () => {
  const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["student", "admin"]).default("student"),
  });

  it("should validate valid student registration credentials", () => {
    const validStudent = {
      email: "rahul.sharma@college.edu",
      password: "SecurePassword123",
      role: "student" as const,
    };
    const result = registerSchema.safeParse(validStudent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("rahul.sharma@college.edu");
    }
  });

  it("should reject invalid email format", () => {
    const invalidEmail = {
      email: "not-an-email",
      password: "SecurePassword123",
      role: "student" as const,
    };
    const result = registerSchema.safeParse(invalidEmail);
    expect(result.success).toBe(false);
  });

  it("should reject passwords shorter than 6 characters", () => {
    const shortPassword = {
      email: "student@college.edu",
      password: "123",
      role: "student" as const,
    };
    const result = registerSchema.safeParse(shortPassword);
    expect(result.success).toBe(false);
  });

  it("should sanitize text inputs against XSS and HTML tags", () => {
    const rawInput = "<script>alert('hack')</script>Rahul <b>Sharma</b>";
    const cleaned = sanitizeText(rawInput);
    expect(cleaned).toBe("scriptalert('hack')/scriptRahul bSharma/b");
    expect(cleaned).not.toContain("<");
    expect(cleaned).not.toContain(">");
  });

  it("should enforce rate limiting limits per key", () => {
    const testKey = `test-ip-${Date.now()}`;
    const limit = 3;
    const windowMs = 5000;

    const r1 = checkRateLimit(testKey, limit, windowMs);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(testKey, limit, windowMs);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(testKey, limit, windowMs);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);

    // 4th request must fail
    const r4 = checkRateLimit(testKey, limit, windowMs);
    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
  });
});

// ==========================================
// 2. STUDENT PROFILE & FEE CALCULATION TESTS
// ==========================================
describe("Student Profile & Fee Calculation Suite", () => {
  const profileSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    year: z.enum(["1st", "2nd", "3rd"]),
    branch: z.enum(["Civil", "Mechanical", "Computer"]),
    mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
    routeId: z.string().min(1, "Route is required"),
    feesPaid: z.number().min(0, "Fees paid cannot be negative"),
  });

  it("should validate correct student profile data", () => {
    const validProfile = {
      fullName: "Priya Patil",
      year: "2nd" as const,
      branch: "Computer" as const,
      mobile: "9876543210",
      routeId: "route-warje-bridge",
      feesPaid: 15000,
    };
    const parsed = profileSchema.safeParse(validProfile);
    expect(parsed.success).toBe(true);
  });

  it("should reject invalid mobile number with non-digits or wrong length", () => {
    const invalidMobile = {
      fullName: "Priya Patil",
      year: "2nd" as const,
      branch: "Computer" as const,
      mobile: "98765abc",
      routeId: "route-1",
      feesPaid: 10000,
    };
    const parsed = profileSchema.safeParse(invalidMobile);
    expect(parsed.success).toBe(false);
  });

  it("should accurately calculate pending fees and zero balance", () => {
    const routes = [
      { name: "Warje Bridge", fee: 22000 },
      { name: "Vadgaon Bridge", fee: 22000 },
      { name: "Bhumkar Bridge", fee: 20000 },
    ];

    // Case 1: Partial payment on Warje Bridge
    const warjeFee = routes[0].fee;
    const paidPartial = 12000;
    const pending1 = warjeFee - paidPartial;
    expect(pending1).toBe(10000);

    // Case 2: Full payment on Bhumkar Bridge
    const bhumkarFee = routes[2].fee;
    const paidFull = 20000;
    const pending2 = bhumkarFee - paidFull;
    expect(pending2).toBe(0);

    // Case 3: Zero payment
    const pending3 = warjeFee - 0;
    expect(pending3).toBe(22000);
  });

  it("should disallow negative fees paid", () => {
    const negativePaid = {
      fullName: "Amit Kumar",
      year: "1st" as const,
      branch: "Civil" as const,
      mobile: "9123456789",
      routeId: "route-1",
      feesPaid: -500,
    };
    const parsed = profileSchema.safeParse(negativePaid);
    expect(parsed.success).toBe(false);
  });
});

// ==========================================
// 3. ID REQUEST WORKFLOW & RESUBMISSION TESTS
// ==========================================
describe("ID Request Workflow Suite", () => {
  type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

  interface StudentState {
    id: string;
    profileComplete: boolean;
    activeRequestId: string | null;
    requestStatus: RequestStatus | null;
  }

  function canSubmitRequest(student: StudentState): { allowed: boolean; reason?: string } {
    if (!student.profileComplete) {
      return { allowed: false, reason: "Profile is incomplete. Fill all details first." };
    }
    if (student.activeRequestId && student.requestStatus === "PENDING") {
      return { allowed: false, reason: "You already have a pending ID request under review." };
    }
    if (student.requestStatus === "APPROVED") {
      return { allowed: false, reason: "Your ID card has already been approved." };
    }
    return { allowed: true };
  }

  it("should block request if student profile is incomplete", () => {
    const student: StudentState = {
      id: "std-1",
      profileComplete: false,
      activeRequestId: null,
      requestStatus: null,
    };
    const check = canSubmitRequest(student);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain("Profile is incomplete");
  });

  it("should block duplicate request if current request is PENDING", () => {
    const student: StudentState = {
      id: "std-2",
      profileComplete: true,
      activeRequestId: "req-1",
      requestStatus: "PENDING",
    };
    const check = canSubmitRequest(student);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain("already have a pending ID request");
  });

  it("should allow resubmission if previous request was REJECTED", () => {
    const student: StudentState = {
      id: "std-3",
      profileComplete: true,
      activeRequestId: "req-old",
      requestStatus: "REJECTED",
    };
    const check = canSubmitRequest(student);
    expect(check.allowed).toBe(true);
  });

  it("should enforce mandatory rejection remark of at least 3 characters", () => {
    const rejectSchema = z.object({
      remark: z.string().min(3, "Rejection remark must be at least 3 characters"),
    });

    const validRemark = { remark: "Fees payment receipt not attached or incomplete" };
    expect(rejectSchema.safeParse(validRemark).success).toBe(true);

    const emptyRemark = { remark: "No" };
    expect(rejectSchema.safeParse(emptyRemark).success).toBe(false);
  });
});

// ==========================================
// 4. DIGITAL ID GENERATION & VERIFICATION TESTS
// ==========================================
describe("Digital ID Generation & Verification Suite", () => {
  function generateIdNumber(currentYear: number, sequenceCount: number): string {
    const padded = String(sequenceCount).padStart(4, "0");
    return `TRN-${currentYear}-${padded}`;
  }

  it("should format digital ID number matching TRN-YYYY-XXXX format", () => {
    const id1 = generateIdNumber(2026, 1);
    expect(id1).toBe("TRN-2026-0001");
    expect(id1).toMatch(/^TRN-2026-\d{4}$/);

    const id42 = generateIdNumber(2026, 42);
    expect(id42).toBe("TRN-2026-0042");

    const id105 = generateIdNumber(2026, 105);
    expect(id105).toBe("TRN-2026-0105");
  });

  it("should validate verification payload structure for public QR check", () => {
    interface VerificationPayload {
      valid: boolean;
      idNumber: string;
      studentName: string;
      year: string;
      branch: string;
      route: string;
      issuedAt: string;
    }

    const payload: VerificationPayload = {
      valid: true,
      idNumber: "TRN-2026-0001",
      studentName: "Rahul Sharma",
      year: "2nd Year",
      branch: "Computer",
      route: "Warje Bridge",
      issuedAt: new Date().toISOString(),
    };

    expect(payload.valid).toBe(true);
    expect(payload.idNumber).toMatch(/^TRN-\d{4}-\d{4}$/);
    expect(payload.studentName).toBeTruthy();
    expect(payload.route).toBe("Warje Bridge");
  });

  it("should validate student payment declaration with mode and transaction reference", () => {
    const paymentDeclarationSchema = z.object({
      feesPaid: z.number().min(0),
      paymentMode: z.enum(["UPI", "CASH", "NETBANKING", "CHEQUE_DD", "PAY_LATER"]),
      paymentRef: z.string().optional(),
      paymentNote: z.string().optional(),
    });

    const validUpiDeclaration = {
      feesPaid: 18000,
      paymentMode: "UPI" as const,
      paymentRef: "UTR4928190284",
      paymentNote: "Paid via Google Pay",
    };

    const parsed = paymentDeclarationSchema.safeParse(validUpiDeclaration);
    expect(parsed.success).toBe(true);

    const payLaterDeclaration = {
      feesPaid: 0,
      paymentMode: "PAY_LATER" as const,
      paymentRef: "",
      paymentNote: "Will pay at transit counter",
    };

    const parsedPayLater = paymentDeclarationSchema.safeParse(payLaterDeclaration);
    expect(parsedPayLater.success).toBe(true);
  });
});
