import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { saveCarousel } from "@/lib/db"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { SlideRenderer, PreviewScaleWrapper, type Slide } from "@/components/carousel/SlideRenderer"
import { GenerationControls } from "@/components/carousel/GenerationControls"
import { PRESET_THEMES, type Theme } from "@/lib/themes"
import { exportPNG, exportPDF } from "@/lib/export"
import { ImageIcon, FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { parseError } from "@/lib/utils"

function SlidePreview({ slide, theme, totalSlides, onClick }: { slide: Slide; theme: Theme; totalSlides: number; onClick: (s: Slide) => void }) {
  const [containerWidth, setContainerWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="cursor-pointer relative overflow-hidden bg-white rounded-lg shadow-sm"
      style={{ aspectRatio: '4/5' }}
      onClick={() => onClick(slide)}
    >
      <div
        className="origin-top-left"
        style={{
          transform: `scale(${containerWidth / 1080})`,
          width: '1080px',
          height: '1350px'
        }}
      >
        <SlideRenderer slide={slide} theme={theme} totalSlides={totalSlides} />
      </div>
    </div>
  )
}

interface GeneratorPageProps {
  userTokens: number
  onTokensChange: () => void
}

export default function GeneratorPage({ userTokens, onTokensChange }: GeneratorPageProps) {
  const [topic, setTopic] = useState("")
  const [slideCount, setSlideCount] = useState<number>(5)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<Theme>(PRESET_THEMES[0])
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(null)
  const [exportingPNG, setExportingPNG] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [exportingPNGProgress, setExportingPNGProgress] = useState(0)
  const [exportingPDFProgress, setExportingPDFProgress] = useState(0)

  async function handleGenerate(theme?: string) {
    if (!topic.trim()) return
    setLoading(true)
    setSlides([])
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { data, error } = await supabase.functions.invoke('generate-carousel', {
        body: { topic, slideCount, themePreference: theme || "Minimalist Clean" },
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
    setExportingPNGProgress(0)
    try {
      await exportPNG(slides, selectedTheme, setExportingPNGProgress)
      toast.success("Berhasil export PNG")
    } catch (error) {
      toast.error("Gagal export PNG")
    } finally {
      setExportingPNG(false)
    }
  }

  async function handleExportPDF() {
    setExportingPDF(true)
    setExportingPDFProgress(0)
    try {
      await exportPDF(slides, selectedTheme, setExportingPDFProgress)
      toast.success("Berhasil export PDF")
    } catch (error) {
      toast.error("Gagal export PDF")
    } finally {
      setExportingPDF(false)
    }
  }

  return (
    <div className="relative">
      <div className="absolute -top-140 left-1/2 -translate-x-1/2 w-full
      max-w-3xl h-200 bg-blue-500/100 blur-[150px] rounded-full -z-10
      pointer-events-none" />
      {slides.length === 0 ? (
        <GenerationControls
          topic={topic} setTopic={setTopic}
          slideCount={slideCount} setSlideCount={setSlideCount}
          loading={loading}
          onGenerate={handleGenerate} userTokens={userTokens}
        />
      ) : (
        <div className="flex flex-col gap-6 max-w-7xl mx-9 pt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Hasil Carousel</h2>
            <Button variant="ghost" onClick={() => setSlides([])}>Clear</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {slides.map((s, i) => (
              <SlidePreview
                key={i}
                slide={s}
                theme={selectedTheme}
                totalSlides={slides.length}
                onClick={() => setSelectedSlideIndex(i)}
              />
            ))}
          </div>
        </div>
      )}

      {selectedSlideIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={() => setSelectedSlideIndex(null)}>
          <div className="bg-white p-4 rounded-3xl relative" onClick={e => e.stopPropagation()}>
            <div className="absolute top-6 right-6 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm font-mono">
              {selectedSlideIndex + 1}/{slides.length}
            </div>
            <div className="relative flex items-center justify-center">
              <PreviewScaleWrapper width={500}>
                <SlideRenderer
                  slide={slides[selectedSlideIndex]}
                  theme={selectedTheme}
                  totalSlides={slides.length}
                />
              </PreviewScaleWrapper>
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                <Button
                  variant="ghost" size="icon"
                  onClick={() => setSelectedSlideIndex(prev => prev !== null ? Math.max(0, prev - 1) : null)}
                  disabled={selectedSlideIndex === 0}
                  className="bg-white/50 backdrop-blur-sm hover:bg-white/80 pointer-events-auto"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  onClick={() => setSelectedSlideIndex(prev => prev !== null ? Math.min(slides.length - 1, prev + 1) : null)}
                  disabled={selectedSlideIndex === slides.length - 1}
                  className="bg-white/50 backdrop-blur-sm hover:bg-white/80 pointer-events-auto"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {slides.length > 0 && (
        <div className="fixed bottom-6 left-16 right-0 z-40 flex justify-center pointer-events-none">
          <div className="flex gap-3 px-5 py-2 rounded-full border border-slate-200 bg-white/90 backdrop-blur-md shadow-2xl pointer-events-auto">
            <Button onClick={handleExportPNG} disabled={exportingPNG} variant="ghost" size="sm" className="gap-2 rounded-full px-4">
              {exportingPNG ? <><Loader2 className="size-4 animate-spin" />{exportingPNGProgress}%</> : <><ImageIcon className="size-4"/>PNG</>}
            </Button>
            <div className="w-px bg-slate-200 my-1.5"/>
            <Button onClick={handleExportPDF} disabled={exportingPDF} variant="ghost" size="sm" className="gap-2 rounded-full px-4">
              {exportingPDF ? <><Loader2 className="size-4 animate-spin"/>{exportingPDFProgress}%</> : <><FileText className="size-4"/>PDF</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}