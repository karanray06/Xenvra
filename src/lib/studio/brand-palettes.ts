export interface BrandColor {
  name: string;
  hex: string;
  description: string;
  textDark?: boolean;
}

export interface BrandPaletteCategory {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  colors: BrandColor[];
}

export const CORE_BRAND_PALETTE: BrandPaletteCategory = {
  id: "core-identity",
  name: "Signature Brand Identity",
  subtitle: "Official 5-Tone Foundation",
  description: "The core foundational palette anchoring Xenvra Studio documents, interface, and vector exports.",
  colors: [
    {
      name: "Ice Silver",
      hex: "#E6EEF4",
      description: "Backgrounds, card surfaces, light logo tile, and empty states.",
      textDark: true,
    },
    {
      name: "Mocha Brown",
      hex: "#5A4032",
      description: "Primary CTA buttons, primary logo tile, and key headings.",
      textDark: false,
    },
    {
      name: "Platinum Silver",
      hex: "#C9CCD1",
      description: "Borders, structural dividers, subtle taglines, and disabled states.",
      textDark: true,
    },
    {
      name: "Pale Lavender",
      hex: "#DCD3F2",
      description: "Highlights, PRO badges, selected pill states, and focus halos.",
      textDark: true,
    },
    {
      name: "Mocha Ink",
      hex: "#241915",
      description: "High-contrast body text and high-hierarchy headlines.",
      textDark: false,
    },
  ],
};

export const DESATURATED_EDITORIAL: BrandPaletteCategory = {
  id: "desaturated-editorial",
  name: "Desaturated Editorial Tones",
  subtitle: "Muted Subtlety",
  description: "Sophisticated, low-chroma hues evoking high-fashion print layouts and quiet architectural spaces.",
  colors: [
    {
      name: "Quiet Linen",
      hex: "#F7F4EF",
      description: "A clean, ultra-soft off-white that replaces harsh digital whites.",
      textDark: true,
    },
    {
      name: "Muted Alabaster",
      hex: "#E6DED4",
      description: "A smooth, gallery-wall neutral with a faint warm stone undertone.",
      textDark: true,
    },
    {
      name: "Parchment Silk",
      hex: "#D5C7B7",
      description: "An elegant, low-contrast taupe mimicking raw raw-silk fibers.",
      textDark: true,
    },
    {
      name: "Warm Greige",
      hex: "#C4B5A5",
      description: "A perfect midpoint balance between dusty earth and modern industrial gray.",
      textDark: true,
    },
    {
      name: "Driftwood Shadow",
      hex: "#A99A8C",
      description: "A faded, premium wood-ash shade for soft depth.",
      textDark: false,
    },
    {
      name: "Tuscan Soil",
      hex: "#8E7F72",
      description: "A desaturated, quiet brown with high-end editorial restraint.",
      textDark: false,
    },
    {
      name: "Smoked Umber",
      hex: "#75675B",
      description: "A rich yet subtle mid-dark tone for refined background elements.",
      textDark: false,
    },
    {
      name: "Espresso Raw",
      hex: "#5A4D43",
      description: "A deeply desaturated coffee shade that avoids red or orange cast.",
      textDark: false,
    },
    {
      name: "Obsidian Earth",
      hex: "#38302A",
      description: "An ultra-dark, organic near-black to replace pure charcoal tones.",
      textDark: false,
    },
  ],
};

export const ACID_MUTED_PASTELS: BrandPaletteCategory = {
  id: "acid-muted-pastels",
  name: "Acid & Muted Pastels",
  subtitle: "Uncommon Accents",
  description: "Unusual pastel tones infused with slight acid, neon, or grey undertones for striking accents without breaking minimalist guidelines.",
  colors: [
    {
      name: "Ice Glacier",
      hex: "#E3F2FD",
      description: "A crisp, chillingly light blue that brings immense airy space.",
      textDark: true,
    },
    {
      name: "Dewy Mint",
      hex: "#D0E7D2",
      description: "A very soft, desaturated mint green with a slight silver overcast.",
      textDark: true,
    },
    {
      name: "Acid Citron",
      hex: "#ECEE81",
      description: "A pale, neon-tinged yellow-green that acts as a sharp, modern highlight.",
      textDark: true,
    },
    {
      name: "Faded Peach",
      hex: "#F3D7CA",
      description: "An elegant, dry sherbet shade stripped of excessive sweetness.",
      textDark: true,
    },
    {
      name: "Soft Apricot",
      hex: "#FCDDB0",
      description: "A muted, milky orange-yellow reminiscent of vintage editorial paper.",
      textDark: true,
    },
    {
      name: "Dusty Petal",
      hex: "#EAA7B5",
      description: "A subdued, high-fashion pink that leans away from bubblegum vibrance.",
      textDark: true,
    },
    {
      name: "Muted Lilac",
      hex: "#D3B4E3",
      description: "A quiet, historic lavender shade with a dense gray base.",
      textDark: true,
    },
    {
      name: "Powder Frost",
      hex: "#BBE1FA",
      description: "A serene blue-gray accent that introduces clean, structural tone.",
      textDark: true,
    },
    {
      name: "Pale Sagebrush",
      hex: "#98DDCA",
      description: "A highly aesthetic green-cyan mix for premium interface highlights.",
      textDark: true,
    },
  ],
};

export const BOTANICAL_EARTH: BrandPaletteCategory = {
  id: "botanical-earth",
  name: "Botanical & Earth Slates",
  subtitle: "Organic Structure",
  description: "Grounded, natural pigments that look exceptionally modern alongside expansive neutral backdrops.",
  colors: [
    {
      name: "Oat Dry",
      hex: "#EAE7DC",
      description: "A clean, organic background tone simulating unbleached cotton textures.",
      textDark: true,
    },
    {
      name: "Sand Dune",
      hex: "#D8C3A5",
      description: "A light, parched desert hue that feels warm yet distinctly sparse.",
      textDark: true,
    },
    {
      name: "Silver Sage",
      hex: "#8E9A86",
      description: "A premium, quiet eucalyptus green heavily loaded with gray.",
      textDark: false,
    },
    {
      name: "Moss Velvet",
      hex: "#687964",
      description: "A deep, calm botanical green that adds substance without noise.",
      textDark: false,
    },
    {
      name: "Olive Slate",
      hex: "#4B5340",
      description: "A dark, sophisticated military olive that mimics forest shadows.",
      textDark: false,
    },
    {
      name: "Terracotta Dust",
      hex: "#E07A5F",
      description: "A washed-out, beautiful clay red that acts as a bold structural focus.",
      textDark: false,
    },
    {
      name: "Warm Eggshell",
      hex: "#F4F1DE",
      description: "A soft, vintage cream base color for editorial interfaces.",
      textDark: true,
    },
    {
      name: "Industrial Steel",
      hex: "#3D5A80",
      description: "A muted, professional slate blue that feels architectural and calm.",
      textDark: false,
    },
    {
      name: "Deep Baltic",
      hex: "#293241",
      description: "A strong, highly desaturated navy that offers striking structural weight.",
      textDark: false,
    },
  ],
};

export const BRUTALIST_GRAYS: BrandPaletteCategory = {
  id: "brutalist-grays",
  name: "Brutalist Architectural Grays",
  subtitle: "Industrial Rawness",
  description: "Cold, sharp, and intensely modern tones modeled after raw concrete, gallery spaces, and metallic textures.",
  colors: [
    {
      name: "Gallery Stark",
      hex: "#FAFAFA",
      description: "A brilliant, clean white used by contemporary art museums.",
      textDark: true,
    },
    {
      name: "Studio Concrete",
      hex: "#F0F2F5",
      description: "A cool, exceptionally light gray that creates premium spatial depth.",
      textDark: true,
    },
    {
      name: "Anodized Aluminum",
      hex: "#E5E7EB",
      description: "A flat, industrial gray perfect for minimal borders and clean grids.",
      textDark: true,
    },
    {
      name: "Raw Zinc",
      hex: "#D1D5DB",
      description: "A balanced middle gray reminiscent of brushed metal and city asphalt.",
      textDark: true,
    },
    {
      name: "Smoked Platinum",
      hex: "#9CA3AF",
      description: "A timeless, completely neutral gray that provides subtle contrast.",
      textDark: true,
    },
    {
      name: "Basalt Shadow",
      hex: "#6B7280",
      description: "A dense, heavy gray tone for anchoring minimal typography.",
      textDark: false,
    },
    {
      name: "Cast Iron",
      hex: "#4B5563",
      description: "A rich, industrial dark gray providing high text legibility without starkness.",
      textDark: false,
    },
    {
      name: "Charcoal Core",
      hex: "#374151",
      description: "A deep, brooding slate gray that feels solid and intentional.",
      textDark: false,
    },
    {
      name: "Brutalist Ink",
      hex: "#1F2937",
      description: "A clean, near-black tone that prevents pure-black eye strain.",
      textDark: false,
    },
  ],
};

export const WARM_SOLAR: BrandPaletteCategory = {
  id: "warm-solar",
  name: "Warm Solar Accents",
  subtitle: "Muted Radiance",
  description: "Restrained yellows, golds, and ochres that evoke desert horizons and warm film grain without being overtly loud.",
  colors: [
    {
      name: "Solar Linen",
      hex: "#FFFDF6",
      description: "A microscopic hint of yellow inside a vast, clean white background.",
      textDark: true,
    },
    {
      name: "Pale Buttercream",
      hex: "#FFF2CC",
      description: "A highly desaturated, velvety cream yellow.",
      textDark: true,
    },
    {
      name: "Warm Maize",
      hex: "#FFE599",
      description: "A vintage, soft solar tone perfect for editorial headers.",
      textDark: true,
    },
    {
      name: "Muted Ochre",
      hex: "#F1C232",
      description: "A premium, historical gold that brings immediate maturity to designs.",
      textDark: true,
    },
    {
      name: "Burnt Sienna",
      hex: "#E69138",
      description: "A dry, sophisticated orange with a heavy brown undertone.",
      textDark: false,
    },
    {
      name: "Raw Amber",
      hex: "#B45F06",
      description: "A dark, intense caramel tone that adds classic warmth.",
      textDark: false,
    },
    {
      name: "Roasted Chestnut",
      hex: "#783F04",
      description: "A deep, woodsy brown that works perfectly for minimal icons.",
      textDark: false,
    },
    {
      name: "Dark Sepia",
      hex: "#4C2600",
      description: "A severe, rich vintage dark tone simulating early film photography.",
      textDark: false,
    },
    {
      name: "Void Espresso",
      hex: "#261300",
      description: "A black-brown accent color to ground bright solar layouts.",
      textDark: false,
    },
  ],
};

export const DEEP_COSMIC_NEUTRALS: BrandPaletteCategory = {
  id: "deep-cosmic",
  name: "Deep Cosmic Neutrals",
  subtitle: "Premium Dark Mode",
  description: "Rare, ultra-deep pigments designed specifically for luxury dark layouts, providing deep ambiance.",
  colors: [
    {
      name: "Midnight Onyx",
      hex: "#1E1E24",
      description: "A luxury dark background with a very subtle purple-gray tint.",
      textDark: false,
    },
    {
      name: "Obsidian Plum",
      hex: "#141115",
      description: "A deep, almost imperceptible wine-tinted near-black tone.",
      textDark: false,
    },
    {
      name: "Cyber Slate",
      hex: "#0B0C10",
      description: "A pure, cold, tech-focused dark tone with a trace of green-blue.",
      textDark: false,
    },
    {
      name: "Deep Titanium",
      hex: "#1F2833",
      description: "A heavy, metallic charcoal base built for high-end contrast.",
      textDark: false,
    },
    {
      name: "Abyssal Blue",
      hex: "#0D1B2A",
      description: "A commanding, silent navy that disappears smoothly into screen margins.",
      textDark: false,
    },
    {
      name: "Shadow Steel",
      hex: "#1B263B",
      description: "A gorgeous, low-saturation dark slate blue for minimal interfaces.",
      textDark: false,
    },
    {
      name: "Flat Matte",
      hex: "#222222",
      description: "A perfect, uniform dark gray preferred by industrial product designers.",
      textDark: false,
    },
    {
      name: "Absolute Minimal",
      hex: "#111111",
      description: "An intensely deep, modern off-black that retains subtle form.",
      textDark: false,
    },
    {
      name: "Pure Abyss",
      hex: "#050505",
      description: "The ultimate pitch-dark boundary color for extreme minimal focus.",
      textDark: false,
    },
  ],
};

export const ALL_BRAND_PALETTE_CATEGORIES: BrandPaletteCategory[] = [
  CORE_BRAND_PALETTE,
  DESATURATED_EDITORIAL,
  ACID_MUTED_PASTELS,
  BOTANICAL_EARTH,
  BRUTALIST_GRAYS,
  WARM_SOLAR,
  DEEP_COSMIC_NEUTRALS,
];

/** Flat list of all 59 curated brand colors */
export const ALL_BRAND_COLORS: BrandColor[] = ALL_BRAND_PALETTE_CATEGORIES.flatMap(
  (cat) => cat.colors
);

/** Fast lookup by hex code */
export function findBrandColor(hex: string): BrandColor | undefined {
  const norm = hex.trim().toUpperCase();
  return ALL_BRAND_COLORS.find((c) => c.hex.toUpperCase() === norm);
}
