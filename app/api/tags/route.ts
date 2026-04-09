import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/get-user";

export async function GET() {
  const userId = await getUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await pool.query("SELECT * FROM tags WHERE user_id = $1 ORDER BY name ASC", [userId]);
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const userId = await getUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, color } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const result = await pool.query("INSERT INTO tags (name, color, user_id) VALUES ($1, $2, $3) RETURNING *", [name, color || "#6366f1", userId]);
  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function DELETE(request: Request) {
  const userId = await getUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  await pool.query("DELETE FROM tags WHERE id = $1 AND user_id = $2", [id, userId]);
  return NextResponse.json({ deleted: true });
}
