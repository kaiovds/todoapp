import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getRole } from "@/lib/get-user";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const result = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
