"use client";

import React from "react";

export function TopographicBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
        opacity: 0.25,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMin slice"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="topo-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
          <pattern
            id="geo-grid-soft"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 120 0 L 0 0 0 120"
              fill="none"
              stroke="#64748b"
              strokeWidth="0.5"
              strokeDasharray="2 4"
              opacity="0.25"
            />
            <circle cx="120" cy="0" r="1" fill="#3b82f6" opacity="0.3" />
            <circle cx="0" cy="0" r="1" fill="#3b82f6" opacity="0.3" />
          </pattern>
        </defs>

        {/* Coordinate Grid */}
        <rect width="100%" height="100%" fill="url(#geo-grid-soft)" />

        {/* Topographic Contour Lines */}
        <g stroke="url(#topo-fade)" strokeWidth="1" fill="none">
          <path d="M-100,200 C300,120 600,340 900,220 C1200,100 1350,280 1600,210" />
          <path d="M-100,280 C260,190 560,410 880,300 C1180,180 1320,350 1600,290" />
          <path d="M-100,360 C220,260 520,480 860,380 C1160,260 1290,420 1600,370" />
          <path d="M-100,440 C180,330 480,550 840,460 C1140,340 1260,490 1600,450" />
        </g>
      </svg>
    </div>
  );
}
