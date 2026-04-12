import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRole } from "@/lib/get-user";

export async function GET() {
  const role = await getRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await pool.query("SELECT id, email, first_name, last_name, role FROM users ORDER BY created_at ASC");

  return NextResponse.json(result.rows);
}

export async function PATCH(request: Request) {
  const role = await getRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const result = await pool.query("UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, first_name, last_name, role", [body.role, body.id]);

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}
