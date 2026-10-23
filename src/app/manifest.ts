import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Xenvra — AI-Powered Resume Builder",
    short_name: "Xenvra",
    description: "Build professional, ATS-friendly resumes with AI assistance.",
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
