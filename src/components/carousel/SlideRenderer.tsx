import { useRef, useEffect, useState } from "react"
import { Stage, Layer, Rect, Text, Group, Line, Transformer, Image as KonvaImage } from "react-konva"
import type Konva from "konva"
import type { Theme } from "@/lib/themes"
import { PRESET_THEMES } from "@/lib/themes"
import useImage from "use-image" // FITUR-GAMBAR

// ─── Types ──────────────────────────────────────────────────────────────────
export type Composition = {
  alignment: "center" | "left" | "right"
  focus: "headline" | "body" | "balanced"
  style: "floating" | "minimalist" | "bold" | "card-grid" | "card-flow"
  accent: "pill" | "line" | "none" | "bold-serif" | "clean-sans"
  aspectRatio: "4:5"
}
export interface CardItem {
  icon_keyword: string
  item_title: string
  item_description: string
}
export interface BrandIdentity {
  show: boolean
  handle: string
  website: string
}
export interface ElementLayout {
  x: number
  y: number
  width?: number
  fontSize?: number
  align?: "left" | "center" | "right"
  height?: number // FITUR-GAMBAR
  opacity?: number // FITUR-GAMBAR
}
export interface Slide {
  slide: number
  composition: Composition
  title: string
  body_text: string
  image_keyword: string
  // FITUR GAMBAR: URL gambar slide dari Supabase Storage
  image_url?: string
  image_credit?: { name: string; url: string } // FITUR-GAMBAR: kredit fotografer Pexels
  svg_code?: string
  highlights?: string[]
  theme?: Theme
  items?: CardItem[]
  layout?: Record<string, ElementLayout>
}

// ─── Canvas constants ────────────────────────────────────────────────────────
export const CANVAS_W = 1080
export const CANVAS_H = 1350
const PAD = 110
const CONTENT_W = CANVAS_W - PAD * 2
const FONT = "Plus Jakarta Sans"
const WATERMARK = "Made with Glito"
const DEFAULT_THEME = PRESET_THEMES[0]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function resolveTheme(t: any): Theme {
  return t ? { ...DEFAULT_THEME, ...t } : DEFAULT_THEME
}
function resolveComposition(c: any): Composition {
  const d: Composition = { alignment: "center", focus: "balanced", style: "minimalist", accent: "none", aspectRatio: "4:5" }
  if (!c) return d
  let al = c.alignment as string || ""
  if (al.toLowerCase().includes("left")) al = "left"
  else if (al.toLowerCase().includes("right")) al = "right"
  else al = "center"
  return {
    alignment: al as Composition["alignment"],
    focus: (["headline","body","balanced"].includes(c.focus) ? c.focus : d.focus) as Composition["focus"],
    style: (["floating","minimalist","bold","card-grid","card-flow"].includes(c.style) ? c.style : d.style) as Composition["style"],
    accent: (["pill","line","none","bold-serif","clean-sans"].includes(c.accent) ? c.accent : d.accent) as Composition["accent"],
    aspectRatio: "4:5",
  }
}
function getFontSize(text: string, max: number, min: number): number {
  const len = text.length
  if (len === 0) return min
  if (len < 10) return max
  if (len > 100) return min
  return Math.round(min + (max - min) * Math.exp(-0.008 * (len - 10)))
}
function getLuminance(hex: string): number {
  const c = hex.replace("#","").padStart(6,"0")
  const r=parseInt(c.slice(0,2),16), g=parseInt(c.slice(2,4),16), b=parseInt(c.slice(4,6),16)
  return (0.2126*r+0.7152*g+0.0722*b)/255
}
function contrastColor(hex: string): string {
  return getLuminance(hex) > 0.5 ? "#000000" : "#FFFFFF"
}
function estimateTextHeight(text: string, fontSize: number, width: number, lineHeight = 1.4): number {
  const charsPerLine = Math.max(1, Math.floor(width / (fontSize * 0.55)))
  return Math.ceil(text.length / charsPerLine) * fontSize * lineHeight
}

// Hitung posisi default tiap elemen (sebelum user edit)
function calcDefaultLayout(
  slide: Slide,
  comp: Composition,
  titleSize: number,
  bodySize: number,
): Record<string, ElementLayout> {
  const { alignment } = comp
  const titleH = estimateTextHeight(slide.title, titleSize, CONTENT_W, 1.2)
  const accentH = (comp.accent === "line" || comp.accent === "clean-sans") ? 38 : 0
  const bodyH = estimateTextHeight(slide.body_text, bodySize, CONTENT_W, 1.6)
  const geserH = slide.slide === 1 ? 80 : 0
  const totalH = titleH + accentH + bodyH + (titleH > 0 && bodyH > 0 ? 30 : 0) + geserH
  let y = (CANVAS_H - totalH) / 2

  function xFor(w: number): number {
    if (alignment === "left")  return PAD
    if (alignment === "right") return CANVAS_W - PAD - w
    return PAD + (CONTENT_W - w) / 2
  }

  const titleLayout: ElementLayout = { x: xFor(CONTENT_W), y, width: CONTENT_W }
  y += titleH + 30
  if (accentH) y += accentH
  const contentLayout: ElementLayout = { x: xFor(CONTENT_W), y, width: CONTENT_W }
  y += bodyH
  const geserLayout: ElementLayout = { x: xFor(200), y: y + 20, width: 200 }
  const brandLayout: ElementLayout = { x: slide.slide % 2 === 0 ? PAD : CANVAS_W - PAD - 400, y: 100, width: 400 }
  const imageLayout: ElementLayout = { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H, opacity: 0.4 }

  return { title: titleLayout, content: contentLayout, geser: geserLayout, brand: brandLayout, image: imageLayout }
}

// ▼▼▼ FITUR-GAMBAR: MULAI (gambar sebagai elemen) ▼▼▼
function SlideImage({ url, width, height, opacity }: { url: string; width: number; height: number; opacity: number }) {
  const [img] = useImage(url, "anonymous") // "anonymous" wajib supaya export tidak blank
  // Selama gambar belum termuat, tetap beri kotak kosong supaya bingkai pilihan punya ukuran
  if (!img) return <Rect width={width} height={height} fill="rgba(0,0,0,0)" />
  // Mode "cover": isi kotak tanpa gepeng, kelebihan dipotong rata tengah
  const scale = Math.max(width / img.width, height / img.height)
  const cropW = width / scale
  const cropH = height / scale
  return (
    <KonvaImage
      image={img} width={width} height={height} opacity={opacity}
      cropX={(img.width - cropW) / 2} cropY={(img.height - cropH) / 2}
      cropWidth={cropW} cropHeight={cropH}
    />
  )
}
// ▲▲▲ FITUR-GAMBAR: SELESAI ▲▲▲

// ─── Inner konva layer: elemen statis dan interaktif ─────────────────────────
function SlideLayer({
  slide, theme, totalSlides, brandIdentity, editable, selectedId,
  onSelect, onLayoutChange,
  editingId, onEditStart, onEditEnd, onTextChange, // FITUR-EDIT-TEXT
}: {
  slide: Slide
  theme: Theme
  totalSlides: number
  brandIdentity?: BrandIdentity
  editable?: boolean
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  onLayoutChange?: (elementId: string, layout: ElementLayout) => void
  editingId?: string | null                           // FITUR-EDIT-TEXT
  onEditStart?: (id: string) => void                  //FITUR-EDIT-TEXT
  onEditEnd?: () => void                              //FITUR-EDIT-TEXT
  onTextChange?: (id: string, text: string) => void   //FITUR-EDIT-TEXT
}) {
  const comp       = resolveComposition(slide.composition)
  const { alignment } = comp
  const isCardStyle = comp.style === "card-grid" || comp.style === "card-flow"
  // ▼▼▼ FITUR-GAMBAR: MULAI (teks terang kalau ada gambar) ▼▼
  const textColor = theme.text
  const mutedColor = theme.textMuted
  // ▲▲▲ FITUR-GAMBAR: SELESAI ▲▲▲
  const accentBg    = theme.accent
  const accentTxt   = contrastColor(accentBg)
  const textAlign   = alignment === "center" ? "center" : alignment === "left" ? "left" : "right"

  const focusMap = {
    headline: { titleMax: 85, titleMin: 60, bodyMax: 35, bodyMin: 25 },
    body:     { titleMax: 75, titleMin: 40, bodyMax: 45, bodyMin: 34 },
    balanced: { titleMax: 75, titleMin: 42, bodyMax: 45, bodyMin: 34 },
  }
  const f = focusMap[comp.focus as keyof typeof focusMap] || focusMap.balanced
  const titleSize = getFontSize(slide.title, f.titleMax, f.titleMin)
  const bodySize  = getFontSize(slide.body_text, f.bodyMax, f.bodyMin)

  // Gabung layout default + override dari slide.layout
  const defaults = calcDefaultLayout(slide, comp, titleSize, bodySize)
  function pos(id: string): ElementLayout {
    return { ...defaults[id], ...(slide.layout?.[id] ?? {}) }
  }

  // Refs untuk Transformer
  const titleRef   = useRef<Konva.Group>(null)
  const contentRef = useRef<Konva.Group>(null)
  const geserRef   = useRef<Konva.Group>(null)
  const brandRef   = useRef<Konva.Group>(null)
  const imageRef   = useRef<Konva.Group>(null) // FITUR-GAMBAR
  const trRef      = useRef<Konva.Transformer>(null)

  const refMap: Record<string, React.RefObject<Konva.Group>> = {
    title: titleRef, content: contentRef, geser: geserRef, brand: brandRef, image: imageRef, // FITUR-GAMBAR
  }

  // Garis magnet
  // TAMBAH
  const [guides, setGuides] = useState<any[]>([])

  // Pasang Transformer ke elemen terpilih
  useEffect(() => {
    if (!trRef.current || !editable) return
    const node = selectedId ? refMap[selectedId]?.current : null
    trRef.current.nodes(node ? [node] : [])
    trRef.current.getLayer()?.batchDraw()
  }, [selectedId, editable])

  const GUIDELINE_OFFSET = 8

  function getLineGuideStops(stage: Konva.Stage, skipNode: Konva.Node) {
    const vertical = [0, PAD, CANVAS_W / 2, CANVAS_W - PAD, CANVAS_W]
    const horizontal = [0, PAD, CANVAS_H / 2, CANVAS_H - PAD, CANVAS_H]
    stage.find(".snap-target").forEach((item) => {
      if (item === skipNode) return
      const box = item.getClientRect({ relativeTo: stage })
      vertical.push(box.x, box.x + box.width / 2, box.x + box.width)
      horizontal.push(box.y, box.y + box.height / 2, box.y + box.height)
    })
    return { vertical, horizontal }
  }
  
  function getObjectSnappingEdges(node: Konva.Node, stage: Konva.Stage) {
    const box = node.getClientRect({ relativeTo: stage })
    const absPos = node.absolutePosition()
    return {
      vertical: [
        { guide: Math.round(box.x), offset: Math.round(absPos.x - box.x) },
        { guide: Math.round(box.x + box.width / 2), offset: Math.round(absPos.x - box.x - box.width / 2) },
        { guide: Math.round(box.x + box.width), offset: Math.round(absPos.x - box.x - box.width) },
      ],
      horizontal: [
        { guide: Math.round(box.y), offset: Math.round(absPos.y - box.y) },
        { guide: Math.round(box.y + box.height / 2), offset: Math.round(absPos.y - box.y - box.height / 2) },
        { guide: Math.round(box.y + box.height), offset: Math.round(absPos.y - box.y - box.height) },
      ],
    }
  }
  
  function getGuides(lineGuideStops: ReturnType<typeof getLineGuideStops>, itemBounds: ReturnType<typeof getObjectSnappingEdges>) {
    const vMatches: any[] = []
    const hMatches: any[] = []
    lineGuideStops.vertical.forEach((lineGuide) => {
      itemBounds.vertical.forEach((itemBound) => {
        const diff = Math.abs(lineGuide - itemBound.guide)
        if (diff < GUIDELINE_OFFSET) vMatches.push({ lineGuide, diff, offset: itemBound.offset, orientation: "V" })
      })
    })
    lineGuideStops.horizontal.forEach((lineGuide) => {
      itemBounds.horizontal.forEach((itemBound) => {
        const diff = Math.abs(lineGuide - itemBound.guide)
        if (diff < GUIDELINE_OFFSET) hMatches.push({ lineGuide, diff, offset: itemBound.offset, orientation: "H" })
      })
    })
    return [
      vMatches.sort((a, b) => a.diff - b.diff)[0],
      hMatches.sort((a, b) => a.diff - b.diff)[0],
    ].filter(Boolean)
  }

  function handleDragEnd(id: string) {
    const node = refMap[id]?.current
    if (!node || !onLayoutChange) return
    onLayoutChange(id, {
      ...pos(id),
      x: node.x(),
      y: node.y(),
    })
  }

  function handleTransformEnd(id: string) {
    const node = refMap[id]?.current
    if (!node || !onLayoutChange) return
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    node.scaleX(1)
    node.scaleY(1)
    // ▼ FITUR-GAMBAR: gambar ubah lebar DAN tinggi
    if (id === "image") {
      onLayoutChange(id, {
        ...pos(id),
        x: node.x(),
        y: node.y(),
        width: Math.max(100, (pos(id).width ?? CANVAS_W) * scaleX),
        height: Math.max(100, (pos(id).height ?? CANVAS_H) * scaleY),
      })
      return
    }
    onLayoutChange(id, {
      ...pos(id),
      x: node.x(),
      y: node.y(),
      width: Math.max(120, (pos(id).width ?? CONTENT_W) * scaleX),
    })
  }

  // ▼▼▼ FITUR-GAMBAR: MULAI (garis magnet saat geser gambar) ▼▼▼
  function handleSnapDrag(e: Konva.KonvaEventObject<any>) {
    const stage = e.target.getStage()
    if (!stage) return
    const nextGuides = getGuides(getLineGuideStops(stage, e.target), getObjectSnappingEdges(e.target, stage))
    setGuides(nextGuides)
    if (nextGuides.length) {
      const absPos = e.target.absolutePosition()
      nextGuides.forEach((g) => {
        if (g.orientation === "V") absPos.x = g.lineGuide + g.offset
        else absPos.y = g.lineGuide + g.offset
      })
      e.target.absolutePosition(absPos)
    }
  }
  // ▲▲▲ FITUR-GAMBAR: SELESAI ▲▲▲

  // ▼▼▼ FITUR-EDIT-TEKS: MULAI (tap lagi = mengetik, kotak ketik melayang di atas teks) ▼▼▼
  const selectStamp = useRef(0)

  //Tap pertama = pilih. Tap kedua (elemen sudah terpilih) = mulai mengetik.
  //Jeda 400ms mencegah satu sentuhan terbaca dua kali (click dan tap)
  function handleElementTap(id: string, canEdit: boolean) {
    if (!editable) return
    if (canEdit && selectedId === id && Date.now() - selectStamp.current > 400) {
      onEditStart?.(id)
      return
    }
    selectStamp.current = Date.now()
    onSelect?.(id)
  }

  useEffect(() => {
    if (!editable || !editingId) return
    const group = refMap[editingId]?.current
    const textNode = group?.findOne<Konva.Text>("Text")
    const stage = group?.getStage()
    if (!group || !textNode || !stage) { onEditEnd?.(); return }

    const isTitle = editingId === "title"
    const original = isTitle ? slide.title : slide.body_text
    const layout = pos(editingId)
    const fontSize = isTitle ? (layout.fontSize ?? titleSize) : (layout.fontSize ?? bodySize)

    // Pixel layar per 1 satuan kanvas (sudah termasuk zoom canvas)
    const rect = stage.container().getBoundingClientRect()
    const k = rect.width / CANVAS_W

    const ta = document.createElement("textarea")
    ta.value = original
    Object.assign(ta.style, {
      position: "fixed",
      left: `${rect.left + group.x() * k}px`,
      top: `${rect.top + group.y() * k}px`,
      width: `${(layout.width ?? CONTENT_W) * k}px`,
      fontSize: `${fontSize * k}px`,
      lineHeight: isTitle ? "1.2" : "1.6",
      fontFamily: `"${FONT}", sans-serif`,
      fontWeight: isTitle ? String(theme.fontWeight) : "400",
      color: textColor,
      textAlign: layout.align ?? textAlign,
      background: "transparent",
      border: "none",
      outline: "2px dashed #8b5cf6",
      boxShadow: "none",
      borderRadius: "0",
      appearance: "none",
      margin: "0",
      padding: "0",
      resize: "none",
      overflow: "hidden",
      whiteSpace: "pre-wrap",
      zIndex: "100",
    })
    const fit = () => { ta.style.height = "auto"; ta.style.height = `${ta.scrollHeight}px` }

    let finished = false
    // save: simpan hasil ketikan. notify: kabari induk bahwa mode ketik selesai.
    const finish = (save: boolean, notify: boolean) => {
      if (finished) return
      finished = true
      const value = ta.value
      ta.remove()
      textNode.visible(true)
      group.getLayer()?.batchDraw()
      if (save && value !== original) onTextChange?.(editingId, value)
      if (notify) onEditEnd?.()
    }

    ta.addEventListener("input", fit)
    ta.addEventListener("blur", () => finish(true, true))
    ta.addEventListener("keydown", (e) => { if (e.key === "Escape") finish(false, true) })
  
    textNode.visible(false)
    group.getLayer()?.batchDraw()
    document.body.appendChild(ta)
    fit()
    ta.focus()
    ta.setSelectionRange(ta.value.length, ta.value.length)

    return () => finish(true, false)
  }, [editingId, editable])
  // ▲▲▲ FITUR-EDIT-TEKS: SELESAI ▲▲▲
  
  const showBrand = !!(brandIdentity?.show &&
    (brandIdentity.handle || brandIdentity.website) &&
    (slide.slide === 1 || slide.slide === totalSlides))

  // Garis magnet (ditampilkan sementara selama drag, tapi di Konva kita
  // tampilkan snap result secara langsung lewat dragBoundFunc, garis hanya dekoratif)
  // Untuk fase ini kita lewati garis magnet visual, cukup snap posisinya saja.

  return (
    <>
      {/* Background */}
      <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={theme.bg}
        onClick={() => editable && onSelect?.(null)}
        onTap={() => editable && onSelect?.(null)}
      />

      {/* ▼▼▼ FITUR-GAMBAR: MULAI (gambar sebagai elemen) ▼▼▼ */}
      {slide.image_url && (
        <Group
          ref={imageRef}
          x={pos("image").x} y={pos("image").y}
          name="snap-target"
          draggable={editable && selectedId === "image"}
          onDragMove={handleSnapDrag}
          onDragEnd={() => { handleDragEnd("image"); setGuides([]) }}
          onTransformEnd={() => handleTransformEnd("image")}
          onClick={() => editable && onSelect?.("image")}
          onTap={() => editable && onSelect?.("image")}
        >
          <SlideImage
            url={slide.image_url}
            width={pos("image").width ?? CANVAS_W}
            height={pos("image").height ?? CANVAS_H}
            opacity={pos("image").opacity ?? 0.4}
          />
        </Group>
      )}
      {/* ▲▲▲ FITUR-GAMBAR: SELESAI ▲▲▲ */}

      {/* Counter */}
      {slide.slide > 1 && slide.slide < totalSlides && (
        <Text x={PAD} y={100} text={`${String(slide.slide).padStart(2,"0")} / ${String(totalSlides).padStart(2,"0")}`}
          fontSize={28} fontFamily="monospace" fill={mutedColor} letterSpacing={2} />
      )}

      {/* Title */}
      <Group
        ref={titleRef}
        x={pos("title").x} y={pos("title").y}
        name="snap-target"
        draggable={editable && selectedId === "title"}
        onDragMove={(e) => {
          const stage = e.target.getStage()
          if (!stage) return
          const lineGuideStops = getLineGuideStops(stage, e.target)
          const itemBounds = getObjectSnappingEdges(e.target, stage)
          const nextGuides = getGuides(lineGuideStops, itemBounds)
          setGuides(nextGuides)
          if (nextGuides.length) {
            const absPos = e.target.absolutePosition()
            nextGuides.forEach((g) => {
              if (g.orientation === "V") absPos.x = g.lineGuide + g.offset
              else absPos.y = g.lineGuide + g.offset
            })
            e.target.absolutePosition(absPos)
          }
        }}
        onDragEnd={() => { handleDragEnd("title"); setGuides([]) }}
        onTransformEnd={() => handleTransformEnd("title")}
        onClick={() => handleElementTap("title", true)}
        onTap={() => handleElementTap("title", true)}
        fontSize={pos("title").fontSize ?? titleSize}
      >
        <Text
          width={pos("title").width ?? CONTENT_W}
          text={slide.title}
          fontSize={pos("title").fontSize ?? titleSize} fontFamily={FONT} fontStyle={String(theme.fontWeight)}
          fill={textColor} lineHeight={1.2} align={(pos("title") as any).align ?? textAlign} wrap="word"
        />
      </Group>

      {/* Accent line */}
      {(comp.accent === "line" || comp.accent === "clean-sans") && (
        <Rect
          x={alignment === "center" ? CANVAS_W/2 - 40 : alignment === "left" ? PAD : CANVAS_W - PAD - 60}
          y={(pos("title").y ?? 0) + estimateTextHeight(slide.title, titleSize, CONTENT_W, 1.2) + 10}
          width={alignment === "center" ? 80 : 60} height={8}
          fill={theme.highlight} cornerRadius={4}
        />
      )}

      {/* Content (body atau cards) */}
      <Group
        ref={contentRef}
        x={pos("content").x} y={pos("content").y}
        draggable={editable && selectedId === "content"}
        onDragMove={(e) => {
          const stage = e.target.getStage()
          if (!stage) return
          const lineGuideStops = getLineGuideStops(stage, e.target)
          const itemBounds = getObjectSnappingEdges(e.target, stage)
          const nextGuides = getGuides(lineGuideStops, itemBounds)
          setGuides(nextGuides)
          if (nextGuides.length) {
            const absPos = e.target.absolutePosition()
            nextGuides.forEach((g) => {
              if (g.orientation === "V") absPos.x = g.lineGuide + g.offset
              else absPos.y = g.lineGuide + g.offset
            })
            e.target.absolutePosition(absPos)
          }
        }}
        onDragEnd={() => { handleDragEnd("content"); setGuides([]) }}
        onTransformEnd={() => handleTransformEnd("content")}
        onClick={() => handleElementTap("content", true)}
        onTap={() => handleElementTap("content", true)}
        fontSize={pos("content").fontSize ?? bodySize}
      >
        {!isCardStyle ? (
          <Text
            width={pos("content").width ?? CONTENT_W}
            text={slide.body_text}
            fontSize={pos("content").fontSize ?? bodySize} fontFamily={FONT} fontStyle="400"
            fill={textColor} lineHeight={1.6} align={(pos("content") as any).align ?? textAlign} wrap="word"
          />
        ) : (
          slide.items?.map((item, i) => {
            const cardW = comp.style === "card-grid" ? (CONTENT_W - 18) / 2 : CONTENT_W
            const cardX = comp.style === "card-grid" ? (i % 2) * (cardW + 18) : 0
            const cardY = Math.floor(i / (comp.style === "card-grid" ? 2 : 1)) * 178
            return (
              <Group key={i} x={cardX} y={cardY}>
                <Rect width={cardW} height={160} fill={theme.bgAlt}
                  cornerRadius={20} stroke={`${theme.accent}33`} strokeWidth={1} />
                <Text x={20} y={20} width={cardW-40} text={item.item_title}
                  fontSize={28} fontFamily={FONT} fontStyle="700" fill={theme.text} wrap="word" />
                <Text x={20} y={60} width={cardW-40} text={item.item_description}
                  fontSize={22} fontFamily={FONT} fontStyle="400" fill={theme.textMuted}
                  lineHeight={1.4} wrap="word" />
              </Group>
            )
          })
        )}
      </Group>

      {/* Badge Geser */}
      {slide.slide === 1 && (
        <Group
          ref={geserRef}
          x={pos("geser").x} y={pos("geser").y}
          draggable={editable && selectedId === "geser"}
          onDragMove={(e) => {
            const stage = e.target.getStage()
            if (!stage) return
            const lineGuideStops = getLineGuideStops(stage, e.target)
            const itemBounds = getObjectSnappingEdges(e.target, stage)
            const nextGuides = getGuides(lineGuideStops, itemBounds)
            setGuides(nextGuides)
            if (nextGuides.length) {
              const absPos = e.target.absolutePosition()
              nextGuides.forEach((g) => {
                if (g.orientation === "V") absPos.x = g.lineGuide + g.offset
                else absPos.y = g.lineGuide + g.offset
              })
              e.target.absolutePosition(absPos)
            }
          }}
          onDragEnd={() => { handleDragEnd("geser"); setGuides([]) }}
          onClick={() => editable && onSelect?.("geser")}
          onTap={() => editable && onSelect?.("geser")}
        >
          <Rect width={200} height={55} fill={accentBg} cornerRadius={100} />
          <Text x={0} y={12} width={190} text="Geser ›"
            fontSize={25} fontFamily={FONT} fontStyle="600"
            fill={accentTxt} align="center" />
        </Group>
      )}

      {/* Brand identity */}
      {showBrand && (
        <Group
          ref={brandRef}
          x={pos("brand").x} y={pos("brand").y}
          draggable={editable && selectedId === "brand"}
          onDragMove={(e) => {
            const stage = e.target.getStage()
            if (!stage) return
            const lineGuideStops = getLineGuideStops(stage, e.target)
            const itemBounds = getObjectSnappingEdges(e.target, stage)
            const nextGuides = getGuides(lineGuideStops, itemBounds)
            setGuides(nextGuides)
            if (nextGuides.length) {
              const absPos = e.target.absolutePosition()
              nextGuides.forEach((g) => {
                if (g.orientation === "V") absPos.x = g.lineGuide + g.offset
                else absPos.y = g.lineGuide + g.offset
              })
              e.target.absolutePosition(absPos)
            }
          }}
          onDragEnd={() => { handleDragEnd("brand"); setGuides([]) }}
          onClick={() => editable && onSelect?.("brand")}
          onTap={() => editable && onSelect?.("brand")}
        >
          {brandIdentity!.handle && (
            <Text text={brandIdentity!.handle}
              width={pos("brand").width ?? 400}
              align={slide.slide % 2 === 0 ? "left" : "right"}
              fontSize={32} fontFamily={FONT} fontStyle="800" fill={theme.accent} />
          )}
          {brandIdentity!.website && (
            <Text y={42} text={brandIdentity!.website}
              width={pos("brand").width ?? 400}
              align={slide.slide % 2 === 0 ? "left" : "right"}
              fontSize={20} fontFamily={FONT} fontStyle="500" fill={theme.accent} />
          )}
        </Group>
      )}

      {/* Watermark */}
      <Text x={0} y={CANVAS_H - 70} width={CANVAS_W} text={WATERMARK}
        fontSize={18} fontFamily={FONT} fontStyle="500"
        fill={mutedColor} opacity={0.6} align="center" />

      {/* Garis magnet */}
      {guides.map((guide, i) =>
        guide.orientation === "H" ? (
          <Line key={i} points={[-6000, 0, 6000, 0]} x={0} y={guide.lineGuide}
            stroke="#00a1ff" strokeWidth={1} dash={[4, 6]} listening={false} />
        ) : (
          <Line key={i} points={[0, -6000, 0, 6000]} x={guide.lineGuide} y={0}
            stroke="#00a1ff" strokeWidth={1} dash={[4, 6]} listening={false} />
        )
      )}
      
      {/* Transformer: muncul di elemen yang dipilih */}
      {editable && (
        <Transformer
          ref={trRef}
          visible={!editingId} //FITUR-EDIT-TEXT
          enabledAnchors={selectedId === "image"
            ? ["top-left", "top-right", "bottom-left", "bottom-right"] // FITUR-GAMBAR
            : ["middle-left", "middle-right"]}
          rotateEnabled={false}
          borderStroke="#8b5cf6"
          borderStrokeWidth={2}
          anchorStroke="#8b5cf6"
          anchorFill="white"
          anchorSize={12}
          anchorCornerRadius={2}
          keepRatio={selectedId === "image"} // FITUR-GAMBAR: gambar proporsi tetap
          boundBoxFunc={(oldBox, newBox) => {
            // ▼ FITUR-GAMBAR: batas ukuran minimal gambar
            if (selectedId === "image") {
              return newBox.width < 100 || newBox.height < 100 ? oldBox : newBox
            }
            return { ...newBox, width: Math.max(120, newBox.width) }
          }}
        />
      )}
    </>
  )
}

// ─── Public: SlideRenderer ───────────────────────────────────────────────────
export function SlideRenderer({
  slide, theme: extTheme, totalSlides, brandIdentity,
  displayWidth = 400, editable, selectedId, onSelect, onLayoutChange, stageRef, editingId, onEditStart, onEditEnd, onTextChange, // FITUR-EDIT-TEKS
}: {
  slide: Slide
  theme?: Theme
  totalSlides: number
  brandIdentity?: BrandIdentity
  displayWidth?: number
  editable?: boolean
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  onLayoutChange?: (elementId: string, layout: ElementLayout) => void
  stageRef?: React.RefObject<Konva.Stage>
  editingId?: string | null                          // FITUR-EDIT-TEKS
  onEditStart?: (id: string) => void                 // FITUR-EDIT-TEKS
  onEditEnd?: () => void                             // FITUR-EDIT-TEKS
  onTextChange?: (id: string, text: string) => void  // FITUR-EDIT-TEKS
}) {
  const theme  = resolveTheme(extTheme || slide.theme)
  const scale  = displayWidth / CANVAS_W
  const height = CANVAS_H * scale

  return (
    <Stage ref={stageRef} width={displayWidth} height={height} scaleX={scale} scaleY={scale}>
      <Layer>
        <SlideLayer
          slide={slide} theme={theme} totalSlides={totalSlides}
          brandIdentity={brandIdentity} editable={editable}
          selectedId={selectedId} onSelect={onSelect} onLayoutChange={onLayoutChange} editingId={editingId} onEditStart={onEditStart} onEditEnd={onEditEnd} onTextChange={onTextChange} // FITUR-EDIT-TEKS
        />
      </Layer>
    </Stage>
  )
}
