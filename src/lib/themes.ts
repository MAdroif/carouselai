export interface Theme {
  name: string
  label: string
  bg: string
  bgAlt: string
  accent: string
  accentText: string
  text: string
  textMuted: string
  highlight: string
  fontWeight: number
  gradient: string
}

export const PRESET_THEMES: Theme[] = [
  {
    name: "dark-minimal",
    label: "Dark Minimal",
    bg: "#0f0f0f",
    bgAlt: "#1a1a1a",
    accent: "#e94560",
    accentText: "#ffffff",
    text: "#ffffff",
    textMuted: "#a0a0a0",
    highlight: "#e94560",
    fontWeight: 900,
    gradient: "linear-gradient(135deg, #e94560 0%, #0f0f0f 100%)",
  },
  {
    name: "clean-light",
    label: "Clean Light",
    bg: "#ffffff",
    bgAlt: "#f8f8f8",
    accent: "#111111",
    accentText: "#ffffff",
    text: "#111111",
    textMuted: "#666666",
    highlight: "#111111",
    fontWeight: 800,
    gradient: "linear-gradient(135deg, #111111 0%, #444444 100%)",
  },
  {
    name: "warm-editorial",
    label: "Warm Editorial",
    bg: "#f5f0e8",
    bgAlt: "#ede5d5",
    accent: "#c84b31",
    accentText: "#ffffff",
    text: "#2c1810",
    textMuted: "#7a5c4a",
    highlight: "#c84b31",
    fontWeight: 700,
    gradient: "linear-gradient(135deg, #c84b31 0%, #2c1810 100%)",
  },
  {
    name: "bold-statement",
    label: "Bold Statement",
    bg: "#1a0533",
    bgAlt: "#2d0a52",
    accent: "#c77dff",
    accentText: "#1a0533",
    text: "#ffffff",
    textMuted: "#c77dff",
    highlight: "#c77dff",
    fontWeight: 900,
    gradient: "linear-gradient(135deg, #c77dff 0%, #1a0533 100%)",
  },
  {
    name: "gradient-modern",
    label: "Gradient Modern",
    bg: "#0d1b2a",
    bgAlt: "#1b2838",
    accent: "#00b4d8",
    accentText: "#0d1b2a",
    text: "#ffffff",
    textMuted: "#90e0ef",
    highlight: "#00b4d8",
    fontWeight: 800,
    gradient: "linear-gradient(135deg, #00b4d8 0%, #0d1b2a 100%)",
  },
]

export function getThemeByName(name: string): Theme {
  return PRESET_THEMES.find(t => t.name === name) || PRESET_THEMES[0]
}

export function parseCustomTheme(input: string): Partial<Theme> {
  const lower = input.toLowerCase()
  if (lower.includes("biru") && lower.includes("emas")) {
    return { bg: "#0a1628", accent: "#d4af37", text: "#ffffff", gradient: "linear-gradient(135deg, #d4af37 0%, #0a1628 100%)" }
  }
  if (lower.includes("hijau")) {
    return { bg: "#0d2818", accent: "#4caf50", text: "#ffffff", gradient: "linear-gradient(135deg, #4caf50 0%, #0d2818 100%)" }
  }
  return {}
}
