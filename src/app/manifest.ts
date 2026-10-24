import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Xenvra Studio — Career Design Studio & Resume Builder",
    short_name: "Xenvra Studio",
    description:
      "Design 10-slide pitch decks, viva presentations, ATS resumes, cover letters, and LinkedIn banners in minutes.",
    start_url: "/",
    display: "standalone",
    background_color: "#E6EEF4",
    theme_color: "#5A4032",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
