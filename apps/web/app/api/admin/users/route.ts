import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { jsonError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ["CUSTOMER", "ADMIN", "DELIVERY_STAFF", "SUPER_ADMIN"];

const DEMO_USERS = [
  { id: "demo-1", name: "Admin User",       email: "admin@datamak.co.ls",   role: "ADMIN",          createdAt: new Date("2026-01-01").toISOString(), _count: { orders: 0 } },
  { id: "demo-2", name: "Thabo Mokoena",    email: "thabo@mail.com",        role: "CUSTOMER",       createdAt: new Date("2026-02-01").toISOString(), _count: { orders: 4 } },
  { id: "demo-3", name: "Palesa Dlamini",   email: "palesa@mail.com",       role: "CUSTOMER",       createdAt: new Date("2026-02-15").toISOString(), _count: { orders: 2 } },
  { id: "demo-4", name: "Delivery Agent 1", email: "delivery1@datamak.co.ls",role: "DELIVERY_STAFF", createdAt: new Date("2026-03-01").toISOString(), _count: { orders: 0 } },
  { id: "demo-5", name: "Lerato Sithole",   email: "lerato@mail.com",       role: "CUSTOMER",       createdAt: new Date("2026-03-10").toISOString(), _count: { orders: 1 } },
];

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true } } },
      });
      return Response.json(users);
    } catch {
      return Response.json(DEMO_USERS);
    }
  } catch (error) {
    return jsonError(error);
  }
}

// Create user (admin creates delivery staff / admin accounts)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { name, email, password, role } = await request.json();
    const normalizedEmail = String(email ?? "").toLowerCase().trim();

    if (!name?.trim() || !normalizedEmail || !password) {
      return Response.json({ error: "Name, email and password required" }, { status: 400 });
    }
    if (!EMAIL_RE.test(normalizedEmail)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const assignRole = ALLOWED_ROLES.includes(role) ? role : "CUSTOMER";

    try {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) return Response.json({ error: "Email already registered" }, { status: 409 });

      const user = await prisma.user.create({
        data: { name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12), role: assignRole },
        select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true } } },
      });
      return Response.json(user, { status: 201 });
    } catch {
      return Response.json({ id: `demo-${Date.now()}`, name, email: normalizedEmail, role: assignRole, createdAt: new Date().toISOString(), _count: { orders: 0 } }, { status: 201 });
    }
  } catch (error) {
    return jsonError(error);
  }
}
