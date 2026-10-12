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
  svg_code?: string
}

export const PRESET_THEMES: Theme[] = [
  // EDUKASI & PSIKOLOGI
  { name: "edukasi-terracotta", label: "Edukasi & Psikologi — Terracotta",
    bg: "#FAF8F5", bgAlt: "#F5EFE6", accent: "#C86D51", accentText: "#ffffff",
    text: "#2C221E", textMuted: "#6B5D54", highlight: "#F0D9CE", fontWeight: 600,
    gradient: "linear-gradient(135deg, #C86D51 0%, #FAF8F5 100%)" },
  { name: "edukasi-sage", label: "Edukasi & Psikologi — Sage",
    bg: "#F7F6F1", bgAlt: "#EDEBE0", accent: "#7A8B7B", accentText: "#ffffff",
    text: "#2A2E26", textMuted: "#6B7063", highlight: "#D9E0D2", fontWeight: 600,
    gradient: "linear-gradient(135deg, #7A8B7B 0%, #F7F6F1 100%)" },
  { name: "edukasi-dusty-rose", label: "Edukasi & Psikologi — Dusty Rose",
    bg: "#FAF6F5", bgAlt: "#F3E8E6", accent: "#C98A8A", accentText: "#ffffff",
    text: "#332524", textMuted: "#7A6563", highlight: "#EFD9D6", fontWeight: 600,
    gradient: "linear-gradient(135deg, #C98A8A 0%, #FAF6F5 100%)" },

  // TECH & DIGITAL
  { name: "tech-cyan", label: "Tech & Digital — Cyan",
    bg: "#0F172A", bgAlt: "#1A2332", accent: "#06B6D4", accentText: "#0F172A",
    text: "#FFFFFF", textMuted: "#94A3B8", highlight: "#0E3A42", fontWeight: 700,
    gradient: "linear-gradient(135deg, #06B6D4 0%, #0F172A 100%)" },
  { name: "tech-violet", label: "Tech & Digital — Violet",
    bg: "#13101F", bgAlt: "#1E1830", accent: "#A855F7", accentText: "#ffffff",
    text: "#F5F3FF", textMuted: "#A99FC9", highlight: "#3B2A5C", fontWeight: 700,
    gradient: "linear-gradient(135deg, #A855F7 0%, #13101F 100%)" },
  { name: "tech-lime", label: "Tech & Digital — Lime",
    bg: "#0A0F0A", bgAlt: "#141C14", accent: "#22C55E", accentText: "#0A0F0A",
    text: "#F0FFF0", textMuted: "#8FA68F", highlight: "#163D24", fontWeight: 700,
    gradient: "linear-gradient(135deg, #22C55E 0%, #0A0F0A 100%)" },

  // KARIER & BISNIS
  { name: "karier-royal-blue", label: "Karier & Bisnis — Royal Blue",
    bg: "#F8FAFC", bgAlt: "#F0F4F8", accent: "#2563EB", accentText: "#ffffff",
    text: "#334155", textMuted: "#64748B", highlight: "#DBEAFE", fontWeight: 600,
    gradient: "linear-gradient(135deg, #2563EB 0%, #F8FAFC 100%)" },
  { name: "karier-charcoal-gold", label: "Karier & Bisnis — Charcoal Gold",
    bg: "#1C1F26", bgAlt: "#262B35", accent: "#D4AF37", accentText: "#1C1F26",
    text: "#F2EFE9", textMuted: "#9CA3AF", highlight: "#3D3722", fontWeight: 600,
    gradient: "linear-gradient(135deg, #D4AF37 0%, #1C1F26 100%)" },
  { name: "karier-emerald", label: "Karier & Bisnis — Emerald",
    bg: "#F7FAF9", bgAlt: "#E8F3EF", accent: "#0F9D7C", accentText: "#ffffff",
    text: "#10302A", textMuted: "#5C7D74", highlight: "#CFEAE1", fontWeight: 600,
    gradient: "linear-gradient(135deg, #0F9D7C 0%, #F7FAF9 100%)" },

  // VIRAL & PROMOSI
  { name: "viral-yellow-red", label: "Viral & Promosi — Yellow-Red",
    bg: "#FFD000", bgAlt: "#FFF3B0", accent: "#FF4500", accentText: "#ffffff",
    text: "#000000", textMuted: "#3D3000", highlight: "#FFD9C2", fontWeight: 800,
    gradient: "linear-gradient(135deg, #FF4500 0%, #FFD000 100%)" },
  { name: "viral-neon-pink", label: "Viral & Promosi — Neon Pink",
    bg: "#4C1D95", bgAlt: "#5B21B6", accent: "#FF007F", accentText: "#ffffff",
    text: "#FFFFFF", textMuted: "#D8B4FE", highlight: "#6B21A8", fontWeight: 800,
    gradient: "linear-gradient(135deg, #FF007F 0%, #4C1D95 100%)" },
  { name: "viral-hot-coral", label: "Viral & Promosi — Hot Coral",
    bg: "#FFFFFF", bgAlt: "#FFF5F0", accent: "#FF3B6F", accentText: "#ffffff",
    text: "#000000", textMuted: "#4D4D4D", highlight: "#FFD6E0", fontWeight: 800,
    gradient: "linear-gradient(135deg, #FF3B6F 0%, #FFFFFF 100%)" },
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
