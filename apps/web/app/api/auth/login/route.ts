import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const normalizedEmail = String(email ?? "").toLowerCase().trim();

  if (!normalizedEmail || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return Response.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("DATABASE_URL")) {
      return Response.json({ error: "Database is not configured. Add DATABASE_URL in Vercel Environment Variables." }, { status: 503 });
    }
    return Response.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
