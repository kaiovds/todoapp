import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, firstName, lastName } = body;

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: "All fields are mandatory" }, { status: 400 });
  }

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Email already used" }, { status: 409 });
  }

  const hashedPassword = await hashPassword(password);

  const result = await pool.query("INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email", [
    email,
    hashedPassword,
    firstName,
    lastName,
  ]);

  const user = result.rows[0];
  const token = createToken(user.id);

  const response = NextResponse.json({ user });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
