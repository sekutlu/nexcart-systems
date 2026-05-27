import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin account (matches hint shown in mobile login screen)
  const adminEmail = "admin@nexcart.com";
  const admin = await prisma.user.upsert({
    where:  { email: adminEmail },
    update: { password: await bcrypt.hash("Admin@12345", 12), role: "ADMIN" },
    create: { name: "Demo Admin", email: adminEmail, password: await bcrypt.hash("Admin@12345", 12), role: "ADMIN" },
  });
  console.log(`✅ Admin: ${admin.email} / Admin@12345`);

  // Super admin
  const superEmail = "superadmin@nexcart.com";
  await prisma.user.upsert({
    where:  { email: superEmail },
    update: {},
    create: { name: "Super Admin", email: superEmail, password: await bcrypt.hash("Super@12345", 12), role: "SUPER_ADMIN" },
  });
  console.log(`✅ Super Admin: ${superEmail} / Super@12345`);

  // Delivery staff
  const deliveryEmail = "delivery@nexcart.com";
  await prisma.user.upsert({
    where:  { email: deliveryEmail },
    update: {},
    create: { name: "Delivery Agent", email: deliveryEmail, password: await bcrypt.hash("Delivery@12345", 12), role: "DELIVERY_STAFF" },
  });
  console.log(`✅ Delivery: ${deliveryEmail} / Delivery@12345`);

  // Demo customer
  const customerEmail = "customer@nexcart.com";
  await prisma.user.upsert({
    where:  { email: customerEmail },
    update: {},
    create: { name: "Demo Customer", email: customerEmail, password: await bcrypt.hash("Customer@12345", 12), role: "CUSTOMER" },
  });
  console.log(`✅ Customer: ${customerEmail} / Customer@12345`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
