export interface TemplateTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  fontHeading: string;
  fontBody: string;
}

export const BRAND_THEMES: Record<string, TemplateTheme> = {
  mocha: {
    primary: "#5A4032",
    secondary: "#C9CCD1",
    accent: "#5A4032",
    background: "#FFFFFF",
    surface: "#F6F1EE",
    text: "#241915",
    textMuted: "#5E534D",
    border: "#E3E5E8",
    fontHeading: "Plus Jakarta Sans",
    fontBody: "Inter",
  },
  ice: {
    primary: "#241915",
    secondary: "#5A4032",
    accent: "#5A4032",
    background: "#FFFFFF",
    surface: "#E6EEF4",
    text: "#241915",
    textMuted: "#5E534D",
    border: "#C9CCD1",
    fontHeading: "Plus Jakarta Sans",
    fontBody: "Plus Jakarta Sans",
  },
  lavender: {
    primary: "#5A4032",
    secondary: "#241915",
    accent: "#7B66B8",
    background: "#FFFFFF",
    surface: "#DCD3F2",
    text: "#241915",
    textMuted: "#47322A",
    border: "#C9CCD1",
    fontHeading: "Space Grotesk",
    fontBody: "Inter",
  },
  charcoal: {
    primary: "#241915",
    secondary: "#5A4032",
    accent: "#5A4032",
    background: "#FFFFFF",
    surface: "#F5F9FB",
    text: "#241915",
    textMuted: "#5E534D",
    border: "#C9CCD1",
    fontHeading: "Space Grotesk",
    fontBody: "Inter",
  },
  serif: {
    primary: "#241915",
    secondary: "#5A4032",
    accent: "#5A4032",
    background: "#FFFFFF",
    surface: "#FFFFFF",
    text: "#241915",
    textMuted: "#5E534D",
    border: "#C9CCD1",
    fontHeading: "DM Serif Display",
    fontBody: "Lora",
  },
};

export function resolveTemplateTheme(
  themeName?: string,
  customAccent?: string,
  customFont?: string
): TemplateTheme {
  const base = BRAND_THEMES[themeName || "mocha"] || BRAND_THEMES.mocha;
  return {
    ...base,
    accent: customAccent || base.accent,
    fontHeading: customFont || base.fontHeading,
  };
}
