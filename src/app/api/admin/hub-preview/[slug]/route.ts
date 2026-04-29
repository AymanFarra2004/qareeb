import { cookies } from "next/headers";
import { CONFIG } from "@/src/config";

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const apiUrl = `${CONFIG.API_URL}/api/v1/hubs/${slug}`;

  const res = await fetch(apiUrl, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 0 },
  });

  const body = await res.json();

  return NextResponse.json(body, { status: res.status });
}
