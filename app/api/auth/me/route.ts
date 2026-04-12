import { NextResponse } from "next/server";
import { getUser, getRole } from "@/lib/get-user";

export async function GET() {
  const userId = await getUser();
  const role = await getRole();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ userId, role });
}
