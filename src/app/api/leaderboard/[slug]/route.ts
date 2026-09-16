import { NextResponse } from "next/server";
import { getLeaderboardData } from "@/lib/leaderboardData";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getLeaderboardData(slug);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
