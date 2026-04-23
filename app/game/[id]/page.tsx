import Link from "next/link";

interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube: string;
  [key: string]: string | null | undefined;
}

async function fetchMealById(mealId: number): Promise<Meal | null> {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return null;
  const data = await res.json();
  console.log(data);
  return data?.meals?.[0] ?? null;
}

async function fetchMealByLetter(appid: number): Promise<Meal | null> {
  const letter = "abcdefghijklmnopqrstuvwxyz"[appid % 26];
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return null;
  const data = await res.json();
  console.log(data);
  const meals: Meal[] = data?.meals ?? [];
  if (meals.length === 0) return null;
  return meals[appid % meals.length];
}

async function getMeal(
  appid: number,
): Promise<{ meal: Meal; fromFallback: boolean } | null> {
  const primaryId = appid + 52802;
  const primary = await fetchMealById(primaryId);
  if (primary) return { meal: primary, fromFallback: false };

  const fallback = await fetchMealByLetter(appid);
  if (fallback) return { meal: fallback, fromFallback: true };

  return null;
}

function getIngredients(meal: Meal) {
  const items: { ingredient: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      items.push({
        ingredient: ingredient.trim(),
        measure: (measure ?? "").trim(),
      });
    }
  }
  return items;
}

function NavHeader() {
  return (
    <>
      <header
        style={{
          backgroundColor: "#171a21",
          borderBottom: "2px solid #4c6b22",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-8">
          <Link
            href="/"
            style={{
              color: "#66c0f4",
              fontSize: "22px",
              fontWeight: "bold",
              letterSpacing: "2px",
              textDecoration: "none",
            }}
          >
            STEAM
          </Link>
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
    </>
  );
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appid = parseInt(id, 10);
  const result = await getMeal(appid);
  const meal = result?.meal ?? null;
  const fromFallback = result?.fromFallback ?? false;
  const ingredients = meal ? getIngredients(meal) : [];

  const tags = meal
    ? Array.from(
        new Set([
          meal.strCategory,
          meal.strArea,
          "Cooking",
          "Simulation",
          "Relaxing",
        ]),
      )
    : [];

  return (
    <div
      style={{
        backgroundColor: "#1b2838",
        minHeight: "100vh",
        fontFamily: "'Motiva Sans', Arial, sans-serif",
      }}
    >
      <NavHeader />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div
          style={{ color: "#c6d4df", fontSize: "12px", marginBottom: "12px" }}
        >
          <Link href="/" style={{ color: "#66c0f4", textDecoration: "none" }}>
            All Games
          </Link>
          <span style={{ margin: "0 6px", color: "#4f6a84" }}>&gt;</span>
          <span>{meal ? meal.strMeal : `App ${appid}`}</span>
        </div>

        {meal ? (
          <>
            {fromFallback && (
              <div
                style={{
                  backgroundColor: "#4c6b2240",
                  border: "1px solid #4c6b22",
                  borderRadius: "3px",
                  padding: "10px 16px",
                  marginBottom: "16px",
                  color: "#a4d007",
                  fontSize: "13px",
                }}
              >
                ℹ️ No hay una receta directa para este juego (ID {appid + 52802}
                ). Mostrando receta alternativa.
              </div>
            )}

            {/* Title */}
            <h1
              style={{
                color: "#c6d4df",
                fontSize: "26px",
                fontWeight: "normal",
                marginBottom: "16px",
              }}
            >
              {meal.strMeal}
            </h1>

            {/* Main content */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left column — sidebar */}
              <div className="lg:w-72 flex-shrink-0">
                {/* Thumbnail */}
                <div
                  style={{
                    borderRadius: "3px",
                    overflow: "hidden",
                    marginBottom: "12px",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    style={{ width: "100%", display: "block" }}
                  />
                </div>

                {/* Screenshots row */}
                <div className="grid grid-cols-3 gap-1 mb-4">
                  {([0, 1, 2] as const).map((i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: "2px",
                        overflow: "hidden",
                        aspectRatio: "4/3",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={meal.strMealThumb}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          filter:
                            i === 1
                              ? "brightness(0.8)"
                              : i === 2
                                ? "hue-rotate(30deg) brightness(0.9)"
                                : "none",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Game details panel */}
                <div
                  style={{
                    backgroundColor: "#16202d",
                    borderRadius: "3px",
                    padding: "16px",
                    marginBottom: "12px",
                  }}
                >
                  <h3
                    style={{
                      color: "#66c0f4",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      margin: "0 0 12px",
                    }}
                  >
                    Game Details
                  </h3>
                  <div
                    style={{
                      borderTop: "1px solid #2a475e",
                      paddingTop: "12px",
                    }}
                  >
                    {[
                      { label: "Genre:", value: meal.strCategory },
                      { label: "Developer:", value: `${meal.strArea} Kitchen` },
                      { label: "Publisher:", value: "MealDB Studios" },
                      { label: "Release Date:", value: "12 Feb, 2024" },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex justify-between mb-2"
                        style={{ fontSize: "12px" }}
                      >
                        <span style={{ color: "#4f6a84" }}>{label}</span>
                        <span style={{ color: "#66c0f4" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags — keys use index to avoid duplicates when category/area match hardcoded tags */}
                <div
                  style={{
                    backgroundColor: "#16202d",
                    borderRadius: "3px",
                    padding: "16px",
                    marginBottom: "12px",
                  }}
                >
                  <h3
                    style={{
                      color: "#66c0f4",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      margin: "0 0 10px",
                    }}
                  >
                    Popular User-Defined Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          backgroundColor: "#1b2838",
                          border: "1px solid #4c6b22",
                          color: "#c6d4df",
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "2px",
                          cursor: "pointer",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Buy box */}
                <div
                  style={{
                    backgroundColor: "#c6d4df0d",
                    border: "1px solid #4c6b22",
                    borderRadius: "3px",
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      color: "#c6d4df",
                      fontSize: "13px",
                      marginBottom: "12px",
                    }}
                  >
                    Buy <strong>{meal.strMeal}</strong>
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      style={{
                        backgroundColor: "#4c6b22",
                        color: "#a4d007",
                        fontSize: "13px",
                        padding: "2px 6px",
                        borderRadius: "2px",
                      }}
                    >
                      -75%
                    </span>
                    <div className="text-right">
                      <span
                        style={{
                          color: "#738895",
                          fontSize: "11px",
                          textDecoration: "line-through",
                        }}
                      >
                        $59.99
                      </span>
                      <span
                        style={{
                          color: "#a4d007",
                          fontSize: "18px",
                          marginLeft: "8px",
                        }}
                      >
                        $14.99
                      </span>
                    </div>
                  </div>
                  <button
                    style={{
                      width: "100%",
                      border: "none",
                      borderRadius: "2px",
                      color: "#ffffff",
                      fontSize: "13px",
                      padding: "10px",
                      cursor: "pointer",
                      backgroundImage:
                        "linear-gradient(90deg, #4cabf7 0%, #2a8ac9 100%)",
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Right column — main content */}
              <div className="flex-1 min-w-0">
                {/* Hero image */}
                <div
                  style={{
                    borderRadius: "3px",
                    overflow: "hidden",
                    marginBottom: "20px",
                    position: "relative",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    style={{
                      width: "100%",
                      display: "block",
                      maxHeight: "350px",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "80px",
                      background: "linear-gradient(transparent, #1b2838)",
                    }}
                  />
                </div>

                {/* Short description */}
                <div
                  style={{
                    backgroundColor: "#16202d",
                    borderRadius: "3px",
                    padding: "20px",
                    marginBottom: "16px",
                    borderLeft: "3px solid #66c0f4",
                  }}
                >
                  <p
                    style={{
                      color: "#c6d4df",
                      fontSize: "13px",
                      lineHeight: "1.7",
                      margin: 0,
                    }}
                  >
                    Experience the authentic taste of{" "}
                    <strong style={{ color: "#66c0f4" }}>{meal.strArea}</strong>{" "}
                    cuisine with this classic{" "}
                    <strong style={{ color: "#66c0f4" }}>
                      {meal.strCategory}
                    </strong>{" "}
                    dish. A culinary adventure awaits — rated{" "}
                    <strong style={{ color: "#a4d007" }}>
                      Overwhelmingly Positive
                    </strong>{" "}
                    by thousands of chefs worldwide.
                  </p>
                </div>

                {/* Reviews */}
                <div
                  style={{
                    backgroundColor: "#16202d",
                    borderRadius: "3px",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div className="flex gap-8" style={{ fontSize: "12px" }}>
                    <div>
                      <p style={{ color: "#4f6a84", margin: "0 0 4px" }}>
                        Recent Reviews:
                      </p>
                      <span style={{ color: "#66c0f4" }}>Very Positive</span>
                      <span style={{ color: "#4f6a84", marginLeft: "6px" }}>
                        (1,234)
                      </span>
                    </div>
                    <div>
                      <p style={{ color: "#4f6a84", margin: "0 0 4px" }}>
                        All Reviews:
                      </p>
                      <span style={{ color: "#66c0f4" }}>
                        Overwhelmingly Positive
                      </span>
                      <span style={{ color: "#4f6a84", marginLeft: "6px" }}>
                        (45,678)
                      </span>
                    </div>
                  </div>
                </div>

                {/* About this game */}
                <div
                  style={{
                    backgroundColor: "#16202d",
                    borderRadius: "3px",
                    padding: "20px",
                    marginBottom: "16px",
                  }}
                >
                  <h2
                    style={{
                      color: "#c6d4df",
                      fontSize: "16px",
                      fontWeight: "normal",
                      borderBottom: "1px solid #2a475e",
                      paddingBottom: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    ABOUT THIS GAME
                  </h2>
                  <p
                    style={{
                      color: "#c6d4df",
                      fontSize: "13px",
                      lineHeight: "1.8",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {meal.strInstructions}
                  </p>
                </div>

                {/* Ingredients */}
                <div
                  style={{
                    backgroundColor: "#16202d",
                    borderRadius: "3px",
                    padding: "20px",
                    marginBottom: "16px",
                  }}
                >
                  <h2
                    style={{
                      color: "#c6d4df",
                      fontSize: "16px",
                      fontWeight: "normal",
                      borderBottom: "1px solid #2a475e",
                      paddingBottom: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    SYSTEM REQUIREMENTS{" "}
                    <span style={{ color: "#4f6a84", fontSize: "12px" }}>
                      (Ingredients)
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ingredients.map(({ ingredient, measure }, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3"
                        style={{
                          borderBottom: "1px solid #2a475e20",
                          paddingBottom: "8px",
                        }}
                      >
                        <span style={{ color: "#a4d007", fontSize: "16px" }}>
                          ✓
                        </span>
                        <span
                          style={{
                            color: "#66c0f4",
                            fontSize: "13px",
                            minWidth: "80px",
                          }}
                        >
                          {measure}
                        </span>
                        <span style={{ color: "#c6d4df", fontSize: "13px" }}>
                          {ingredient}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* YouTube link */}
                {meal.strYoutube && (
                  <div
                    style={{
                      backgroundColor: "#16202d",
                      borderRadius: "3px",
                      padding: "16px",
                    }}
                  >
                    <h3
                      style={{
                        color: "#c6d4df",
                        fontSize: "14px",
                        fontWeight: "normal",
                        marginBottom: "12px",
                      }}
                    >
                      Video Walkthrough
                    </h3>
                    <a
                      href={meal.strYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        backgroundColor: "#c6262640",
                        border: "1px solid #c62626",
                        color: "#ffffff",
                        padding: "8px 16px",
                        borderRadius: "2px",
                        fontSize: "13px",
                        textDecoration: "none",
                      }}
                    >
                      ▶ Watch on YouTube
                    </a>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              backgroundColor: "#16202d",
              borderRadius: "3px",
              padding: "48px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</div>
            <h2
              style={{
                color: "#c6d4df",
                fontSize: "20px",
                fontWeight: "normal",
                marginBottom: "12px",
              }}
            >
              Recipe Not Found
            </h2>
            <p
              style={{
                color: "#4f6a84",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              No se pudo encontrar ninguna receta para este juego.
            </p>
            <Link
              href="/"
              style={{
                backgroundColor: "#4cabf7",
                color: "#ffffff",
                padding: "10px 24px",
                borderRadius: "2px",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              ← Back to Store
            </Link>
          </div>
        )}
      </main>

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
          </div>
        </div>
      </footer>
    </div>
  );
}
