import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "resizedimgs.zapimoveis.com.br",
      },
      {
        protocol: "https",
        hostname: "resizedimgs.vivareal.com.br",
      },
    ],
  },
};

export default nextConfig;
