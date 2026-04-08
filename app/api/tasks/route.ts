import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/get-user";

export async function GET() {
  const userId = await getUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await pool.query("SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at ASC", [userId]);
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const userId = await getUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = await pool.query("INSERT INTO tasks (text, user_id) VALUES ($1, $2) RETURNING *", [body.text, userId]);
  return NextResponse.json(result.rows[0], { status: 201 });
}
