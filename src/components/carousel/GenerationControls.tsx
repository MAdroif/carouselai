import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Minus, Plus } from "lucide-react"
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
}

export function GenerationControls({ 
  topic, setTopic, slideCount, setSlideCount, loading, onGenerate, userTokens 
}: GenerationControlsProps) {
  const [inputMode] = useState<'topic' | 'script'>('topic')
  const [selectedTheme, setSelectedTheme] = useState<string>("Minimalist Clean")

  const handleGenerateClick = () => {
    if (userTokens < 1) {
      toast.error("Token Anda habis!", {
        description: "Silakan upgrade paket Anda untuk lanjut berkreasi dan mendapatkan lebih banyak kredit.",
      });
      return;
    }
    onGenerate(selectedTheme);
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-8 relative">
      
      <div className="mb-30 mt-15 text-center relative">
        <h1 className="text-5xl font-bold tracking-tight dark:text-[#f0f0f0]">
          Buat Konten Carousel dengan AI
        </h1>
        <p className="mt-4 text-lg dark:text-[#f0f0f0]">
          {inputMode === 'topic' ? 'Deskripsikan apa yang ingin Anda buat.' : 'Tempel skrip lengkap Anda di sini.'}
        </p>
      </div>

      <div className="rounded-3xl bg-white border dark:border-[#2e2e2e] dark:bg-[#242424] p-5 shadow-sm relative">
        <textarea
          className="min-h-[28px] w-full resize-none border-none outline-none
          text-md"
          placeholder={inputMode === 'topic' ? "Contoh: 5 peluang karir masa depan..." : "Tempel skrip lengkap Anda di sini..."}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
             {/* 
             <Button
               variant="ghost"
               size="sm"
               onClick={toggleMode}
               className="rounded-xl dark:text-[#f0f0f0] border dark:border-[#2e2e2e] h-9 px-3 text-xs gap-2"
             >
               <Repeat size={14} /> {inputMode === 'topic' ? 'Skrip' : 'Topik'}
             </Button> 
             */}
             
             <Select value={selectedTheme} onValueChange={setSelectedTheme}>
               <SelectTrigger className="w-[140px] rounded-xl h-9 text-xs
               dark:text-[#f0f0f0] dark:border-[#2e2e2e]">
                 <SelectValue placeholder="Tema" />
               </SelectTrigger>
               <SelectContent className="bg-white dark:bg-[#2e2e2e]">
                 <SelectItem value="Bold Modern">Bold Modern</SelectItem>
                 <SelectItem value="Minimalist Clean">Minimalist Clean</SelectItem>
               </SelectContent>
             </Select>
             
             <div className="flex items-center gap-2 border dark:border-[#2e2e2e] rounded-xl px-3">
               <span className="text-xs font-medium dark:text-[#f0f0f0]">Slide:</span>
               <button className="text-slate-400 hover:text-[#f0f0f0]" onClick={() => setSlideCount(Math.max(3, slideCount - 1))}><Minus size={14} /></button>
               <span className="text-sm font-semibold w-4 text-center">{slideCount}</span>
               <button className="text-[#f0f0f0] hover:text-[#f0f0f0]" onClick={() => setSlideCount(Math.min(10, slideCount + 1))}><Plus size={14} /></button>
             </div>
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
