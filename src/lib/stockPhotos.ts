// ▼▼▼ FITUR-GAMBAR: MULAI (ambil foto stock otomatis untuk semua slide) ▼▼▼
import { supabase } from "@/lib/supabase"
import type { Slide } from "@/components/carousel/SlideRenderer"

export async function attachStockImages(slides: Slide[]): Promise<Slide[]> {
  const idxs = slides.map((s, i) => (s.image_keyword?.trim() ? i : -1)).filter((i) => i >= 0)
  if (idxs.length === 0) return slides

  const { data, error } = await supabase.functions.invoke("stock-photo", {
    body: { keywords: idxs.map((i) => slides[i].image_keyword.trim()) },
  })
  if (error || !data?.photos) throw new Error(error?.message || "Gagal ambil foto")

  const next = [...slides]
  idxs.forEach((slideIdx, n) => {
    const p = data.photos[n]
    if (!p) return
    next[slideIdx] = {
      ...next[slideIdx],
      image_url: p.url,
      image_credit: { name: p.photographer, url: p.photographer_url },
    }
  })
  return next
}
// ▲▲▲ FITUR-GAMBAR: SELESAI ▲▲▲