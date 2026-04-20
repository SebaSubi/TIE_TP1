export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const appid = parseInt(id, 10);

  if (isNaN(appid)) {
    return Response.json({ error: "Invalid game ID" }, { status: 400 });
  }

  const mealId = appid + 52802;
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
  );

  if (!res.ok) {
    return Response.json({ error: "Failed to fetch meal" }, { status: 502 });
  }

  const data = await res.json();
  return Response.json(data);
}
