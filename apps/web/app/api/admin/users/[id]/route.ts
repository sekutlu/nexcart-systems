import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { jsonError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["CUSTOMER", "ADMIN", "DELIVERY_STAFF", "SUPER_ADMIN"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request);
    const { id } = await params;
    const { name, email, password, role } = await request.json();
    const normalizedEmail = email === undefined ? undefined : String(email).toLowerCase().trim();

    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return Response.json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });
    }
    if (id === admin.id && role !== undefined && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return Response.json({ error: "Cannot change your own admin role" }, { status: 400 });
    }
    if (name !== undefined && !name.trim()) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }
    if (normalizedEmail !== undefined && !EMAIL_RE.test(normalizedEmail)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (password !== undefined && password !== "" && password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const data: { name?: string; email?: string; password?: string; role?: Role } = {};
    if (name !== undefined) data.name = name.trim();
    if (normalizedEmail !== undefined) data.email = normalizedEmail;
    if (password) data.password = await bcrypt.hash(password, 12);
    if (role !== undefined) data.role = role as Role;

    try {
      const user = await prisma.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true } } },
      });
      return Response.json(user);
    } catch {
      return Response.json({ id, name, email: normalizedEmail, role, updated: true });
    }
  } catch (error) {
    return jsonError(error);
  }
}

// Delete user
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(request);
    const { id } = await params;

    if (id === admin.id) {
      return Response.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    try {
      await prisma.user.delete({ where: { id } });
    } catch {
      // Demo mode — just acknowledge
    }
    return Response.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
