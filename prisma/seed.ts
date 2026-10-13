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

  // 2. Seed the 3 Boarding Stops on the Campus Transit Corridor
  const targetStops = [
    { name: "Warje Bridge Flyover", fee: 22000 },
    { name: "Vadgaon Bridge", fee: 22000 },
    { name: "Narhe", fee: 20000 },
  ];

  const stopMap: Record<string, string> = {};

  for (const stop of targetStops) {
    const upsertedRoute = await prisma.route.upsert({
      where: { name: stop.name },
      update: { fee: stop.fee },
      create: { name: stop.name, fee: stop.fee },
    });
    stopMap[stop.name] = upsertedRoute.id;
    console.log(`✅ Stop ready: ${upsertedRoute.name} - ₹${upsertedRoute.fee}`);
  }

  // Re-assign any students attached to old/legacy route names to Warje Bridge Flyover
  const defaultStopId = stopMap["Warje Bridge Flyover"];
  const targetNames = targetStops.map((s) => s.name);

  const obsoleteRoutes = await prisma.route.findMany({
    where: {
      name: { notIn: targetNames },
    },
    include: { students: true },
  });

  for (const oldRoute of obsoleteRoutes) {
    if (oldRoute.students.length > 0) {
      console.log(`🔄 Re-assigning ${oldRoute.students.length} student(s) from "${oldRoute.name}" to default stop...`);
      await prisma.student.updateMany({
        where: { routeId: oldRoute.id },
        data: { routeId: defaultStopId },
      });
    }
    await prisma.route.delete({ where: { id: oldRoute.id } });
    console.log(`🗑️ Removed obsolete route: ${oldRoute.name}`);
  }

  console.log("🎉 Seeding completed successfully with exactly 3 corridor stops!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
