import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return Response.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
