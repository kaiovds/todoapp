import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRole } from "@/lib/get-user";

export async function GET() {
  const role = await getRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await pool.query(
    `SELECT
      t.*,
      u.email AS user_email,
      u.first_name,
      u.last_name,
      COALESCE(
        json_agg(json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color))
        FILTER (WHERE tg.id IS NOT NULL), '[]'
      ) AS tags
    FROM tasks t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN task_tags tt ON tt.task_id = t.id
      LEFT JOIN tags tg ON tt.tag_id = tg.id
    GROUP BY t.id, u.email, u.first_name, u.last_name
    ORDER BY t.created_at DESC`,
  );

  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const role = await getRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const countResult = await pool.query("SELECT COUNT(*) FROM tasks WHERE user_id = $1", [body.user_id]);
  const position = parseInt(countResult.rows[0].count);

  const result = await pool.query(
    `INSERT INTO tasks (text, description, due_date, user_id, position)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [body.text, body.description ?? null, body.due_date ?? null, body.user_id, position],
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
