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
        opacity: 0.35,
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
            <stop offset="0%" stopColor="#64754b" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#64754b" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#64754b" stopOpacity="0.0" />
          </linearGradient>
          <pattern
            id="geo-grid"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 120 0 L 0 0 0 120"
              fill="none"
              stroke="#64754b"
              strokeWidth="0.5"
              strokeDasharray="2 4"
              opacity="0.3"
            />
            <circle cx="120" cy="0" r="1.5" fill="#dc8c46" opacity="0.6" />
            <circle cx="0" cy="0" r="1.5" fill="#dc8c46" opacity="0.6" />
          </pattern>
        </defs>

        {/* Coordinate Grid */}
        <rect width="100%" height="100%" fill="url(#geo-grid)" />

        {/* Topographic Contour Lines */}
        <g stroke="url(#topo-fade)" strokeWidth="1.2" fill="none">
          <path d="M-100,200 C300,120 600,340 900,220 C1200,100 1350,280 1600,210" />
          <path d="M-100,250 C280,180 580,390 880,270 C1180,150 1380,330 1600,260" />
          <path d="M-100,300 C260,240 560,440 860,320 C1160,200 1400,380 1600,310" />
          <path d="M-100,350 C240,300 540,490 840,370 C1140,250 1420,430 1600,360" />
          <path d="M-100,400 C220,360 520,540 820,420 C1120,300 1440,480 1600,410" />
          <path d="M-100,450 C200,420 500,590 800,470 C1100,350 1460,530 1600,460" />

          {/* Valley / Basin in lower region */}
          <path d="M-50,600 C150,550 350,700 550,650 C750,600 950,750 1200,700" />
          <path d="M-50,650 C180,600 380,750 580,700 C780,650 980,800 1200,750" />
          <path d="M-50,700 C210,650 410,800 610,750 C810,700 1010,850 1200,800" />
        </g>

        {/* Index Contour Elevation Labels */}
        <text
          x="320"
          y="230"
          fill="#64754b"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="1"
          opacity="0.8"
        >
          ELV. 760m (BOSQUE MAIA)
        </text>
        <text
          x="940"
          y="180"
          fill="#64754b"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="1"
          opacity="0.8"
        >
          ELV. 840m (SERRA DA CANTAREIRA / GUARULHOS HIGH)
        </text>
        <text
          x="180"
          y="620"
          fill="#64754b"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="1"
          opacity="0.8"
        >
          ELV. 715m (VÁRZEA DO TIETÊ / CECAP)
        </text>

        {/* Compass Rose watermark */}
        <g transform="translate(1300, 180)" opacity="0.25">
          <circle cx="0" cy="0" r="60" stroke="#64754b" strokeWidth="1" />
          <circle cx="0" cy="0" r="50" stroke="#64754b" strokeWidth="0.5" strokeDasharray="3 3" />
          <path d="M0 -65 L0 65 M-65 0 L65 0" stroke="#64754b" strokeWidth="0.75" />
          <polygon points="0,-48 5,-15 0,0 -5,-15" fill="#dc8c46" />
          <polygon points="0,48 5,15 0,0 -5,15" fill="#64754b" />
          <text x="-4" y="-70" fill="#dc8c46" fontSize="11" fontWeight="bold" fontFamily="sans-serif">N</text>
        </g>
      </svg>
    </div>
  );
}
