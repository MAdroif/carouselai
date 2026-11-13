import { useState, useRef, useLayoutEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Minus, Plus, Repeat, Minimize2, Maximize2, ImageIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface GenerationControlsProps {
  topic: string
  setTopic: (val: string) => void
  slideCount: number
  setSlideCount: (val: number) => void
  loading: boolean
  onGenerate: (theme: string) => void
  userTokens: number
  inputMode: 'topic' | 'script'
  setInputMode: (val: 'topic' | 'script') => void
  autoImage: boolean // FITUR-GAMBAR
  setAutoImage: (val: boolean) => void // FITUR-GAMBAR
}

export function GenerationControls({ 
  topic, setTopic, slideCount, setSlideCount, loading, onGenerate, userTokens,
  inputMode, setInputMode, autoImage, setAutoImage
}: GenerationControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("Edukasi & Psikologi")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [grow, setGrow] = useState(0)
  const COLLAPSED_H = 28
  const MAX_H = 148
  
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    if (isExpanded) { el.style.height = ""; setGrow(0); return }
    el.style.height = "auto"
    const h = Math.max(COLLAPSED_H, Math.min(el.scrollHeight, MAX_H))
    el.style.height = `${h}px`
    setGrow(h - COLLAPSED_H)
  }, [topic, isExpanded, inputMode])

  const toggleMode = () => {
    setInputMode(inputMode === 'topic' ? 'script' : 'topic')
  }

  const handleGenerateClick = () => {
    if (userTokens < 1) {
      toast.error("Token Anda habis!", {
        description: "Silakan upgrade paket Anda untuk lanjut berkreasi dan mendapatkan lebih banyak kredit.",
      });
      return;
    }
    if (inputMode === 'script' && topic.trim().length < 50) {
      toast.error("Skrip terlalu pendek", {
        description: "Minimal 50 karakter buat mode skrip.",
      });
      return;
    }
    onGenerate(selectedTheme);
  }

  return (
    <div
      className={isExpanded
        ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
        : 'w-full max-w-4xl mx-auto px-8 relative'}
      onClick={() => isExpanded && setIsExpanded(false)}
    >

      {!isExpanded && (
        <div className="mb-30 mt-15 text-center relative">
          <h1 className="text-5xl font-bold tracking-tight dark:text-[#f0f0f0]">
            Buat Konten Carousel dengan AI
          </h1>
          <p className="mt-4 text-lg dark:text-[#f0f0f0]">
            {inputMode === 'topic' ? 'Deskripsikan apa yang ingin Anda buat.' : 'Tempel skrip lengkap Anda di sini.'}
          </p>
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{ marginTop: isExpanded ? 0 : -grow }}
        className={`rounded-3xl bg-white border dark:border-[#2e2e2e] dark:bg-[#242424] p-5 shadow-sm relative w-full flex flex-col ${isExpanded ? 'max-w-4xl h-[80vh]' : ''}`}>
        <textarea
          ref={textareaRef}
          rows={1}
          className={`w-full resize-none border-none outline-none text-md bg-transparent overflow-y-auto ${inputMode === 'script' ? 'pr-10' : ''} ${isExpanded ? 'flex-1 min-h-0' : ''}`}
          placeholder={inputMode === 'topic' ? "Contoh: 5 peluang karir masa depan..." : "Tempel skrip lengkap Anda di sini..."}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        {/* Tombol Expand */}
        {inputMode === 'script' && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-[#2e2e2e] rounded-full hover:bg-slate-200 dark:hover:bg-[#3e3e3e]"
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2 flex-wrap">
             <Button
               variant="ghost"
               size="sm"
               onClick={toggleMode}
               className="rounded-xl dark:text-[#f0f0f0] border dark:border-[#2e2e2e] h-9 px-3 text-xs gap-2"
             >
               <Repeat size={14} /> {inputMode === 'topic' ? 'Skrip' : 'Topik'}
             </Button>
             
             <Select value={selectedTheme} onValueChange={setSelectedTheme}>
               <SelectTrigger className="w-[140px] rounded-xl h-9 text-xs
               dark:text-[#f0f0f0] dark:border-[#2e2e2e]">
                 <SelectValue placeholder="Tema" />
               </SelectTrigger>
               <SelectContent className="bg-white dark:bg-[#2e2e2e]">
                 <SelectItem value="Edukasi & Psikologi">Edukasi & Psikologi</SelectItem>
                 <SelectItem value="Tech & Digital">Tech & Digital</SelectItem>
                 <SelectItem value="Karier & Bisnis">Karier & Bisnis</SelectItem>
                 <SelectItem value="Viral & Promosi">Viral & Promosi</SelectItem>
               </SelectContent>
             </Select>

            {/* ▼▼▼ FITUR-GAMBAR: MULAI (tombol foto otomatis) ▼▼▼ */}
             <Button
               variant="ghost"
               size="sm"
               onClick={() => setAutoImage(!autoImage)}
               className={`rounded-xl h-9 px-3 text-xs gap-2 border dark:border-[#2e2e2e] ${
                 autoImage
                   ? "bg-blue text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                   : "dark:text-[#f0f0f0]"
               }`}
              >
               <ImageIcon size={14} /> Foto {autoImage ? "Aktif" : "Mati"}
             </Button>
            {/* ▲▲▲ FITUR-GAMBAR: SELESAI ▲▲▲ */}
             
             {inputMode === 'topic' && (
               <div className="flex items-center gap-2 border dark:border-[#2e2e2e] rounded-xl px-3">
                 <span className="text-xs font-medium dark:text-slate-700">Slide:</span>
                 <button className="text-slate-400 hover:text-slate-700" onClick={() => setSlideCount(Math.max(3, slideCount - 1))}><Minus size={14} /></button>
                 <span className="text-sm font-semibold w-4 text-center">{slideCount}</span>
                 <button className="text-slate-400 hover:text-slate-700" onClick={() => setSlideCount(Math.min(10, slideCount + 1))}><Plus size={14} /></button>
               </div>
             )}
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleGenerateClick} disabled={loading ||
            !topic.trim()} className="rounded-xl bg-blue-600 px-8 py-3
            text-white hover:bg-blue-700 shadow-[0_0_15px_rgba(37, 99, 235,0.4)]">
              {loading ? <Loader2 className="animate-spin" /> : "1 Generate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
