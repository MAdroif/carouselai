import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { supabase } from "@/lib/supabase"
import { saveCarousel, getBrandSettings, getCurrentUserEmail } from "@/lib/db"
import { deriveDefaultHandle } from "@/lib/brandDefaults"
import { trackEvent } from "@/lib/trackerEvent"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { SlideRenderer, type Slide, type ElementPosition } from "@/components/carousel/SlideRenderer"
import { GenerationControls } from "@/components/carousel/GenerationControls"
import { PRESET_THEMES, type Theme } from "@/lib/themes"
import { exportPNG, exportPDF } from "@/lib/export"
import { ImageIcon, FileText, ChevronLeft, ChevronRight, Undo2, Redo2, Plus, Minus, Maximize2 } from "lucide-react"
import { parseError } from "@/lib/utils"


// Canvas Workspace
const MIN_ZOOM = 0.2
const MAX_ZOOM = 3
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))

function CanvasWorkspace({ first, all, children }: {
  first: { w: number; h: number }
  all: { w: number; h: number }
  children: (zoom: number) => React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const lastPinch = useRef<{ dist: number; cx: number; cy: number } | null>(null)

  function fitTo(target: { w: number; h: number }) {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const zoom = clampZoom(Math.min((width - 48) / target.w, (height - 48) / target.h, 1))
    setView({ zoom, x: (width - target.w * zoom) / 2, y: (height - target.h * zoom) / 2 })
  }

  useLayoutEffect(() => { fitTo(first) }, [])

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
      e.preventDefault()
      const r = el!.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.01))
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
    if (e.pointerType === "mouse" && e.button !== 0) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
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
    pointers.current.delete(e.pointerId)
    lastPinch.current = null
  }

  // SESUDAH
  const level = Math.log2(1 / view.zoom)
  const levelFloor = Math.floor(level)
  const fade = level - levelFloor
  const spacingFine = 24 * Math.pow(2, levelFloor - 1)
  const spacingCoarse = 24 * Math.pow(2, levelFloor)

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-0 overflow-hidden"
      style={{
        backgroundColor: "#f1f5f9",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
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
        className="fixed bottom-6 left-6 z-50 flex items-center gap-1 rounded-xl bg-white p-1 shadow-lg"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Button variant="ghost" size="icon" onClick={() => zoomCenter(0.8)}><Minus className="h-4 w-4" /></Button>
        <button className="px-2 text-xs tabular-nums" onClick={() => fitTo(first)}>{Math.round(view.zoom * 100)}%</button>
        <Button variant="ghost" size="icon" onClick={() => zoomCenter(1.25)}><Plus className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => fitTo(all)}><Maximize2 className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

// ==================####==================

function EditableSlideCard({ slide, theme, totalSlides, brandIdentity, onLayoutChange, onTextChange, onGestureStart, zoom,selectedElementId, onSelectElement, editingElementId, onActivateEdit }: {
  slide: Slide; theme: Theme; totalSlides: number; brandIdentity?: any
  onLayoutChange: (elementId: string, pos: ElementPosition) => void
  onTextChange: (elementId: string, value: string) => void
  onGestureStart: () => void
  zoom: number
  selectedElementId: string | null
  onSelectElement: (elementId: string | null) => void
  editingElementId: string | null
  onActivateEdit: (elementId: string | null) => void
  
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

  const cardScale = containerWidth / 1080
  const scale = cardScale * zoom

  return (
    <div
      ref={ref} className="relative overflow-hidden bg-white rounded-2xl shadow-md w-full"
      style={{ aspectRatio: '4/5' }}
      onPointerDown={() => onSelectElement(null)}
    >
      <div className="origin-top-left" style={{ transform: `scale(${cardScale})`, width: '1080px', height: '1350px' }}>
        <SlideRenderer
          slide={slide} theme={theme} totalSlides={totalSlides} brandIdentity={brandIdentity}
          editable={true} onLayoutChange={onLayoutChange} scale={scale}
          selectedElementId={selectedElementId} onSelectElement={onSelectElement}
          editingElementId={editingElementId} onActivateEdit={onActivateEdit}
          onTextChange={onTextChange}
          onGestureStart={onGestureStart}
        />
      </div>
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
  const [topic, setTopic] = useState(() => localStorage.getItem("gen_topic") || "")
  const [slideCount, setSlideCount] = useState<number>(5)
  const [slides, setSlides] = useState<Slide[]>(() => {
    const saved = localStorage.getItem("gen_slides")
    return saved ? JSON.parse(saved) : []
  })
  const [loading, setLoading] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("gen_theme")
    return saved ? JSON.parse(saved) : PRESET_THEMES[0]
  })
  const [exportingPNG, setExportingPNG] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)
  const cancelRefPNG = useRef(false)
  const cancelRefPDF = useRef(false)
  const [exportingPNGProgress, setExportingPNGProgress] = useState(0)
  const [exportingPDFProgress, setExportingPDFProgress] = useState(0)
  const [brandSettings, setBrandSettings] = useState<any | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [inputMode, setInputMode] = useState<'topic' | 'script'>('topic')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [colorMode, setColorMode] = useState<"preset" | "custom">("preset")
  const [selection, setSelection] = useState<{ slideIndex: number; elementId: string } | null>(null)
  const [editing, setEditing] = useState<{ slideIndex: number; elementId: string } | null>(null)

  type HistorySnapshot = { slides: Slide[]; theme: Theme }
  const [past, setPast] = useState<HistorySnapshot[]>([])
  const [future, setFuture] = useState<HistorySnapshot[]>([])
  const slidesRef = useRef(slides)
  slidesRef.current = slides
  const themeRef = useRef(selectedTheme)
  themeRef.current = selectedTheme

  function snapshotNow(): HistorySnapshot {
    return { slides: slidesRef.current, theme: themeRef.current }
  }

  function pushHistory() {
    setPast(p => [...p.slice(-49), snapshotNow()])
    setFuture([])
  }

  function handleUndo() {
    if (past.length === 0) return
    const prev = past[past.length - 1]
    setPast(p => p.slice(0, -1))
    setFuture(f => [snapshotNow(), ...f])
    setSlides(prev.slides)
    setSelectedTheme(prev.theme)
  }

  function handleRedo() {
    if (future.length === 0) return
    const next = future[0]
    setFuture(f => f.slice(1))
    setPast(p => [...p, snapshotNow()])
    setSlides(next.slides)
    setSelectedTheme(next.theme)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement
      if (t.closest?.('input, textarea, [contenteditable="true"]')) return
      if (!(e.ctrlKey || e.metaKey)) return
      const k = e.key.toLowerCase()
      if (k === "z" && !e.shiftKey) { e.preventDefault(); handleUndo() }
      else if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); handleRedo() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [past, future])

  useEffect(() => {
    localStorage.setItem("gen_topic", topic)
  }, [topic])

  useEffect(() => {
    localStorage.setItem("gen_slides", JSON.stringify(slides))
  }, [slides])

  useEffect(() => {
    localStorage.setItem("gen_theme", JSON.stringify(selectedTheme))
  }, [selectedTheme])

  useEffect(() => {
    getBrandSettings().then(setBrandSettings).catch(() => setBrandSettings(null))
    getCurrentUserEmail().then(setUserEmail)
  }, [])

  function handleLayoutChange(slideIndex: number, elementId: string, pos: ElementPosition) {
    setSlides(prev => prev.map((s, i) =>
      i === slideIndex ? { ...s, layout: { ...s.layout, [elementId]: pos } } : s
    ))
  }

  function handleTextChange(slideIndex: number, elementId: string, value: string) {
    const current = slidesRef.current[slideIndex]
    const old = elementId === "title" ? current?.title : elementId === "content" ? current?.body_text : undefined
    if (old === undefined || old === value) return
    pushHistory()
    setSlides(prev => prev.map((s, i) => {
      if (i !== slideIndex) return s
      if (elementId === "title") return { ...s, title: value }
      if (elementId === "content") return { ...s, body_text: value }
      return s
    }))
  }

  async function handleGenerate(theme?: string) {
    if (!topic.trim()) return
    setLoading(true)
    setSlides([])
    setPast([]); setFuture([])
    trackEvent('carousel_generation_started', { mode: inputMode, slide_count: inputMode === 'topic' ? slideCount : undefined })
    try {
      const { data: { session } } = await supabase.auth.getSession()

      const functionSlug = inputMode === 'topic' ? 'test' : 'skrip-carousel'
      const requestBody = inputMode === 'topic'
        ? { topic, slideCount, themePreference: theme || "Minimalist Clean" }
        : { script: topic, themePreference: theme || "Minimalist Clean" }

      const { data, error } = await supabase.functions.invoke(functionSlug, {
        body: requestBody,
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      if (error) throw new Error(JSON.stringify(error))
      setSlides(data.slides)
      setSelectedTheme(data.theme)
      await saveCarousel(topic, data)
      onTokensChange()
      trackEvent('carousel_generation_completed', {
        mode: inputMode,
        style: data.theme,
        slide_count: data.slides?.length,
      })
    } catch (error: any) {
      console.error(error)
      const errorMessage = parseError(error)
      toast.error("Generation Gagal", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleExportPNG() {
    setExportingPNG(true)
    cancelRefPNG.current = false
    setExportingPNGProgress(0)
    try {
      await exportPNG(slides, selectedTheme, brandIdentity, (progress) => {
        setExportingPNGProgress(progress)
        if (cancelRefPNG.current) throw new Error("Export dibatalkan")
      })
      if (!cancelRefPNG.current) {
        toast.success("Berhasil export PNG")
        trackEvent('carousel_downloaded', { format: 'png', slide_count: slides.length }) // tracker event
      } else {
        toast.info("Export dibatalkan")
      }
    } catch (error: any) {
      if (!cancelRefPNG.current) {
        toast.error(error.message || "Gagal export PNG")
      } else {
        toast.info("Export dibatalkan")
      }
    } finally {
      setExportingPNG(false)
    }
  }

  function handleCancelExportPNG() {
    cancelRefPNG.current = true
  }

  async function handleExportPDF() {
    setExportingPDF(true)
    cancelRefPDF.current = false
    setExportingPDFProgress(0)
    try {
      await exportPDF(slides, selectedTheme, brandIdentity, (progress) => {
        setExportingPDFProgress(progress)
        if (cancelRefPDF.current) throw new Error("Export dibatalkan")
      })
      if (!cancelRefPDF.current) {
        toast.success("Berhasil export PDF")
        trackEvent('carousel_downloaded', { format: 'pdf', slide_count: slides.length }) // tracker event
      } else {
        toast.info("Export dibatalkan")
      }
    } catch (error: any) {
      if (!cancelRefPDF.current) {
        toast.error(error.message || "Gagal export PDF")
      } else {
        toast.info("Export dibatalkan")
      }
    } finally {
      setExportingPDF(false)
    }
  }

  function handleCancelExportPDF() {
    cancelRefPDF.current = true
  }

  const resolvedHandle = brandSettings?.display_handle || (userEmail ? deriveDefaultHandle(userEmail) : "")
  const [brandIdentity, setBrandIdentity] = useState({
    show: true, // atau apapun isinya sekarang
    handle: "Data Frame",
    website: "https://glito.vercel.app",
  })
  useEffect(() => {
    if (resolvedHandle) {
      setBrandIdentity(prev => (prev.handle === "Data Frame" ? { ...prev, handle: resolvedHandle } : prev))
    }
  }, [resolvedHandle])

  return (
    <div className="relative w-full min-h-screen">
      {/* START_FULL_SCREEN_LAYOUT */}
      {/* LAYER BACKGROUND: Canvas */}
      {slides.length > 0 && (
        <div className="fixed inset-0 z-0">
          <CanvasWorkspace
            first={{ w: CARD_W, h: CARD_H }}
            all={{ w: slides.length * CARD_W + (slides.length - 1) * CARD_GAP, h: CARD_H }}
          >
            {(zoom) => (
              <div className="flex items-start" style={{ gap: CARD_GAP }}>
                {slides.map((s, i) => (
                  <div key={i} style={{ width: CARD_W }}>
                    <EditableSlideCard
                      slide={s}
                      theme={selectedTheme}
                      totalSlides={slides.length}
                      brandIdentity={brandIdentity}
                      onLayoutChange={(elementId, pos) => handleLayoutChange(i, elementId, pos)}
                      onTextChange={(elementId, value) => handleTextChange(i, elementId, value)}
                      onGestureStart={pushHistory}
                      zoom={zoom}
                      selectedElementId={selection?.slideIndex === i ? selection.elementId : null}
                      onSelectElement={(elementId) => setSelection(elementId ? { slideIndex: i, elementId } : null)}
                      editingElementId={editing?.slideIndex === i ? editing.elementId : null}
                      onActivateEdit={(elementId) => setEditing(elementId ? { slideIndex: i, elementId } : null)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CanvasWorkspace>
        </div>
      )}

      {/* LAYER UI: Semua tombol dan menu */}
      <div className="relative z-10 pointer-events-none min-h-screen">
        {slides.length === 0 ? (
          <div className="pointer-events-auto pt-20">
            <div className="absolute -top-140 left-1/2 -translate-x-1/2 w-full
              max-w-3xl h-200 bg-blue-500/100 blur-[150px] rounded-full -z-10
              pointer-events-none" />
            <GenerationControls
              topic={topic} setTopic={setTopic}
              slideCount={slideCount} setSlideCount={setSlideCount}
              loading={loading}
              onGenerate={handleGenerate} userTokens={userTokens}
              inputMode={inputMode} setInputMode={setInputMode}
            />
          </div>
        ) : (
          <header className={`fixed top-0 left-16 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm pointer-events-auto transition-all duration-300 ${sidebarOpen ? 'right-72' : 'right-0'}`}>
            {/* AI-Generated Title: Mengambil judul dari slide pertama (cover) hasil generate AI, dengan fallback ke input topic atau teks default */}
            <h2 className="text-lg font-bold text-gray-900 truncate shrink-0 mr-8">
              {slides[0]?.title || topic || "Edit Carousel"}
            </h2>
            <div className="flex-1 flex justify-end items-center gap-1">
              <p className="text-[10px] text-gray-400 font-mono hidden md:block mr-4">
                {selectedTheme?.name} / {selectedTheme?.bg}
              </p>
              <Button variant="ghost" size="sm" disabled={past.length === 0} onClick={handleUndo}>
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled={future.length === 0} onClick={handleRedo}>
                <Redo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => { setSlides([]); setPast([]); setFuture([]); setSelection(null); setEditing(null); localStorage.removeItem("gen_slides"); setTopic(""); localStorage.removeItem("gen_topic"); }}>Clear</Button>
            </div>
          </header>
        )}
        {/* END_FULL_SCREEN_LAYOUT */}
        
        {slides.length > 0 && (
          <>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="fixed top-1/2 right-0 -translate-y-1/2 z-40 bg-purple-600 text-white rounded-l-xl px-2 py-4 shadow-lg pointer-events-auto"
            >
              {sidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            <div
              className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-30 transition-transform duration-300 pointer-events-auto ${
                sidebarOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="p-5 flex flex-col gap-6 overflow-y-auto h-full">
                <h3 className="text-lg font-semibold">Pengaturan</h3>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">Nama Akun</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Tampilkan di slide</span>
                    <button
                      onClick={() => setBrandIdentity(prev => ({ ...prev, show: !prev.show }))}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        brandIdentity.show ? "bg-purple-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          brandIdentity.show ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={brandIdentity.handle}
                    onChange={(e) => setBrandIdentity(prev => ({ ...prev, handle: e.target.value }))}
                    placeholder="@handle"
                    className="mt-2 border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={brandIdentity.website}
                    onChange={(e) => setBrandIdentity(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="website.com"
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t">
                  <span className="text-sm font-medium text-gray-700">Warna Tema</span>
                  <div className="flex gap-1 mb-2">
                    <button
                      onClick={() => setColorMode("preset")}
                      className={`flex-1 py-1.5 rounded-lg text-xs ${colorMode === "preset" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}
                    >
                      Preset
                    </button>
                    <button
                      onClick={() => setColorMode("custom")}
                      className={`flex-1 py-1.5 rounded-lg text-xs ${colorMode === "custom" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}
                    >
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
                      }, {} as Record<string, Theme[]>)
                    ).map(([category, themesInCat]) => (
                      <div key={category} className="flex flex-col gap-1.5">
                        <span className="text-xs text-gray-400">{category}</span>
                        <div className="flex gap-2">
                          {themesInCat.map((t) => (
                            <button
                              key={t.name}
                              onClick={() => { pushHistory(); setSelectedTheme(t)}}
                              title={t.label}
                              className={`w-9 h-9 rounded-full border-2 ${selectedTheme?.name === t.name ? "border-purple-600" : "border-gray-200"}`}
                              style={{ background: `linear-gradient(135deg, ${t.accent} 50%, ${t.bg} 50%)` }}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col gap-2">
                      {(["bg", "bgAlt", "text", "textMuted", "accent", "highlight"] as const).map((field) => (
                        <div key={field} className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{field}</span>
                          <input
                            type="color"
                            value={selectedTheme?.[field] || "#000000"}
                            onChange={(e) => { pushHistory(); setSelectedTheme(prev => ({ ...prev, [field]: e.target.value })) }}
                            className="w-9 h-9 rounded border cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selection && (selection.elementId === "title" || selection.elementId === "content") && (
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <span className="text-sm font-medium text-gray-700">Perataan Teks</span>
                    <div className="flex gap-1">
                      {(["left", "center", "right"] as const).map((a) => {
                        const currentPos = slides[selection.slideIndex]?.layout?.[selection.elementId]
                        const isActive = currentPos?.align === a
                        return (
                          <button
                            key={a}
                            onClick={() => handleLayoutChange(selection.slideIndex, selection.elementId, { ...currentPos, align: a } as ElementPosition)}
                            className={`flex-1 py-2 rounded-lg border text-xs capitalize ${
                              isActive ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600"
                            }`}
                          >
                            {a === "left" ? "Kiri" : a === "center" ? "Tengah" : "Kanan"}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {slides.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/40 backdrop-blur-md shadow-xl rounded-2xl px-4 py-3 pointer-events-auto">
            {exportingPNG ? (
              <>
                <span className="text-sm">Export PNG {exportingPNGProgress}%</span>
                <Button size="sm" className="bg-red-600 hover:bg-red-800 text-white" onClick={handleCancelExportPNG}>Batal</Button>
              </>
            ) : exportingPDF ? (
              <>
                <span className="text-sm">Export PDF {exportingPDFProgress}%</span>
                <Button size="sm" className="bg-red-600 hover:bg-red-800 text-white" onClick={handleCancelExportPDF}>Batal</Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="bg-gray-200  text-black hover:bg-gray-400" onClick={handleExportPNG}>
                  <ImageIcon className="h-4 w-4" />PNG
                </Button>
                <Button variant="outline" className="bg-gray-200  text-black hover:bg-gray-400" onClick={handleExportPDF}>
                  <FileText className="h-4 w-4" />PDF
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
