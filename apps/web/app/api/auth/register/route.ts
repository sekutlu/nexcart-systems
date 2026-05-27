import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name?.trim() || !email?.trim() || !password) {
    return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "Email is already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.toLowerCase().trim(), password: await bcrypt.hash(password, 12) },
    select: { id: true, name: true, email: true, role: true },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return Response.json({ user, token }, { status: 201 });
}
