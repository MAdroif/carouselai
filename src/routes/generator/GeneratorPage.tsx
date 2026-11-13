import React, { useState, useEffect, useRef, useLayoutEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useLocation, useNavigate } from "react-router-dom"
import { saveCarousel, updateCarousel, getBrandSettings, upsertBrandSettings, getCurrentUserEmail, uploadSlideImage } from "@/lib/db"
import { attachStockImages } from "@/lib/stockPhotos" // FITUR-GAMBAR
import { deriveDefaultHandle } from "@/lib/brandDefaults"
import { trackEvent } from "@/lib/trackerEvent"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { SlideRenderer, type Slide, type BrandIdentity, type ElementLayout, type ShapeItem, type ShapeType, CANVAS_W, CANVAS_H, type TextItem, type ActiveElement, getResolvedLayout } from "@/components/carousel/SlideRenderer"
import { GenerationControls } from "@/components/carousel/GenerationControls"
import { PRESET_THEMES, type Theme } from "@/lib/themes"
import Konva from "konva"
import { exportPNGFromRefs, exportPDFFromRefs } from "@/lib/export"
import { ImageIcon, FileText, ChevronLeft, ChevronRight, Plus, Minus, Maximize2, Undo2, Redo2 } from "lucide-react"
import { parseError, loadJSON, saveJSON } from "@/lib/utils"

// Canvas Workspace
const MIN_ZOOM = 0.2
const MAX_ZOOM = 3
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))

function CanvasWorkspace({ first, all, children, onBackgroundTap, isEditing }: {
  first: { w: number; h: number }
  all: { w: number; h: number }
  children: (zoom: number) => React.ReactNode
  onBackgroundTap?: () => void // FIX-DESELECT
  isEditing?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const lastPinch = useRef<{ dist: number; cx: number; cy: number } | null>(null)
  const tapStart = useRef<{ x: number; y: number } | null>(null) // FIX-DESELECT

  function fitTo(target: { w: number; h: number }) {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const zoom = clampZoom(Math.min((width - 48) / target.w, (height - 48) / target.h, 1))
    setView({ zoom, x: (width - target.w * zoom) / 2, y: (height - target.h * zoom) / 2 })
  }

  // sengaja hanya saat mount: fit ke slide pertama
  useLayoutEffect(() => { fitTo(first) }, []) // eslint-disable-line

  function zoomAt(px: number, py: number, factor: number) {
    setView(v => {
      const zoom = clampZoom(v.zoom * factor)
      const k = zoom / v.zoom
      return { zoom, x: px - (px - v.x) * k, y: py - (py - v.y) * k }
    })
  }

  function zoomCenter(factor: number) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    zoomAt(r.width / 2, r.height / 2, factor)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    function onWheel(e: WheelEvent) {
      if (isEditing) return //FITUR-EDIT-TEXT
      e.preventDefault()
      const r = el!.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.001))
      } else {
        setView(v => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }))
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  function measurePinch() {
    const [a, b] = Array.from(pointers.current.values())
    return { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }
  }

  function onPointerDown(e: React.PointerEvent) {
    const t = e.target as HTMLElement
    // jangan ganggu UI
    if (t.closest("button, input, textarea, select, [contenteditable=\"true\"]")) return
    // jangan ganggu konva (slide / element didalamnya)
    // biarin konva yang handle klik, select, dan drag element
    if (t.closest("canvas")) return
    // baru boleh pan kalo klik di area kosong Workspace
    if (isEditing) return // FITUR-EDIT-TEKS: blokir pan saat mengetik
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    // FIX-DESELECT
    tapStart.current = pointers.current.size === 1 ? { x: e.clientX, y: e.clientY } : null
    e.currentTarget.setPointerCapture(e.pointerId)
    if (pointers.current.size === 2) lastPinch.current = measurePinch()
  }

  function onPointerMove(e: React.PointerEvent) {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    const cur = { x: e.clientX, y: e.clientY }
    pointers.current.set(e.pointerId, cur)

    if (pointers.current.size === 1) {
      setView(v => ({ ...v, x: v.x + cur.x - prev.x, y: v.y + cur.y - prev.y }))
    } else if (pointers.current.size >= 2 && lastPinch.current) {
      const m = measurePinch()
      const r = ref.current!.getBoundingClientRect()
      const factor = m.dist / lastPinch.current.dist
      const dx = m.cx - lastPinch.current.cx
      const dy = m.cy - lastPinch.current.cy
      const px = m.cx - r.left
      const py = m.cy - r.top
      setView(v => {
        const zoom = clampZoom(v.zoom * factor)
        const k = zoom / v.zoom
        return { zoom, x: px - (px - v.x) * k + dx, y: py - (py - v.y) * k + dy }
      })
      lastPinch.current = m
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    // ▼▼▼ FIX-DESELECT: MULAI ▼▼▼
    const start = tapStart.current
    const tracked = pointers.current.has(e.pointerId)
    const wasSingle = pointers.current.size === 1
    // ▲▲▲ FIX-DESELECT: SELESAI ▲▲▲
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) lastPinch.current = null
    // FIX-DESELECT: gerak kurang dari 6px = tap, bukan geser canvas
    if (tracked && wasSingle && start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6 ) {
      onBackgroundTap?.()
    }
    tapStart.current = null
  }

  const level = Math.log2(1 / view.zoom)
  const levelFloor = Math.floor(level)
  const fade = level - levelFloor
  const spacingFine = 40 * Math.pow(2, levelFloor - 1)
  const spacingCoarse = 40 * Math.pow(2, levelFloor)

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: "#f1f5f9", cursor: "grab", touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, #94a3b8 1.2px, transparent 1.2px)",
        backgroundSize: `${spacingFine * view.zoom}px ${spacingFine * view.zoom}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
        opacity: 1 - fade,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, #94a3b8 1.2px, transparent 1.2px)",
        backgroundSize: `${spacingCoarse * view.zoom}px ${spacingCoarse * view.zoom}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
        opacity: fade,
      }} />

      <div style={{
        position: "absolute", top: 0, left: 0, transformOrigin: "0 0",
        transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
      }}>
        {children(view.zoom)}
      </div>

      <div
        className="fixed bottom-6 left-15 z-50 flex items-center gap-1 rounded-xl bg-white p-1 shadow-lg"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Button variant="ghost" size="icon" onClick={() => zoomCenter(0.9)}><Minus className="h-4 w-4" /></Button>
        <button className="px-2 text-xs tabular-nums" onClick={() => fitTo(first)}>{Math.round(view.zoom * 100)}%</button>
        <Button variant="ghost" size="icon" onClick={() => zoomCenter(1.1)}><Plus className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => fitTo(all)}><Maximize2 className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

// ==================####==================

function SlideCard({ slide, theme, totalSlides, brandIdentity,onLayoutChange, stageRef, onTextChange, onShapeChange, onTextItemChange, onTextItemEdit, active, onActive,
}: {
  slide: Slide
  theme: Theme
  totalSlides: number
  brandIdentity?: BrandIdentity
  onLayoutChange?: (elementId: string, layout: ElementLayout) => void
  stageRef?: React.RefObject<Konva.Stage>
  // FITUR-EDIT-TEKS
  onTextChange?: (id: string, text: string) => void
   // FITUR-SHAPES
  onShapeChange?: (id: string, updates: Partial<ShapeItem>) => void
  // FITUR-TEKS
  onTextItemChange?: (id: string, updates: Partial<TextItem>) => void
  onTextItemEdit?: (id: string, text: string) => void
  active?: ActiveElement
  onActive?: (next: ActiveElement) => void
}) {
  const [containerWidth, setContainerWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width)
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative overflow-hidden bg-white rounded-2xl shadow-md w-full" style={{ aspectRatio: "4/5" }}>
      <SlideRenderer
        slide={slide} theme={theme} totalSlides={totalSlides} brandIdentity={brandIdentity} displayWidth={containerWidth} editable={true} onLayoutChange={onLayoutChange} stageRef={stageRef} onTextChange={onTextChange} onShapeChange={onShapeChange} onTextItemChange={onTextItemChange}
        onTextItemEdit={onTextItemEdit} active={active} onActive={onActive} /> 
    </div>
  )
}

interface GeneratorPageProps {
  userTokens: number
  onTokensChange: () => void
}

const CARD_W = 420
const CARD_H = 525
const CARD_GAP = 48

export default function GeneratorPage({ userTokens, onTokensChange }: GeneratorPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const editRequest = (location.state as any)?.editRequest ?? null
  const [topic, setTopic] = useState(() => localStorage.getItem("gen_topic") || "")
  const [slideCount, setSlideCount] = useState<number>(5)
  const [slides, setSlides] = useState<Slide[]>(() => loadJSON("gen_slides", []))
  const [currentCarouselId, setCurrentCarouselId] = useState<string | null>(() => loadJSON("gen_carousel_id", null))
  // SESUDAH useState slides
  const stageRefs = useRef<React.RefObject<Konva.Stage>[]>([])
  const [active, setActive] = useState<ActiveElement>(null) /* active selection */
  // ▼▼▼ REFACTOR-ACTIVE: MULAI (jembatan baca-saja, semua turunan dari active) ▼▼▼
  const selection = active?.type === "element" ? active : null
  const selectedShape = active?.type === "shape" ? active : null
  const selectedTextItem = active?.type === "text" ? active : null
  const isEditingNow = (active?.type === "element" || active?.type === "text") ? !!active.editing : false
  // ▼ REFACTOR-ACTIVE: nama turunan dari active
  const activeSlideIndex = active?.slideIndex ?? 0
  const activeElementId = active?.type === "element" ? active.elementId : null
  const activeTextId = active?.type === "text" ? active.textId : null
  // ▲▲▲ REFACTOR-ACTIVE: SELESAI ▲▲▲
  // ▲▲▲ FITUR-SHAPES: SELESAI ▲▲▲
  // FITUR GAMBAR: MULAI (state upload)
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  // FITUR GAMBAR: SELESAI
  const [loading, setLoading] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<Theme>(() => loadJSON("gen_theme", PRESET_THEMES[0]))
  const [exportingPNG, setExportingPNG] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)
  const cancelRefPNG = useRef(false)
  const cancelRefPDF = useRef(false)
  const [exportingPNGProgress, setExportingPNGProgress] = useState(0)
  const [exportingPDFProgress, setExportingPDFProgress] = useState(0)
  const [brandSettings, setBrandSettings] = useState<any | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [inputMode, setInputMode] = useState<"topic" | "script">("topic")
  // ▼▼▼ FITUR-GAMBAR: MULAI (foto otomatis, ingat pilihan terakhir) ▼▼▼
  const [autoImage, setAutoImage] = useState<boolean>(() => loadJSON("gen_auto_image", true))
  useEffect(() => saveJSON("gen_auto_image", autoImage), [autoImage])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const resolvedHandle = brandSettings?.display_handle || (userEmail ? deriveDefaultHandle(userEmail) : "")
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity>(() => loadJSON("gen_brand", {
    show: true,
    handle: "Data Frame",
    website: "https://glito.vercel.app",
  }))
  const [colorMode, setColorMode] = useState<"preset" | "custom">("preset")

  // ▼▼▼ UNDO/REDO: MULAI ▼▼▼
  type Snapshot = { slides: Slide[]; theme: Theme }
  const [past, setPast] = useState<Snapshot[]>([])
  const [future, setFuture] = useState<Snapshot[]>([])
  const slidesRef = useRef(slides)
  const themeRef = useRef(selectedTheme)
  slidesRef.current = slides
  themeRef.current = selectedTheme
  
  function pushHistory() {
    setPast(p => [...p.slice(-49), { slides: slidesRef.current, theme: themeRef.current }])
    setFuture([])
  }
  function handleUndo() {
    if (past.length === 0) return
    const prev = past[past.length - 1]
    setPast(p => p.slice(0, -1))
    setFuture(f => [{ slides: slidesRef.current, theme: themeRef.current }, ...f])
    setSlides(prev.slides)
    setSelectedTheme(prev.theme)
  }
  function handleRedo() {
    if (future.length === 0) return
    const next = future[0]
    setFuture(f => f.slice(1))
    setPast(p => [...p, { slides: slidesRef.current, theme: themeRef.current }])
    setSlides(next.slides)
    setSelectedTheme(next.theme)
  }
  // ▲▲▲ UNDO/REDO: SELESAI ▲▲▲

  useEffect(() => saveJSON("gen_brand", brandIdentity), [brandIdentity])
                                                                    
  useEffect(() => {
    if (resolvedHandle) {
      setBrandIdentity(prev => ({
        ...prev,
        handle: brandSettings?.display_handle || resolvedHandle,
        website: brandSettings?.website_url || prev.website,
      }))
    }
  }, [resolvedHandle])

  useEffect(() => { localStorage.setItem("gen_topic", topic) }, [topic])
  useEffect(() => saveJSON("gen_slides", slides), [slides])
  useEffect(() => saveJSON("gen_theme", selectedTheme), [selectedTheme])

  useEffect(() => {
    getBrandSettings().then(setBrandSettings).catch(() => setBrandSettings(null))
    getCurrentUserEmail().then(setUserEmail)
  }, [])

  // TAMBAH
  const brandSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!brandIdentity.handle && !brandIdentity.website) return
    if (brandSaveTimer.current) clearTimeout(brandSaveTimer.current)
    brandSaveTimer.current = setTimeout(async () => {
      try {
        await upsertBrandSettings(brandIdentity.handle, brandIdentity.website)
      } catch (e: any) {
        // silent fail
      }
    }, 2000)
    return () => {
      if (brandSaveTimer.current) clearTimeout(brandSaveTimer.current)
    }
  }, [brandIdentity.handle, brandIdentity.website])

  // TAMBAH setelah useEffect saveJSON
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  useEffect(() => {
    if (!currentCarouselId || slides.length === 0) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await updateCarousel(currentCarouselId, { slides, theme: selectedTheme })
      } catch (e) {
      }
    }, 2000)
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [slides, selectedTheme, currentCarouselId])

  // mode edit history
  useEffect(() => {
    if (!editRequest) return
    const c = editRequest.content
    const loaded: Slide[] = Array.isArray(c) ? c : (c?.slides ?? [])
    if (loaded.length === 0) {
      toast.error("Riwayat ini kosong, nggak bisa diedit")
      navigate("/app", { replace: true, state: null })
      return
    }
    setCurrentCarouselId(editRequest.id)
    saveJSON("gen_carousel_id", editRequest.id)
    setSlides(loaded)
    setSelectedTheme(c?.theme ?? PRESET_THEMES[0])
    setTopic(editRequest.topic)
    setPast([]); setFuture([]); setActive(null)
    navigate("/app", { replace: true, state: null })
  }, [editRequest])

  // Tambah disini:
  useLayoutEffect(() => {
    stageRefs.current = slides.map((_, i) => stageRefs.current[i] ?? React.createRef<Konva.Stage>())
  }, [slides])

  async function handleGenerate(theme?: string) {
    if (!topic.trim()) return
    setLoading(true)
    setSlides([])
    setCurrentCarouselId(null)
    saveJSON("gen_carousel_id", null)
    trackEvent("carousel_generation_started", { mode: inputMode, slide_count: inputMode === "topic" ? slideCount : undefined })
    try {
      const { data: { session } } = await supabase.auth.getSession()

      const functionSlug = inputMode === "topic" ? "test" : "skrip-carousel"
      const requestBody = inputMode === "topic"
        ? { topic, slideCount, themePreference: theme || "Minimalist Clean" }
        : { script: topic, themePreference: theme || "Minimalist Clean" }

      const { data, error } = await supabase.functions.invoke(functionSlug, {
        body: requestBody,
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      })
      if (error) {
        throw new Error(
          typeof error === "string" ? error
          : error.message ?? "Gagal menghubungi server"
        )
      }
      // ▼▼▼ FITUR-GAMBAR: MULAI (foto stock otomatis, batas 10 detik) ▼▼▼
      let finalSlides = data.slides
      if (autoImage) { // FITUR-GAMBAR: lewati kalau tombol Foto dimatikan
        try {
          finalSlides = await Promise.race([
            attachStockImages(data.slides),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 10000)),
          ])
        } catch {
          toast.info("Foto otomatis tidak tersedia, slide dibuat tanpa gambar")
        }
      }
      // ▲▲▲ FITUR-GAMBAR: SELESAI ▲▲▲
      setSlides(finalSlides)
      setSelectedTheme(data.theme)
      const saved = await saveCarousel(topic, { ...data, slides: finalSlides })
      if (saved?.[0]?.id) {
        setCurrentCarouselId(saved[0].id)
        saveJSON("gen_carousel_id", saved[0].id)
      }
      onTokensChange()
      trackEvent("carousel_generation_completed", {
        mode: inputMode,
        style: data.theme,
        slide_count: data.slides?.length,
      })
    } catch (error: any) {
      console.error(error)
      toast.error("Generation Gagal", { description: parseError(error) })
    } finally {
      setLoading(false)
    }
  }

  async function handleExportPNG() {
    setExportingPNG(true)
    cancelRefPNG.current = false
    setExportingPNGProgress(0)
    try {
      await Promise.all([
        exportPNGFromRefs(stageRefs.current, (progress) => {
          setExportingPNGProgress(progress)
          if (cancelRefPNG.current) throw new Error("Export dibatalkan")
        }),
        new Promise(r => setTimeout(r, 1000))
      ])
      if (!cancelRefPNG.current) {
        toast.success("Berhasil export PNG")
        trackEvent("carousel_downloaded", { format: "png", slide_count: slides.length })
      } else {
        toast.info("Export dibatalkan")
      }
    } catch (error: any) {
      if (!cancelRefPNG.current) toast.error(error.message || "Gagal export PNG")
      else toast.info("Export dibatalkan")
    } finally {
      setExportingPNG(false)
    }
  }

  // ▼▼▼ FITUR-EDIT-TEKS: MULAI (simpan hasil ketikan ke slide) ▼▼▼
  function handleTextChange(slideIndex: number, elementId: string, text: string) {
    pushHistory()
    setSlides(prev => prev.map((s, i) => {
      if (i !== slideIndex) return s
      return elementId === "title" ? { ...s, title: text } : { ...s, body_text: text }
    }))
  }
  // ▲▲▲ FITUR-EDIT-TEKS: SELESAI ▲▲▲

  // ▼▼▼ FITUR-SHAPES: MULAI (tambah, ubah, dan hapus shape) ▼▼▼
  function handleAddShape(slideIndex: number, type: ShapeType) {
    pushHistory()
    const newShape: ShapeItem = {
      id: crypto.randomUUID(),
      type,
      x: CANVAS_W / 2 - 100,
      y: CANVAS_H / 2 - 100,
      width: 200,
      height: 200,
      fill: selectedTheme.accent,
      stroke: "transparent",
      strokeWidth: 0,
      cornerRadius: 0,
    }
    setSlides(prev => prev.map((s, i) =>
      i !== slideIndex ? s : { ...s, shapes: [...(s.shapes ?? []), newShape].slice(0, 5) }
    ))
    setActive({ type: "shape", slideIndex, shapeId: newShape.id })
  }

  function handleShapeChange(slideIndex: number, shapeId: string, updates: Partial<ShapeItem>) {
    pushHistory()
    setSlides(prev => prev.map((s, i) =>
      i !== slideIndex ? s : {
        ...s,
        shapes: s.shapes?.map(sh => sh.id === shapeId ? { ...sh, ...updates } : sh)
      }
    ))
  }

  // ▲▲▲ FITUR-SHAPES: SELESAI ▲▲▲

  // ▼▼▼ FITUR-TEKS: MULAI (tambah, ubah, hapus teks bebas + hapus elemen apapun) ▼▼▼
  function handleAddText(slideIndex: number) {
    pushHistory()
    const newText: TextItem = {
      id: crypto.randomUUID(),
      text: "Teks baru",
      x: CANVAS_W / 2 - 150,
      y: CANVAS_H / 2 - 30,
      width: 300,
      fontSize: 48,
      fontFamily: "Plus Jakarta Sans",
      fontStyle: "normal",
      textDecoration: "",
      fill: selectedTheme.text,
      align: "center",
      lineHeight: 1.4,
      letterSpacing: 0,
    }
    setSlides(prev => prev.map((s, i) =>
      i !== slideIndex ? s : { ...s, texts: [...(s.texts ?? []), newText] }
    ))
    setActive({ type: "text", slideIndex, textId: newText.id })
  }

  function handleTextItemChange(slideIndex: number, textId: string, updates: Partial<TextItem>) {
    pushHistory()
    setSlides(prev => prev.map((s, i) =>
      i !== slideIndex ? s : {
        ...s,
        texts: s.texts?.map(t => t.id === textId ? { ...t, ...updates } : t)
      }
    ))
  }

  function handleTextItemEdit(slideIndex: number, textId: string, text: string) {
    pushHistory()
    handleTextItemChange(slideIndex, textId, { text })
  }

  function handleDeleteElement(
    slideIndex: number,
    type: "title" | "content" | "image" | "shape" | "text",
    id?: string
  ) {
    pushHistory()
    setSlides(prev => prev.map((s, i) => {
      if (i !== slideIndex) return s
      if (type === "title") return { ...s, title: "" }
      if (type === "content") return { ...s, body_text: "" }
      if (type === "image") return { ...s, image_url: undefined, image_credit: undefined }
      if (type === "shape" && id) return { ...s, shapes: s.shapes?.filter(sh => sh.id !== id) }
      if (type === "text" && id) return { ...s, texts: s.texts?.filter(t => t.id !== id) }
      return s
    }))
    setActive(null)
  }
  // ▲▲▲ FITUR-TEKS: SELESAI ▲▲▲
  
  // tambahan modifikasi
  function handleLayoutChange(slideIndex: number, elementId: string, layout: ElementLayout) {
    pushHistory()
    setSlides(prev => prev.map((s, i) =>
      i !== slideIndex ? s : { ...s, layout: { ...s.layout, [elementId]: layout } }
    ))
  }

  // FITUR-GAMBAR: MULAI (upload dan hapus gambar slide)
  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // supaya file yang sama bisa dipilih
    if (!file || !active) return
    const slideIndex = active.slideIndex
    setUploadingImage(true)
    try {
      const url = await uploadSlideImage(file)
      pushHistory()
      setSlides(prev => prev.map((s, i) => (i === slideIndex ? { ...s, image_url: url, image_credit: undefined } : s)))
      setActive({ type: "element", slideIndex, elementId: "image" })
      toast.success("Gambar ditambahkan")
    } catch (err: any) {
      toast.error(err?.message || "Gagal upload gambar")
    } finally {
      setUploadingImage(false)
    }
  }

  function handleImageRemove() {
    if (!active) return
    pushHistory()
    const slideIndex = active.slideIndex
    setSlides(prev => prev.map((s, i) => (i === slideIndex ? { ...s, image_url: undefined, image_credit: undefined } : s)))
    setActive(null) // FITUR-GAMBAR
  }
  // FITUR-GAMBAR: SELESAI

  function handleCancelExportPNG() { cancelRefPNG.current = true }

  async function handleExportPDF() {
    setExportingPDF(true)
    cancelRefPDF.current = false
    setExportingPDFProgress(0)
    try {
      await Promise.all([
        exportPDFFromRefs(stageRefs.current, (progress) => {
          setExportingPDFProgress(progress)
          if (cancelRefPDF.current) throw new Error("Export dibatalkan")
        }),
        new Promise(r => setTimeout(r, 1000))
      ])
      if (!cancelRefPDF.current) {
        toast.success("Berhasil export PDF")
        trackEvent("carousel_downloaded", { format: "pdf", slide_count: slides.length })
      } else {
        toast.info("Export dibatalkan")
      }
    } catch (error: any) {
      if (!cancelRefPDF.current) toast.error(error.message || "Gagal export PDF")
      else toast.info("Export dibatalkan")
    } finally {
      setExportingPDF(false)
    }
  }

  function handleCancelExportPDF() { cancelRefPDF.current = true }

  

  return (
    <div className="relative w-full min-h-screen">
      {/* LAYER BACKGROUND: Canvas */}
      {slides.length > 0 && (
        <div className="fixed inset-0 z-0">
          <CanvasWorkspace
            first={{ w: CARD_W, h: CARD_H }}
            all={{ w: slides.length * CARD_W + (slides.length - 1) * CARD_GAP, h: CARD_H }}
            onBackgroundTap={() => setActive(null)} // FIX-DESELECT
            isEditing={isEditingNow}
          >
            {(_zoom) => (
              <div className="flex items-start" style={{ gap: CARD_GAP }}>
                {slides.map((s, i) => (
                  <div key={i} style={{ width: CARD_W }}>
                    <SlideCard
                      slide={s}
                      theme={selectedTheme}
                      totalSlides={slides.length}
                      brandIdentity={brandIdentity}
                      stageRef={stageRefs.current[i]}
                      active={active?.slideIndex === i ? active : null}
                      onActive={(next) => setActive(next ? { ...next, slideIndex: i } : null)}
                      onLayoutChange={(elementId, layout) => handleLayoutChange(i, elementId, layout)}
                      onShapeChange={(shapeId, updates) => handleShapeChange(i, shapeId, updates)}
                      onTextChange={(id, text) => handleTextChange(i, id, text)}
                      onTextItemChange={(textId, updates) => handleTextItemChange(i, textId, updates)}
                      onTextItemEdit={(textId, text) => handleTextItemEdit(i, textId, text)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CanvasWorkspace>
        </div>
      )}

      {/* LAYER UI */}
      <div className="relative z-10 pointer-events-none min-h-screen">
        {slides.length === 0 ? (
          <div className="pointer-events-auto pt-20">
            <div className="absolute -top-140 left-1/2 -translate-x-1/2 w-full max-w-3xl h-200 bg-blue-500/100 blur-[150px] rounded-full -z-10 pointer-events-none" />
            <GenerationControls
              topic={topic} setTopic={setTopic}
              slideCount={slideCount} setSlideCount={setSlideCount}
              loading={loading}
              onGenerate={handleGenerate} userTokens={userTokens}
              inputMode={inputMode} setInputMode={setInputMode}
              autoImage={autoImage} setAutoImage={setAutoImage} // FITUR-GAMBAR
            />
          </div>
        ) : (
          <header className="fixed top-0 left-16 right-0 w-auto z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm pointer-events-auto">
            <h2 className="text-lg font-bold text-gray-900 mr-8">
              {slides[0]?.title || topic || "Carousel"}
            </h2>
            <div className="flex-1 flex justify-end items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleUndo} disabled={past.length === 0} title="Undo">
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleRedo} disabled={future.length === 0} title="Redo">
                <Redo2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  setSlides([])
                  localStorage.removeItem("gen_slides")
                  setTopic("")
                  localStorage.removeItem("gen_topic")
                }}
              >Clear</Button>
            </div>
          </header>
        )}

        {slides.length > 0 && (
          <>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="fixed top-1/2 right-0 -translate-y-1/2 z-40 bg-purple-600 text-white rounded-l-xl px-2 py-4 shadow-lg pointer-events-auto"
            >
              {sidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-30 transition-transform duration-300 pointer-events-auto ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
              <div className="flex flex-col h-full overflow-y-auto">

                {/* ── Header ── */}
                <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Tool Design</span>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="flex flex-col gap-0 px-4 py-3">

                  {/* ── 1. KONTEKS ELEMEN TERPILIH ── */}
                  {!active ? (
                    <div className="py-6 text-center text-xs text-gray-400">
                      Pilih elemen di slide untuk mengedit
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 pb-4 border-b">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {selectedShape ? "Shape" : activeTextId ? "Teks Bebas" : activeElementId === "image" ? "Gambar" : activeElementId === "title" ? "Judul" : "Isi"}
      </span>

                      {/* Judul atau Isi: ukuran teks + perataan */}
                      {selection && (selection.elementId === "title" || selection.elementId === "content") && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Ukuran Teks</span>
                            <span className="text-xs text-gray-400">
                              {getResolvedLayout(slides[selection.slideIndex], selection.elementId).fontSize}px
                            </span>
                          </div>
                          <input
                            type="range" min={16} max={120} step={1}
                            value={getResolvedLayout(slides[selection.slideIndex], selection.elementId).fontSize ?? 45}
                            onChange={(e) => {
                              const cur = getResolvedLayout(slides[selection.slideIndex], selection.elementId)
                              handleLayoutChange(selection.slideIndex, selection.elementId, { ...cur, fontSize: Number(e.target.value) })
                            }}
                            className="w-full accent-purple-600"
                          />
                          <div className="flex gap-1">
                            {(["left", "center", "right"] as const).map((a) => {
                              const curLayout = slides[selection.slideIndex]?.layout?.[selection.elementId]
                              const isActive = (curLayout as any)?.align === a
                              return (
                                <button key={a}
                                  onClick={() => handleLayoutChange(selection.slideIndex, selection.elementId, { ...getResolvedLayout(slides[selection.slideIndex], selection.elementId), align: a } as any)}
                                  className={`flex-1 py-1.5 rounded-lg border text-xs ${isActive ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600"}`}
                                >
                                  {a === "left" ? "Kiri" : a === "center" ? "Tengah" : "Kanan"}
                                </button>
                              )
                            })}
                          </div>
                        </>
                      )}

                      {/* Gambar: opacity */}
                      {activeElementId === "image" && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Opacity</span>
                            <span className="text-xs text-gray-400">
                              {Math.round((slides[activeSlideIndex]?.layout?.image?.opacity ?? 0.4) * 100)}%
                            </span>
                          </div>
                          <input
                            type="range" min={5} max={100} step={1}
                            value={Math.round((slides[activeSlideIndex]?.layout?.image?.opacity ?? 0.4) * 100)}
                            onChange={(e) => {
                              const cur = slides[activeSlideIndex]?.layout?.image ?? { x: 0, y: 0 }
                              handleLayoutChange(activeSlideIndex, "image", { ...cur, opacity: Number(e.target.value) / 100 })
                            }}
                            className="w-full accent-purple-600"
                          />
                        </>
                      )}

                      {/* Shape: warna isi, tepi, tebal, sudut */}
                      {selectedShape && (() => {
                        const shape = slides[selectedShape.slideIndex]?.shapes?.find(s => s.id === selectedShape.shapeId)
                        if (!shape) return null
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Warna isi</span>
                              <input type="color" value={shape.fill}
                                onChange={(e) => handleShapeChange(selectedShape.slideIndex, shape.id, { fill: e.target.value })}
                                className="w-9 h-9 rounded border cursor-pointer" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Warna tepi</span>
                              <input type="color" value={shape.stroke === "transparent" ? "#000000" : shape.stroke}
                                onChange={(e) => handleShapeChange(selectedShape.slideIndex, shape.id, { stroke: e.target.value, strokeWidth: Math.max(1, shape.strokeWidth) })}
                                className="w-9 h-9 rounded border cursor-pointer" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Tebal tepi</span>
                              <input type="range" min={0} max={20} step={1} value={shape.strokeWidth}
                                onChange={(e) => handleShapeChange(selectedShape.slideIndex, shape.id, { strokeWidth: Number(e.target.value) })}
                                className="w-32 accent-purple-600" />
                            </div>
                            {shape.type === "rect" && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Sudut bulat</span>
                                <input type="range" min={0} max={100} step={1} value={shape.cornerRadius ?? 0}
                                  onChange={(e) => handleShapeChange(selectedShape.slideIndex, shape.id, { cornerRadius: Number(e.target.value) })}
                                  className="w-32 accent-purple-600" />
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}

                  {/* ── 2. AKSI ELEMEN ── */}
                  {active && (
                    <div className="flex gap-2 py-3 border-b">
                      <Button variant="outline" size="sm" className="flex-1 text-xs gap-1"
                        onClick={() => {
                          const slideIdx = activeSlideIndex
                          handleAddText(slideIdx)
                        }}>
                        + Teks
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 text-xs text-red-600"
                        onClick={() => {
                          const slideIdx = activeSlideIndex ?? activeSlideIndex ?? activeSlideIndex ?? 0
                          if (selectedShape) handleDeleteElement(selectedShape.slideIndex, "shape", selectedShape.shapeId)
                          else if (selectedTextItem) handleDeleteElement(selectedTextItem.slideIndex, "text", selectedTextItem.textId)
                          else if (activeElementId === "image") handleDeleteElement(slideIdx, "image")
                          else if (activeElementId === "title") handleDeleteElement(slideIdx, "title")
                          else if (activeElementId === "content") handleDeleteElement(slideIdx, "content")
                        }}>
                        Hapus
                      </Button>
                    </div>
                  )}

                  {/* ── 3. TAMBAH SHAPE ── */}
                  <div className="flex flex-col gap-2 py-4 border-b">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tambah Shape</span>
                    <div className="grid grid-cols-3 gap-1">
                      {([
                        { type: "rect",     label: "Kotak",     icon: "▭" },
                        { type: "circle",   label: "Lingkaran", icon: "⬤" },
                        { type: "triangle", label: "Segitiga",  icon: "▲" },
                        { type: "pentagon", label: "Pentagon",  icon: "⬠" },
                        { type: "hexagon",  label: "Hexagon",   icon: "⬡" },
                        { type: "star",     label: "Bintang",   icon: "★" },
                      ] as { type: ShapeType; label: string; icon: string }[]).map(({ type, label, icon }) => {
                        const slideIdx = activeSlideIndex ?? activeSlideIndex ?? activeSlideIndex ?? 0
                        const count = slides[slideIdx]?.shapes?.length ?? 0
                        return (
                          <button key={type}
                            disabled={count >= 5}
                            onClick={() => handleAddShape(slideIdx, type)}
                            className="flex flex-col items-center gap-1 py-2 rounded-lg border text-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                            <span className="text-lg">{icon}</span>
                            {label}
                          </button>
                        )
                      })}
                    </div>
                    {(slides[activeSlideIndex ?? 0]?.shapes?.length ?? 0) >= 5 && (
                      <span className="text-xs text-gray-400 text-center">Maks 5 shapes per slide</span>
                    )}
                  </div>

                  {/* ── 4. GAMBAR SLIDE ── */}
                  <div className="flex flex-col gap-2 py-4 border-b">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gambar Slide</span>
                    {selection ? (
                      <>
                        <span className="text-xs text-gray-500">Slide {selection.slideIndex + 1}</span>
                        <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImagePick} />
                        <Button variant="outline" size="sm" disabled={uploadingImage} onClick={() => imageInputRef.current?.click()}>
                          {uploadingImage ? "Mengunggah..." : slides[selection.slideIndex]?.image_url ? "Ganti Gambar" : "Tambah Gambar"}
                        </Button>
                        {slides[selection.slideIndex]?.image_url && (
                          <Button variant="ghost" size="sm" className="text-red-600 text-xs" onClick={handleImageRemove}>Hapus Gambar</Button>
                        )}
                        {slides[selection.slideIndex]?.image_credit && (
                          <span className="text-xs text-gray-400">
                            Foto oleh <a href={slides[selection.slideIndex]!.image_credit!.url} target="_blank" rel="noreferrer" className="underline">{slides[selection.slideIndex]!.image_credit!.name}</a> di <a href="https://www.pexels.com" target="_blank" rel="noreferrer" className="underline">Pexels</a>
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">Pilih elemen di slide dulu</span>
                    )}
                  </div>

                  {/* ── 5. BRAND ── */}
                  <div className="flex flex-col gap-2 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Akun</span>
                      <button
                        onClick={() => setBrandIdentity(prev => ({ ...prev, show: !prev.show }))}
                        className={`w-10 h-5 rounded-full transition-colors ${brandIdentity.show ? "bg-purple-600" : "bg-gray-300"}`}>
                        <div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-transform ${brandIdentity.show ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                    {brandIdentity.show && (
                      <>
                        <input type="text" value={brandIdentity.handle}
                          onChange={(e) => setBrandIdentity(prev => ({ ...prev, handle: e.target.value }))}
                          placeholder="@username" className="border rounded-lg px-3 py-2 text-sm" />
                        <input type="text" value={brandIdentity.website}
                          onChange={(e) => setBrandIdentity(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="website.com" className="border rounded-lg px-3 py-2 text-sm" />
                      </>
                    )}
                  </div>

                  {/* ── 6. TEMA ── */}
                  <div className="flex flex-col gap-3 py-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tema Warna</span>
                    <div className="flex gap-1 mb-1">
                      <button onClick={() => setColorMode("preset")}
                        className={`flex-1 py-1.5 rounded-lg text-xs ${colorMode === "preset" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                        Preset
                      </button>
                      <button onClick={() => setColorMode("custom")}
                        className={`flex-1 py-1.5 rounded-lg text-xs ${colorMode === "custom" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                        Custom
                      </button>
                    </div>
                    {colorMode === "preset" ? (
                      Object.entries(
                        PRESET_THEMES.reduce((acc: Record<string, Theme[]>, t) => {
                          const cat = t.label.split(" — ")[0]
                          acc[cat] = acc[cat] || []
                          acc[cat].push(t)
                          return acc
                        }, {})
                      ).map(([category, themesInCat]) => (
                        <div key={category} className="flex flex-col gap-1.5">
                          <span className="text-xs text-gray-400">{category}</span>
                          <div className="flex gap-2">
                            {themesInCat.map((t) => (
                              <button key={t.name}
                                onClick={() => { pushHistory(); setSelectedTheme(t) }}
                                title={t.label}
                                className={`w-9 h-9 rounded-full border-2 ${selectedTheme?.name === t.name ? "border-purple-600" : "border-gray-200"}`}
                                style={{ background: `linear-gradient(135deg, ${t.accent} 50%, ${t.bg} 50%)` }} />
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col gap-2">
                        {(["bg", "bgAlt", "text", "textMuted", "accent", "highlight"] as const).map((field) => (
                          <div key={field} className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{field}</span>
                            <input type="color"
                              value={selectedTheme?.[field] || "#000000"}
                              onChange={(e) => { pushHistory(); setSelectedTheme(prev => ({ ...prev, [field]: e.target.value })) }}
                              className="w-9 h-9 rounded border cursor-pointer" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </>
        )}

        {slides.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/40 backdrop-blur-md shadow-xl rounded-2xl px-4 py-3 pointer-events-auto">

            <>
              <Button variant="outline" className="bg-gray-200 text-black hover:bg-gray-400" onClick={handleExportPNG}>
                <ImageIcon className="h-4 w-4" />PNG
              </Button>
              <Button variant="outline" className="bg-gray-200 text-black hover:bg-gray-400" onClick={handleExportPDF}>
                <FileText className="h-4 w-4" />PDF
              </Button>
            </>
          </div>
        )}
      </div>

      {exportingPNG && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pointer-events-auto">
          <div className="flex flex-col items-center gap-4 max-w-xs w-full text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Exporting PNG...</h3>
              <p className="text-sm text-slate-500">Mohon tunggu, sedang memproses file Anda.</p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full transition-[width] duration-300 ease-out" style={{ width: `${exportingPNGProgress}%` }} />
            </div>
            <span className="text-xs font-mono font-medium text-slate-400">{exportingPNGProgress}% Selesai</span>
          </div>
          <Button variant="destructive" className="w-full max-w-xs rounded-full py-6 text-lg border-2 border-red-500 shadow-xl" onClick={handleCancelExportPNG}>
            <span className="text-white font-medium">Batal</span>
          </Button>
        </div>
      )}
      {exportingPDF && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pointer-events-auto">
          <div className="flex flex-col items-center gap-4 max-w-xs w-full text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Exporting PDF...</h3>
              <p className="text-sm text-slate-500">Mohon tunggu, sedang memproses file Anda.</p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full transition-[width] duration-300 ease-out" style={{ width: `${exportingPDFProgress}%` }} />
            </div>
            <span className="text-xs font-mono font-medium text-slate-400">{exportingPDFProgress}% Selesai</span>
          </div>
          <Button variant="destructive" className="w-full max-w-xs rounded-full py-6 text-lg border-2 border-red-500 shadow-xl" onClick={handleCancelExportPDF}>
            <span className="text-white font-medium">Batal</span>
          </Button>
        </div>
      )}
    </div>
  )
}