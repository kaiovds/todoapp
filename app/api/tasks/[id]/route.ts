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

  return NextResponse.json(result.rows[0]);
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
