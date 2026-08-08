import { useEffect, useState, useRef } from "react"
import { getHistory, deleteCarousel, getBrandSettings } from "@/lib/db"
import { deriveDefaultHandle } from "@/lib/brandDefaults"
import { supabase } from "@/lib/supabase"
import { Loader2, Trash2, X, Layout, ChevronLeft, ChevronRight, Search,
CheckSquare, Square, MoreVertical, FileImage, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { SlideRenderer, PreviewScaleWrapper } from "@/components/carousel/SlideRenderer"
import { exportPNG, exportPDF } from "@/lib/export"
import { parseError } from "@/lib/utils"

export function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedHistory, setSelectedHistory] = useState<any | null>(null)
  const [isTitleExpanded, setIsTitleExpanded] = useState(false)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const slides = selectedHistory ? (Array.isArray(selectedHistory.content) ? selectedHistory.content : selectedHistory.content?.slides) : [];
  const theme = selectedHistory?.content?.theme;
  const currentSlide = slides && slides.length > 0 ? slides[activeSlideIndex] : null;

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [brandSettings, setBrandSettings] = useState<any | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")

  const resolvedHandle = brandSettings?.display_handle || (userEmail ? deriveDefaultHandle(userEmail) : "")
  const brandIdentity = {
    show: selectedHistory?.show_brand_identity ?? true,
    handle: resolvedHandle,
    website: brandSettings?.website_url || "",
  }

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const pressTimer = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handlePressStart = (id: string) => {
    if (isSelectionMode) return
    pressTimer.current = setTimeout(() => {
      setIsSelectionMode(true)
      toggleSelect(id)
    }, 1000)
  }

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedIds(newSelected)
  }

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHistory()
      setHistory(data)
    } catch (err: any) {
      const msg = parseError(err)
      setError(msg)
      toast.error("Error", { description: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {

    try {
      await deleteCarousel(id)
      setHistory(prev => prev.filter(item => item.id !== id))
      toast.success("Riwayat dihapus")
      setSelectedHistory(null)
      await fetchHistory()
    } catch (err) {
      toast.error("Gagal menghapus riwayat")
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteCarousel(id)))
      setHistory(prev => prev.filter(item => !selectedIds.has(item.id)))
      setSelectedIds(new Set())
      toast.success("Riwayat terpilih dihapus")
    } catch (err: any) {
      console.error("Bulk Delete Error:", err)
      toast.error(`Gagal: ${err.message || "Terjadi kesalahan"}`)
    }
  }

  const handleNext = () => {
    if (!selectedHistory) return
    const slides = Array.isArray(selectedHistory.content) ? selectedHistory.content : selectedHistory.content?.slides;
    if (slides && activeSlideIndex < slides.length - 1) {
      setActiveSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex((prev) => prev - 1);
    }
  };

  const handleExport = async (type: 'png' | 'pdf') => {
    if (!selectedHistory?.content) return
    setShowExportMenu(false)
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    if (!slides || slides.length === 0) return;

    try {
      setIsExporting(true)
      setExportProgress(0)
      if (type === 'png') {
        await exportPNG(slides, theme, brandIdentity, setExportProgress, signal)
      } else {
        await exportPDF(slides, theme, brandIdentity, setExportProgress, signal)
      }
      toast.success(`Berhasil export ${type.toUpperCase()}`)
    } catch (err: any) {
      if (err.message === "Aborted") return;
      toast.error(`Gagal export ${type.toUpperCase()}`)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  function handleCancelExport() {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    setIsExporting(false)
    setExportProgress(0)
    toast.info("Export dibatalkan")
  }

  useEffect(() => {
    fetchHistory();
    getBrandSettings().then(setBrandSettings).catch(() => setBrandSettings(null));
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setUserEmail(data.user.email)
    });
  }, []);

  useEffect(() => {
    setActiveSlideIndex(0);
    setIsTitleExpanded(false);
  }, [selectedHistory]);

  const filteredHistory = history.filter(item =>
    item.topic.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline-block" /></div>

  if (error) return (
    <div className="p-20 text-center space-y-4">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-500">
        <AlertCircle size={40} />
      </div>
      <div>
        <h3 className="text-xl font-semibold">Gagal memuat riwayat</h3>
        <p className="text-slate-500">{error}</p>
      </div>
      <Button onClick={fetchHistory} className="gap-2">
        <Loader2 className={`size-4 ${loading ? "animate-spin" : ""}`} /> Coba Lagi
      </Button>
    </div>
  )

  return (
    <div className="w-full py-4 px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Riwayat</h2>
        <div className="flex gap-4 items-center">
          {isSelectionMode ? (
            <Button variant="outline" size="sm" onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }}>
              Batal
            </Button>
          ) : null}
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-2">
              <Trash2 size={16} /> Hapus Terpilih ({selectedIds.size})
            </Button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              placeholder="Cari topik..."
              className="pl-9 w-64 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <Layout size={40} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Belum ada riwayat</h3>
          <p className="text-slate-500 max-w-xs mx-auto">
            Konten carousel yang Anda generate akan muncul di sini. Yuk, buat konten pertamamu!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className={`group bg-white dark:bg-slate-900 border rounded-2xl p-6 aspect-square flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl relative ${
                isSelectionMode ? "hover:border-indigo-400" : "hover:-translate-y-1 hover:border-indigo-400"
              } ${selectedIds.has(item.id) ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-200 dark:border-slate-800"}`}
              onClick={() => {
                if (isSelectionMode) {
                  toggleSelect(item.id);
                } else {
                  setSelectedHistory(item);
                }
              }}
              onMouseDown={() => handlePressStart(item.id)}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={() => handlePressStart(item.id)}
              onTouchEnd={handlePressEnd}
            >
              {isSelectionMode && (
                <div className="absolute top-4 left-4 z-10">
                  {selectedIds.has(item.id) ? (
                    <CheckSquare className="text-indigo-500" size={20} />
                  ) : (
                    <Square className="text-slate-400" size={20} />
                  )}
                </div>
              )}

              <div className="relative w-12 h-12 mb-4 mx-auto">
                <div className="absolute top-0 right-0 w-10 h-10 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800 rotate-2"></div>
                <div className="absolute top-1 right-1 w-10 h-10 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-200 dark:bg-slate-700 -rotate-1"></div>
                <div className="absolute top-2 right-2 w-10 h-10 border border-indigo-300 dark:border-indigo-600 rounded-lg bg-indigo-50 dark:bg-indigo-900 shadow-sm flex items-center justify-center">
                  <Layout size={16} className="text-indigo-400" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-base line-clamp-2 text-center">{item.topic}</h4>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedHistory && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedHistory(null)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-0 max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e =>
          e.stopPropagation()}>
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 flex justify-between items-start px-6 py-2">
              <h3
                className={`text-lg font-bold mr-13 cursor-pointer transition-all ${isTitleExpanded ? '' : 'truncate'}`}
                onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                title={isTitleExpanded ? "" : "Klik untuk melihat judul lengkap"}
              >
                {selectedHistory.topic}
              </h3>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleDelete(selectedHistory.id)} className="text-destructive">
                  <Trash2 size={18} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedHistory(null)}>
                  <X size={18} />
                </Button>
              </div>
            </div>
            <div className="flex flex-col">
              
                  <div className="relative flex items-center justify-center overflow-hidden min-h-[400px] border-y border-slate-200 dark:border-slate-700 bg-slate-100">
                    <div className="w-full aspect-[4/5] flex items-center justify-center">
                      <PreviewScaleWrapper width={384}>
                        <SlideRenderer
                          slide={currentSlide}
                          theme={theme}
                          totalSlides={slides.length}
                          brandIdentity={brandIdentity}
                        />
                      </PreviewScaleWrapper>
                    </div>

                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between">
                      <Button variant="ghost" size="icon" onClick={handlePrev} disabled={activeSlideIndex === 0} className="bg-white/50 backdrop-blur-sm hover:bg-white/80">
                        <ChevronLeft />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleNext} disabled={activeSlideIndex === (slides.length - 1)} className="bg-white/50 backdrop-blur-sm hover:bg-white/80">
                        <ChevronRight />
                      </Button>
                    </div>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                    px-3 py-1 rounded-full bg-white/40 backdrop-blur-sm border
                    border-white/10 text-black text-[10px] font-medium tracking-wider
                    uppercase z-10">
                      Slide {activeSlideIndex + 1} / {slides.length}
                    </div>

                    <div className="absolute top-4 right-4">
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="bg-white/50 backdrop-blur-sm hover:bg-white/80 rounded-full"
                      >
                        <MoreVertical size={20} />
                      </Button>

                      {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 py-2 animate-in fade-in slide-in-from-top-2">
                          <Button
                            variant="ghost" className="w-full justify-start gap-2 px-4 py-2 text-sm"
                            onClick={() => handleExport('png')}
                          >
                            <FileImage size={16} /> PNG
                          </Button>
                          <Button
                            variant="ghost" className="w-full justify-start gap-2 px-4 py-2 text-sm"
                            onClick={() => handleExport('pdf')}
                          >
                            <FileText size={16} /> PDF
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                
            </div>
          </div>
        </div>
      )}
    
                {isExporting && (
                  <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pointer-events-auto">
                    <div className="flex flex-col items-center gap-4 max-w-xs w-full text-center">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold">Exporting...</h3>
                        <p className="text-sm text-slate-500">Mohon tunggu, sedang memproses file Anda.</p>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full transition-[width] duration-300 ease-out"
                          style={{ width: `${exportProgress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-400">
                        {exportProgress || 0}% Selesai
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full max-w-3xs rounded-full py-6 text-lg border-2 border-red-500 shadow-xl"
                      onClick={handleCancelExport}
                    >
                      <span className="text-white font-medium">Batal</span>
                    </Button>
                  </div>
                )}
</div>
  )
}
