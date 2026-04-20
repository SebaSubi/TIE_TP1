"use client";

import { useState } from "react";

interface Props {
  appid: number;
  name: string;
  imageUrl?: string;
}

export default function GameCard({ appid, name, imageUrl }: Props) {
  const [imgError, setImgError] = useState(false);
  const src = imageUrl ?? `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;

  return (
    <div
      style={{
        backgroundColor: "#16202d",
        borderRadius: "3px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.1s ease, box-shadow 0.1s ease",
      }}
      className="hover:scale-[1.03] hover:shadow-lg"
    >
      <div style={{ position: "relative", width: "100%", paddingTop: "46.7%" }}>
        {imgError ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#2a475e",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="2" fill="#1b2838" />
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#66c0f4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ color: "#4f6a84", fontSize: "10px" }}>No Image</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      <div style={{ padding: "8px 8px 10px" }}>
        <p
          style={{
            color: "#c6d4df",
            fontSize: "12px",
            margin: 0,
            lineHeight: "1.4",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {name}
        </p>
        <div className="mt-1 flex items-center gap-1">
          <span style={{ backgroundColor: "#4c6b22", color: "#a4d007", fontSize: "10px", padding: "1px 4px", borderRadius: "2px" }}>
            PLAY
          </span>
        </div>
      </div>
    </div>
  );
}
