import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email    = "admin@nexcart.com";
  const password = await bcrypt.hash("admin1234", 12);

  const admin = await prisma.user.upsert({
    where:  { email },
    update: {},
    create: { name: "Demo Admin", email, password, role: "ADMIN" },
  });

  console.log(`✅ Demo admin ready — email: ${admin.email} | password: admin1234`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
