import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { comparePassword, createToken } from "@/lib/auth";
import { compare } from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and Password are mandatory" }, { status: 400 });
  }

  const result = await pool.query("SELECT id, email, password FROM users WHERE email = $1", [email]);

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Wrong credentials" }, { status: 401 });
  }

  const user = result.rows[0];
  const valid = await comparePassword(password, user.password);

  if (!valid) {
    return NextResponse.json({ error: "Wrong credentials" }, { status: 401 });
  }

  const token = createToken(user.id);

  const response = NextResponse.json({ user: { id: user.id, email: user.email } });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
