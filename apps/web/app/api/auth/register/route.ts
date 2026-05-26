import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return Response.json({ error: "Email is already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10)
    },
    select: { id: true, name: true, email: true, role: true }
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return Response.json({ user, token }, { status: 201 });
}
