"use client";

import dynamic from "next/dynamic";
import { BrandLoader } from "@/components/ui/brand-loader";

const DynamicStudioEditor = dynamic(
  () => import("./studio-editor").then((mod) => mod.StudioEditor),
  {
    ssr: false,
    loading: () => <BrandLoader message="Loading Xenvra Studio Canvas..." />,
  }
);

export function StudioClient() {
  return <DynamicStudioEditor />;
}
