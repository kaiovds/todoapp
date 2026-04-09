import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/get-user";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (body.tagIds !== undefined) {
    await pool.query("DELETE FROM task_tags WHERE task_id = $1", [id]);
    if (body.tagIds.length > 0) {
      const tagValues = body.tagIds.map((_: number, i: number) => `($1, $${i + 2})`).join(", ");
      await pool.query(`INSERT INTO task_tags (task_id, tag_id) VALUES ${tagValues}`, [id, ...body.tagIds]);
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
        t.id = $1 and t.user_id = $2
      GROUP BY
        t.id`,
      [id, userId],
    );
    return NextResponse.json(result.rows[0]);
  }

  if (body.position !== undefined) {
    await pool.query("UPDATE tasks SET position = $1 WHERE id = $2 AND user_id = $3", [body.position, id, userId]);
    return NextResponse.json({ ok: true });
  }

  const fields: string[] = [];
  const values: (string | boolean | number)[] = [];
  let count = 1;

  if (body.text !== undefined) {
    fields.push(`text = $${count}`);
    values.push(body.text);
    count++;
  }

  if (body.done !== undefined) {
    fields.push(`done = $${count}`);
    values.push(body.done);
    count++;
  }

  values.push(id);
  values.push(userId);

  const result = await pool.query(`UPDATE tasks SET ${fields.join(", ")} WHERE id = $${count} and user_id = $${count + 1} RETURNING *`, values);

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const taskWithTags = await pool.query(
    `SELECT t.*,
    COALESCE(
      json_agg(
          json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color)
      ) FILTER (
          WHERE
              tg.id IS NOT NULL
      ),
      '[]'
    ) AS tags
    FROM tasks t
    LEFT JOIN task_tags tt on tt.task_id = t.id
    LEFT JOIN tags tg on tt.tag_id = tg.id
    WHERE t.id = $1
    GROUP BY t.id`,
    [result.rows[0].id],
  );

  return NextResponse.json(taskWithTags.rows[0]);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [id, userId]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
