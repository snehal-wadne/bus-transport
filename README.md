# 🚌 College Transport Management Portal

A modern, production-ready, full-stack **College Transport Management System** built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **PostgreSQL (Supabase)**, **Auth.js (NextAuth)**, and serverless **PDF generation** with **QR Code verification**.

---

## 🌟 Key Features

### 🎓 Student Portal (`/student`)
- **Self-Registration & Secure Authentication**: Email + password login with bcrypt encryption and JWT role management.
- **3-Step Application Wizard**:
  - **Step 1 - Personal Details**: Full Name, 10-digit Mobile Number.
  - **Step 2 - Academic Details**: Current Year (`1st`, `2nd`, `3rd`), Branch (`Civil`, `Mechanical`, `Computer`).
  - **Step 3 - Transport & Fees**: Route selection with real-time fee calculation:
    $$\text{Pending Fees} = \text{Route Fee} - \text{Fees Paid}$$
- **Lifecycle Application Tracker**: 3-node animated status indicator (`Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Approved` / `Rejected`).
- **Resubmission on Rejection**: Displays admin rejection remarks and unlocks the profile form for corrections and instant resubmission.
- **3D Flip Digital Bus Pass**:
  - Front view: College branding, photo badge, Student Name, Roll/ID Number, Branch, Route, Validity, and secure QR Code.
  - Back view: Terms of travel, emergency transport office helpline, safety guidelines, and barcode simulation.
- **Serverless PDF Pass Download**: Generates vector-sharp PDF passes in-memory using `pdf-lib` and `qrcode` with zero disk I/O.
- **Notification Dropdown**: Instant in-app alerts whenever pass requests are reviewed or fee payments are recorded.

### 🛡️ Admin Portal (`/admin`)
- **Executive Analytics Dashboard**:
  - Real-time stat cards: Total Students, Pending Requests, Approved Passes, Total Outstanding Fees.
  - Interactive Route Enrollment Distribution Bar Chart.
- **Request Approval Queue**:
  - Filter by status (`Pending`, `Approved`, `Rejected`), live search by student name, filter by branch/route with pagination.
  - Slide-over detail drawer showing academic profile and fee breakdown.
  - **One-Click Approval**: Executes an atomic transaction generating sequential passes (`TRN-2026-XXXX`).
  - **Rejection with Remarks**: Requires constructive feedback to notify the student.
- **Route & Fare Management**:
  - Add, edit, and delete routes with custom fee structures.
  - **Safety Guard**: Prevents deletion of active routes currently assigned to enrolled students.
- **Fee Ledger & Payment Recording**:
  - Financial overview of Total, Paid, and Pending dues (cleared vs. pending status tags).
  - Modal to record student fee payments, auto-updating student balances, logging transaction history, and dispatching notifications.
- **Student Directory & CSV Export**:
  - Search, sort, and filter students by year, branch, and route.
  - One-click server-side CSV export of full student rosters.

### 🔍 Public QR Pass Verification (`/verify/[idNumber]`)
- Scan the QR code on any printed or digital bus pass to verify legitimacy in real-time.
- Displays pass status (✅ Valid / ❌ Invalid), student identity, approved route, and issuance timestamp.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 14 (App Router)** | Full-stack React framework (Server Components & Route Handlers) |
| **TypeScript** | Strict compile-time type safety across the entire application |
| **Tailwind CSS** | Responsive styling, dark/light theme accents, animations |
| **Prisma ORM** | Type-safe database queries and automated schema migrations |
| **PostgreSQL (Supabase)** | Cloud relational database with connection pooling |
| **Auth.js / NextAuth v4** | Credentials provider, bcrypt hashing, JWT session RBAC |
| **pdf-lib & qrcode** | 100% serverless, zero-disk in-memory PDF generation |
| **Vitest** | Comprehensive unit and integration test suite |
| **Lucide React** | Clean, accessible iconography |

---

## ⚡ Default Credentials & Initial Data

### 🔑 Admin Credentials
- **Email**: `admin@college.com`
- **Password**: `Admin@123`

### 🚌 Default Pre-Seeded Bus Routes
1. **Warje Bridge**: ₹22,000 / year
2. **Vadgaon Bridge**: ₹22,000 / year
3. **Bhumkar Bridge**: ₹20,000 / year

---

## 🚀 Local Development Setup (PowerShell)

### 1. Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database (or free Supabase project)

### 2. Clone & Install Dependencies
```powershell
# Navigate into the project folder
cd "c:\Users\Harshal\OneDrive\Desktop\transport bus"

# Install all dependencies
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```

Configure your credentials inside `.env`:
```env
# Supabase pooled connection string (Port 6543, pgbouncer=true)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase direct connection string (Port 5432)
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# NextAuth Secret & URL
NEXTAUTH_SECRET="college-transport-super-secret-jwt-key-32chars"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Push Schema & Seed Database
```powershell
# Push Prisma schema to the database
npx prisma db push

# Seed the database with the default Admin account and Bus Routes
npx prisma db seed
```

### 5. Run Unit & Integration Tests
```powershell
npm test
```

### 6. Run Production Build
```powershell
npm run build
```

### 7. Launch the Local Development Server
```powershell
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Production Deployment Guide (Vercel + Supabase)

### Step 1: Create a Supabase PostgreSQL Database
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings** $\rightarrow$ **Database**, find **Connection string**:
   - Select **Session pooler / Transaction pooler** mode:
     ```
     DATABASE_URL: postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - Select **Direct connection** mode:
     ```
     DIRECT_URL: postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres
     ```

### Step 2: Deploy to Vercel
1. Push your repository to GitHub / GitLab.
2. Go to [vercel.com](https://vercel.com) $\rightarrow$ **Add New Project** $\rightarrow$ Import your repository.
3. In the **Environment Variables** section, configure:
   - `DATABASE_URL` = Your Supabase Pooled URL (`port 6543` with `?pgbouncer=true`)
   - `DIRECT_URL` = Your Supabase Direct URL (`port 5432`)
   - `NEXTAUTH_SECRET` = A strong random 32+ character string (generate via `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = Your custom domain or production Vercel URL (e.g., `https://your-app.vercel.app`)
4. Build Settings:
   - Framework Preset: **Next.js**
   - Build Command: `next build` (Next.js automatically invokes `prisma generate` via `postinstall` script)
5. Click **Deploy**.

### Step 3: Run Migrations & Seed against Production
Run these commands from your local machine targeting production:
```powershell
# Apply schema to production Supabase
npx prisma db push

# Seed production admin and routes
npx prisma db seed
```

---

## 🛡️ Production Checklist & Troubleshooting

| Issue / Alert | Cause | Fix |
| :--- | :--- | :--- |
| **PrismaClientInitializationError: Can't reach database server** | Direct connection timeout on serverless | Ensure `DATABASE_URL` connects via Supabase Transaction Pooler (`port 6543`) with `?pgbouncer=true`. |
| **`NEXTAUTH_URL` Mismatch or Infinite Redirect** | Missing or incorrect production URL | Ensure `NEXTAUTH_URL` on Vercel matches your exact domain `https://<your-project>.vercel.app` (no trailing slash). |
| **Dynamic Server Usage / CSR Bailout** | `useSearchParams()` not wrapped in `<Suspense>` | All pages calling `useSearchParams()` (like `/login`) are wrapped in `<Suspense>` boundaries. |
| **Rate Limit Triggered (HTTP 429)** | Exceeded 5 requests/minute on login/register | In-memory sliding window protects against brute-force attacks; waits 60 seconds to release. |
| **PDF Generation Failing on Serverless** | Relying on filesystem or native canvas binaries | `pdf-lib` + `qrcode` runs 100% in-memory with `Buffer.from(...)` and streams via `NextResponse`. |

---

## 🧪 Test Suite Summary

The application includes 15 automated test cases executed via Vitest:
- ✅ **Auth & Security**: Registration format validation, weak password rejection, XSS/HTML tag sanitization, sliding window rate limiter verification.
- ✅ **Profile & Fee Logic**: Academic branch/year constraints, 10-digit mobile number regex, exact calculation of `pendingFees = routeFee - feesPaid`, zero-balance detection.
- ✅ **ID Workflow & Guards**: Profile completion requirement, pending request locking, rejection remark enforcement ($\ge 3$ characters), resubmission allowance upon rejection.
- ✅ **Digital Pass Issuance**: Sequential ID format verification (`TRN-YYYY-XXXX`), zero-padding logic, public QR code payload verification structure.

---

## 📄 License
This project is developed for educational and institutional transport management purposes. Built with ❤️.
