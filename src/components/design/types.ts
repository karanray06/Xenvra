export type ElementType = "text" | "rect" | "circle" | "line" | "badge";

export interface DesignElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees 0-360
  opacity: number; // 0-1
  locked: boolean;
  hidden: boolean;

  // Visual Styles
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  borderRadius?: number;

  // Typography (for text & badge)
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: "normal" | "medium" | "600" | "bold" | "800";
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textColor?: string;
}

export interface ArtboardPreset {
  id: string;
  name: string;
  width: number; // 794 for A4 at 96 DPI
  height: number; // 1123 for A4 at 96 DPI
}

export const A4_PRESET: ArtboardPreset = {
  id: "a4_portrait",
  name: "A4 Portrait (210 x 297 mm)",
  width: 794,
  height: 1123,
};

export interface DesignCanvasState {
  elements: DesignElement[];
  selectedId: string | null;
  zoom: number; // 0.5 to 2.0
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}
