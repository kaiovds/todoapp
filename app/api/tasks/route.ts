import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/get-user";

export async function GET() {
  const userId = await getUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await pool.query(
    `SELECT
      t.*,
      COALESCE(
          json_agg(
              json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color)
          ) FILTER (
              WHERE
                  tg.id IS NOT NULL
          ),
          '[]'
      ) AS tags
    FROM
      tasks t
      LEFT JOIN task_tags tt ON t.id = tt.task_id
      LEFT JOIN tags tg ON tt.tag_id = tg.id
    WHERE
      t.user_id = $1
    GROUP BY
      t.id
    ORDER BY
      t.position ASC,
      t.created_at ASC`,
    [userId],
  );
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const userId = await getUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const countResult = await pool.query("SELECT COUNT(*) FROM tasks WHERE user_id = $1", [userId]);
  const position = parseInt(countResult.rows[0].count);

  const result = await pool.query(
    `INSERT INTO tasks (text, description, due_date, user_id, position) VALUES ($1, $2, $3, $4, $5) RETURNING *, '[]'::json tags`,
    [body.text, body.description ?? null, body.due_date ?? null, userId, position],
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
