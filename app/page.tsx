import Link from "next/link";
import GameCard from "./components/GameCard";

interface Game {
  appid: number;
  name: string;
  imageUrl?: string;
}

async function getFeaturedGames(): Promise<Game[]> {
  const key = process.env.STEAM_API_KEY;
  if (!key) return [];

  const res = await fetch(
    `https://api.steampowered.com/IStoreService/GetAppList/v1/?key=${key}&max_results=500&last_appid=0`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return [];

  const data = await res.json();
  // console.log(data);
  const apps: { appid: number; name: string }[] = data?.response?.apps ?? [];
  return apps
    .filter((app) => app.name.trim() !== "")
    .slice(0, 100)
    .map((app) => ({ appid: app.appid, name: app.name }));
}

async function searchGames(
  query: string,
): Promise<{ total: number; games: Game[] }> {
  const res = await fetch(
    `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`,
    { next: { revalidate: 300 } },
  );
  if (!res.ok) return { total: 0, games: [] };

  const data = await res.json();
  // console.log(data);
  const items: { id: number; name: string; tiny_image: string }[] =
    data?.items ?? [];

  return {
    total: data?.total ?? 0,
    games: items.map((item) => ({
      appid: item.id,
      name: item.name,
      imageUrl: item.tiny_image,
    })),
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const isSearching = query.length > 0;
  const searchResult = isSearching ? await searchGames(query) : null;
  const featured = !isSearching ? await getFeaturedGames() : [];

  return (
    <div
      style={{
        backgroundColor: "#1b2838",
        minHeight: "100vh",
        fontFamily: "'Motiva Sans', Arial, sans-serif",
      }}
    >
      {/* Nav */}
      <header
        style={{
          backgroundColor: "#171a21",
          borderBottom: "2px solid #4c6b22",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-8">
          <span
            style={{
              color: "#66c0f4",
              fontSize: "22px",
              fontWeight: "bold",
              letterSpacing: "2px",
            }}
          >
            STEAM
          </span>
          <nav className="flex gap-6" style={{ fontSize: "13px" }}>
            {(["STORE", "COMMUNITY", "ABOUT", "SUPPORT"] as const).map(
              (item) => (
                <span
                  key={item}
                  style={{
                    color: item === "STORE" ? "#ffffff" : "#c6d4df",
                    cursor: "pointer",
                  }}
                >
                  {item}
                </span>
              ),
            )}
          </nav>
        </div>
      </header>

      {/* Sub-nav */}
      <div
        style={{
          backgroundColor: "#c6d4df10",
          borderBottom: "1px solid #4c6b2240",
        }}
      >
        <div
          className="max-w-7xl mx-auto px-6 py-2 flex gap-6"
          style={{ fontSize: "12px" }}
        >
          {(
            [
              "Your Store",
              "New & Noteworthy",
              "Categories",
              "Points Shop",
              "News",
              "Labs",
            ] as const
          ).map((item) => (
            <span
              key={item}
              style={{
                color: item === "Your Store" ? "#66c0f4" : "#c6d4df",
                cursor: "pointer",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search bar */}
        <form action="/" method="get" className="mb-8">
          <div className="flex gap-2">
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search for a game on Steam..."
                autoComplete="off"
                style={{
                  width: "100%",
                  backgroundColor: "#316282",
                  border: "1px solid #4c7d9a",
                  borderRadius: "3px",
                  color: "#c6d4df",
                  fontSize: "14px",
                  padding: "10px 14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #4cabf7 0%, #2a8ac9 100%)",
                border: "none",
                borderRadius: "3px",
                color: "#ffffff",
                fontSize: "14px",
                padding: "10px 24px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Search
            </button>
            {isSearching && (
              <Link
                href="/"
                style={{
                  backgroundColor: "#2a3f5f",
                  border: "1px solid #4c7d9a",
                  borderRadius: "3px",
                  color: "#c6d4df",
                  fontSize: "14px",
                  padding: "10px 16px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                ✕ Clear
              </Link>
            )}
          </div>
        </form>

        {isSearching ? (
          /* Search results */
          <>
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{
                  color: "#c6d4df",
                  fontSize: "15px",
                  fontWeight: "normal",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Search results for &quot;{query}&quot;
              </h2>
              {searchResult && (
                <span style={{ color: "#4f6a84", fontSize: "12px" }}>
                  {searchResult.total} result
                  {searchResult.total !== 1 ? "s" : ""} found
                </span>
              )}
            </div>

            {searchResult && searchResult.games.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {searchResult.games.map((game, i) => (
                  <Link
                    key={`${game.appid}-${i}`}
                    href={`/game/${game.appid}`}
                    className="block"
                  >
                    <GameCard
                      appid={game.appid}
                      name={game.name}
                      imageUrl={game.imageUrl}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-20 gap-4"
                style={{ color: "#c6d4df" }}
              >
                <span style={{ fontSize: "48px" }}>🔍</span>
                <p style={{ fontSize: "16px" }}>
                  No games found for &quot;{query}&quot;
                </p>
                <p style={{ fontSize: "13px", color: "#4f6a84" }}>
                  Try a different search term
                </p>
              </div>
            )}
          </>
        ) : (
          /* Featured catalog */
          <>
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{
                  color: "#c6d4df",
                  fontSize: "15px",
                  fontWeight: "normal",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Featured &amp; Recommended
              </h2>
              <span
                style={{
                  color: "#66c0f4",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Browse All
              </span>
            </div>

            {featured.length === 0 ? (
              <div
                className="flex items-center justify-center py-20"
                style={{ color: "#c6d4df", fontSize: "14px" }}
              >
                No games available — check your STEAM_API_KEY in .env
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {featured.map((game, i) => (
                  <Link
                    key={`${game.appid}-${i}`}
                    href={`/game/${game.appid}`}
                    className="block"
                  >
                    <GameCard appid={game.appid} name={game.name} />
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2
                  style={{
                    color: "#c6d4df",
                    fontSize: "15px",
                    fontWeight: "normal",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Special Offers
                </h2>
              </div>
              <div
                className="rounded flex items-center justify-center py-16"
                style={{
                  backgroundColor: "#16202d",
                  color: "#4f6a84",
                  fontSize: "14px",
                }}
              >
                Buscá cualquier juego arriba y hacé click para ver su receta
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#171a21",
          borderTop: "1px solid #4c6b2240",
          marginTop: "48px",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div
            style={{ color: "#4f6a84", fontSize: "11px", lineHeight: "1.8" }}
          >
            <p>© 2026 Valve Corporation. All rights reserved.</p>
            <p>
              All trademarks are property of their respective owners in the US
              and other countries.
            </p>
            <p>VAT included in all prices where applicable.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
