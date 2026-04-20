export const revalidate = 3600;

export async function GET() {
  const key = process.env.STEAM_API_KEY;
  if (!key) {
    return Response.json({ error: "STEAM_API_KEY not configured" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.steampowered.com/IStoreService/GetAppList/v1/?key=${key}&max_results=500&last_appid=0`
  );

  if (!res.ok) {
    return Response.json({ error: "Failed to fetch from Steam API" }, { status: 502 });
  }

  const data = await res.json();
  const apps: { appid: number; name: string }[] = data?.response?.apps ?? [];
  const games = apps.filter((app) => app.name.trim() !== "").slice(0, 100);

  return Response.json({ games });
}
