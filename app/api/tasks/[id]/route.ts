import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const fields: string[] = [];
  const values: (string | boolean)[] = [];
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

  const result = await pool.query(`UPDATE tasks SET ${fields.join(", ")} WHERE id = $${count} RETURNING *`, values);

  return NextResponse.json(result.rows[0]);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

  return NextResponse.json({ deleted: true });
}
