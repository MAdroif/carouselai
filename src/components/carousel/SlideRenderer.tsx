import type { Theme } from "@/lib/themes"
import { PRESET_THEMES } from "@/lib/themes"
import {
  Sparkles, ArrowDown, Brain, TrendingUp, Network, AlertTriangle,
  CheckCircle2, Rocket, Users, Lightbulb, Target, Zap, Copy, Bot,
  ShieldAlert, Clock, Server, Link2, Play, Terminal
} from "lucide-react"

export type Composition = {
  alignment: "center" | "left" | "right"
  focus: "headline" | "body" | "balanced"
  style: "floating" | "minimalist" | "bold" | "card-grid" | "card-flow"
  accent: "pill" | "line" | "none" | "bold-serif" | "clean-sans"
}

export interface CardItem {
  icon_keyword: string
  item_title: string
  item_description: string
}

export interface Slide {
  slide: number
  composition: Composition
  title: string
  body_text: string
  image_keyword: string
  svg_code?: string
  highlights?: string[]
  highlight_bg?: string
  theme?: Theme
  items?: CardItem[]
}

const DEFAULT_THEME = PRESET_THEMES[0]

const DEFAULT_COMPOSITION: Composition = {
  alignment: "center",
  focus: "balanced",
  style: "minimalist",
  accent: "none",
}

function resolveComposition(composition: any): Composition {
  if (!composition) return DEFAULT_COMPOSITION

  const validAlignments = ["center", "left", "right"]
  const validFocus = ["headline", "body", "balanced"]
  const validStyles = ["floating", "minimalist", "bold", "card-grid", "card-flow"]
  const validAccents = ["pill", "line", "none", "bold-serif", "clean-sans"]

  let alignment = composition.alignment
  if (typeof alignment === "string") {
    if (alignment.toLowerCase().includes("left")) alignment = "left"
    else if (alignment.toLowerCase().includes("right")) alignment = "right"
    else if (alignment.toLowerCase().includes("center")) alignment = "center"
  }

  return {
    alignment: validAlignments.includes(alignment) ? alignment : DEFAULT_COMPOSITION.alignment,
    focus: validFocus.includes(composition.focus) ? composition.focus : DEFAULT_COMPOSITION.focus,
    style: validStyles.includes(composition.style) ? composition.style : DEFAULT_COMPOSITION.style,
    accent: validAccents.includes(composition.accent) ? composition.accent : DEFAULT_COMPOSITION.accent,
  }
}

function resolveTheme(theme: any): Theme {
  if (!theme) return DEFAULT_THEME
  return {
    ...DEFAULT_THEME,
    ...theme,
  }
}

function getFontSize(text: string, max: number, min: number): string {
  const len = text.length
  if (len === 0) return `${min}px`

  if (len < 30) return `${max}px`
  if (len > 150) return `${min}px`
  const k = 0.015
  const size = min + (max - min) * Math.exp(-k * (len - 30))
  return `${Math.round(size)}px`
}

function getLuminance(hexColor: string | undefined): number {
  if (!hexColor) return 0;
  const color = hexColor.replace("#", "");
  let fullColor = color;
  if (color.length === 3) {
    fullColor = color.split("").map(char => char + char).join("");
  }
  if (fullColor.length !== 6) return 0;
  const r = parseInt(fullColor.substring(0, 2), 16);
  const g = parseInt(fullColor.substring(2, 4), 16);
  const b = parseInt(fullColor.substring(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function getContrastColor(hexColor: string | undefined): string {
  const luminance = getLuminance(hexColor);
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

function HighlightedText({ text, highlights, color, bg, highlightTextColor }: { text: string; highlights?: string[]; color: string, bg?: string, highlightTextColor?: string }) {
  if (!highlights || highlights.length === 0) return <>{text}</>

  const filteredHighlights = highlights.filter(h => h.length < text.length * 0.7)
  if (filteredHighlights.length === 0) return <>{text}</>

  const pattern = filteredHighlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) => {
        const isHighlight = filteredHighlights.some(h => h.toLowerCase() === part.toLowerCase())
        return isHighlight ? (
          <span key={i} style={{
            color: highlightTextColor || 'inherit',
            backgroundColor: bg || `${color}33`,
            padding: "2px 6px",
            borderRadius: "4px",
            fontWeight: 800,
            boxDecorationBreak: 'clone',
            WebkitBoxDecorationBreak: 'clone',
          }}>
            {part}
          </span>
        ) : <span key={i}>{part}</span>
      })}
    </>
  )
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  "copy-paste": Copy, "robot-vibe": Bot, "trust-drop": ShieldAlert,
  brain: Brain, otak: Brain, mindset: Brain,
  growth: TrendingUp, kemajuan: TrendingUp,
  network: Network, koneksi: Network,
  warning: AlertTriangle, risiko: AlertTriangle,
  solution: CheckCircle2, solusi: CheckCircle2, checklist: CheckCircle2,
  startup: Rocket, cepat: Rocket, launch: Rocket,
  audience: Users, orang: Users, user: Users,
  idea: Lightbulb, ide: Lightbulb,
  goal: Target, tujuan: Target,
  power: Zap, efisiensi: Zap,
  time: Clock, waktu: Clock,
  server: Server, koneksi2: Link2,
  action: Play, terminal: Terminal,
}

function resolveIcon(keyword?: string) {
  const key = keyword?.toLowerCase().trim() || ""
  return ICON_MAP[key] || Sparkles
}

function ItemCard({ item, theme }: { item: CardItem; theme: Theme }) {
  const Icon = resolveIcon(item.icon_keyword)
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "20px",
      backgroundColor: theme.bgAlt, border: `1px solid ${theme.accent}33`,
      borderRadius: "20px", padding: "28px", width: "100%", boxSizing: "border-box",
    }}>
      <div style={{
        width: "56px", height: "56px", minWidth: "56px", borderRadius: "14px",
        backgroundColor: `${theme.accent}22`, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={28} color={theme.accent} strokeWidth={1.75} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
        <h3 style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: theme.text, lineHeight: 1.25 }}>
          {item.item_title}
        </h3>
        <p style={{ margin: 0, fontSize: "22px", color: theme.textMuted, lineHeight: 1.4 }}>
          {item.item_description}
        </p>
      </div>
    </div>
  )
}

function CardFlowLayout({ items, theme }: { items: CardItem[]; theme: Theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", width: "100%" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
          <ItemCard item={item} theme={theme} />
          {i < items.length - 1 && <ArrowDown size={26} color={theme.textMuted} strokeWidth={2} />}
        </div>
      ))}
    </div>
  )
}

function CardGridLayout({ items, theme }: { items: CardItem[]; theme: Theme }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", width: "100%" }}>
      {items.map((item, i) => <ItemCard key={i} item={item} theme={theme} />)}
    </div>
  )
}

function AdaptiveLayout({ slide, theme: externalTheme }: { slide: Slide; theme: Theme }) {
  const theme = resolveTheme(externalTheme)
  const composition = resolveComposition(slide.composition)
  const { alignment, focus, accent } = composition
  const { svg_code, highlight_bg } = slide
  const canvasPadding = "69px"

  const alignmentStyles = {
    center: { justifyContent: "center", alignItems: "center", textAlign: "center" as const },
    left: { justifyContent: "center", alignItems: "flex-start", textAlign: "left" as const },
    right: { justifyContent: "center", alignItems: "flex-end", textAlign: "right" as const },
  }

  const focusStyles: Record<string, any> = {
    headline: { titleMax: 80, titleMin: 40, bodyMax: 32, bodyMin: 20 },
    body: { titleMax: 44, titleMin: 26, bodyMax: 44, bodyMin: 26 },
    balanced: { titleMax: 60, titleMin: 32, bodyMax: 34, bodyMin: 22 },
  }

  const currentFocus = focusStyles[focus] || focusStyles.balanced

  const resolvedAccent =
    accent === "bold-serif" ? "pill" :
    accent === "clean-sans" ? "line" :
    accent;

  return (
    <div style={{
      backgroundColor: theme.bg,
      width: "1080px",
      height: "1080px",
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      boxSizing: "border-box",
      display: "flex",
      justifyContent: alignment === "center" ? "center" : alignment === "left" ? "flex-start" : "flex-end",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      padding: canvasPadding,
    }}>
      {svg_code && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          opacity: 0.5,
          color: theme.accent,
          pointerEvents: "none",
        }}>
          <div
            style={{ width: "100%", height: "100%" }}
            dangerouslySetInnerHTML={{ __html: svg_code }}
          />
        </div>
      )}

      <div style={{
        width: "960px",
        height: "960px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 1,
        boxSizing: "border-box",
        ...alignmentStyles[alignment],
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "30px",
          position: "relative",
          zIndex: 1,
        }}>
          <div style={{
            width: "100%",
            display: "flex",
            justifyContent: alignment === "center" ? "center" : alignment === "left" ? "flex-start" : "flex-end"
          }}>
            {resolvedAccent === "pill" ? (
              <div style={{
                backgroundColor: theme.bgAlt, padding: "12px 24px", borderRadius: "100px",
                border: `2px solid ${theme.accent}44`, display: "inline-block"
              }}>
                <h2 style={{
                  fontSize: getFontSize(slide.title, currentFocus.titleMax, currentFocus.titleMin),
                  fontWeight: theme.fontWeight, color: theme.text, margin: 0, lineHeight: 1.2
                }}>
                  {slide.title}
                </h2>
              </div>
            ) : (
              <h2 style={{
                fontSize: getFontSize(slide.title, currentFocus.titleMax, currentFocus.titleMin),
                fontWeight: theme.fontWeight, color: theme.text, margin: 0, lineHeight: 1.2
              }}>
                {slide.title}
              </h2>
            )}
          </div>

          {resolvedAccent === "line" && (
            <div style={{
              width: alignment === "center" ? "80px" : "60px",
              height: "8px", backgroundColor: theme.highlight,
              margin: "10px 0", borderRadius: "4px",
              alignSelf: alignment === "center" ? "center" : alignment === "left" ? "flex-start" : "flex-end"
            }} />
          )}

          {/* Body Section: card layout atau paragraf biasa, tergantung style */}
          {(composition.style === "card-grid" || composition.style === "card-flow") && slide.items && slide.items.length > 0 ? (
            composition.style === "card-grid" ? (
              <CardGridLayout items={slide.items} theme={theme} />
            ) : (
              <CardFlowLayout items={slide.items} theme={theme} />
            )
          ) : (
            <div style={{
              width: "100%",
              display: "flex",
              justifyContent: alignment === "center" ? "center" : alignment === "left" ? "flex-start" : "flex-end"
            }}>
              <p style={{
                fontSize: getFontSize(slide.body_text, currentFocus.bodyMax, currentFocus.bodyMin),
                color: theme.text, lineHeight: 1.6, margin: 0, maxWidth: "75%"
              }}>
                {(() => {
                  const bgLum = getLuminance(theme.bg);
                  const hbgLum = getLuminance(highlight_bg);
                  const isTooSimilar = Math.abs(bgLum - hbgLum) < 0.15;
                  const finalHighlightBg = (highlight_bg && isTooSimilar) ? theme.accent : highlight_bg;
                  return (
                    <HighlightedText
                      text={slide.body_text}
                      highlights={slide.highlights}
                      color={theme.text}
                      bg={finalHighlightBg}
                      highlightTextColor={getContrastColor(finalHighlightBg)}
                    />
                  );
                })()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export function PreviewScaleWrapper({
  children,
  width
}: {
  children: React.ReactNode;
  width: number
}) {
  const scale = width / 1080
  return (
    <div style={{
      width: `${width}px`,
      height: `${width}px`,
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        width: "1080px",
        height: "1080px",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        pointerEvents: "none"
      }}>
        {children}
      </div>
    </div>
  )
}

export function SlideRenderer({ slide, theme: externalTheme }: { slide: Slide; theme?: Theme }) {
  const activeTheme = resolveTheme(externalTheme || slide.theme);
  return <AdaptiveLayout slide={slide} theme={activeTheme} />
}
