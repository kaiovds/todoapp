import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query("SELECT * FROM tasks ORDER BY created_at ASC");
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await pool.query("INSERT INTO tasks (text) VALUES ($1) RETURNING *", [body.text]);
  return NextResponse.json(result.rows[0], { status: 201 });
}
