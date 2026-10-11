import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Admin User
  const adminEmail = "admin@college.com";
  const adminPassword = "Admin@123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Admin user ready: ${admin.email} (Role: ${admin.role})`);

  // 2. Seed Default Route (Single unified route)
  const initialRoutes = [
    { name: "Warje - Vadgaon - Navale - Narhe - Bhumkar Route", fee: 22000 },
  ];

  for (const route of initialRoutes) {
    const upsertedRoute = await prisma.route.upsert({
      where: { name: route.name },
      update: { fee: route.fee },
      create: { name: route.name, fee: route.fee },
    });
    console.log(`✅ Route ready: ${upsertedRoute.name} - ₹${upsertedRoute.fee}`);
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
