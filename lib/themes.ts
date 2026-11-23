export interface ThemeDef {
  id: string;
  name: string;
  description: string;
  /** Swatch hexes shown in the admin theme picker (display only). */
  swatches: string[];
}

export const THEMES: ThemeDef[] = [
  {
    id: "rosewood",
    name: "Rosewood",
    description: "Warm browns and old rose — the signature Glow Studio look.",
    swatches: ["#4C3436", "#3C2E2E", "#C38683", "#B38871", "#FAF5EF"],
  },
  {
    id: "teal-fresh",
    name: "Teal Fresh",
    description: "Deep teal with a soft mint accent and sand.",
    swatches: ["#0F4C4C", "#0A3333", "#7FB5A8", "#D9C7A7", "#F4F8F5"],
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    description: "Deep plum with lavender and a touch of soft gold.",
    swatches: ["#3B2340", "#2A1830", "#B79FD1", "#D8C29A", "#F8F5FA"],
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Deep green with sage and warm sand.",
    swatches: ["#123B2A", "#0C2A1E", "#8FB996", "#D9C7A7", "#F4F8F2"],
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    description: "Near-black panels with rich gold — a dark, luxe theme.",
    swatches: ["#17151A", "#211E26", "#C9A227", "#E8D9A0", "#EFE9DC"],
  },
];

export const DEFAULT_THEME = "rosewood";

export function isThemeId(value: unknown): value is string {
  return typeof value === "string" && THEMES.some((t) => t.id === value);
}
