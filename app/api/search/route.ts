import { type NextRequest } from "next/server";

interface SteamSearchItem {
  id: number;
  name: string;
  tiny_image: string;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return Response.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const res = await fetch(
    `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&l=english&cc=US`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) {
    return Response.json({ error: "Failed to reach Steam search API" }, { status: 502 });
  }

  const data = await res.json();
  const items: SteamSearchItem[] = data?.items ?? [];

  return Response.json({
    total: data?.total ?? 0,
    games: items.map((item) => ({
      appid: item.id,
      name: item.name,
      imageUrl: item.tiny_image,
    })),
  });
}
