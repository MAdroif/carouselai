// @/lib/export.ts
import React from "react"
import { createRoot } from "react-dom/client"
import { flushSync } from "react-dom"
import Konva from "konva"
import jsPDF from "jspdf"
import { SlideRenderer, CANVAS_W, CANVAS_H, type Slide, type BrandIdentity } from "@/components/carousel/SlideRenderer"
import type { Theme } from "@/lib/themes"

const PIXEL_RATIO = 1.5

// ─── Export dari stage yang sudah ada di layar (GeneratorPage) ───────────────
export async function exportPNGFromRefs(
  stageRefs: React.RefObject<Konva.Stage>[],
  onProgress?: (progress: number) => void,
  cancelRef?: { cancelled: boolean },
): Promise<void> {
  const JSZip = (await import("jszip")).default
  const zip = new JSZip()
  const total = stageRefs.length

  for (let i = 0; i < total; i++) {
    if (cancelRef?.cancelled) return
    const stage = stageRefs[i].current
    if (!stage) throw new Error(`Stage slide ${i + 1} tidak ditemukan`)
    const dataURL = stage.toDataURL({ pixelRatio: PIXEL_RATIO })
    const base64 = dataURL.split(",")[1]
    zip.file(`slide-${String(i + 1).padStart(2, "0")}.png`, base64, { base64: true })
    onProgress?.(Math.round(((i + 1) / total) * 90))
  }

  if (cancelRef?.cancelled) return
  const blob = await zip.generateAsync({ type: "blob" })
  const link = document.createElement("a")
  link.download = "glito-carousel.zip"
  link.href = URL.createObjectURL(blob)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
  onProgress?.(100)
}

export async function exportPDFFromRefs(
  stageRefs: React.RefObject<Konva.Stage>[],
  onProgress?: (progress: number) => void,
  cancelRef?: { cancelled: boolean },
): Promise<void> {
  const total = stageRefs.length
  const exportW = CANVAS_W * PIXEL_RATIO
  const exportH = CANVAS_H * PIXEL_RATIO
  const mmW = exportW * 0.2646
  const mmH = exportH * 0.2646
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [mmW, mmH] })

  for (let i = 0; i < total; i++) {
    if (cancelRef?.cancelled) return
    const stage = stageRefs[i].current
    if (!stage) throw new Error(`Stage slide ${i + 1} tidak ditemukan`)
    const dataURL = stage.toDataURL({ pixelRatio: PIXEL_RATIO })
    if (i > 0) pdf.addPage([mmW, mmH])
    pdf.addImage(dataURL, "PNG", 0, 0, mmW, mmH)
    onProgress?.(Math.round(((i + 1) / total) * 100))
  }

  pdf.save("glito-carousel.pdf")
}

// ─── Export offscreen (HistoryPage, slide tidak semua di layar) ──────────────
async function renderSlideToDataURL(
  slide: Slide,
  theme: Theme,
  totalSlides: number,
  brandIdentity?: BrandIdentity,
): Promise<string> {
  const host = document.createElement("div")
  Object.assign(host.style, {
    position: "fixed", left: "-99999px", top: "0",
    width: `${CANVAS_W}px`, height: `${CANVAS_H}px`, pointerEvents: "none",
  })
  document.body.appendChild(host)

  return new Promise<string>((resolve, reject) => {
    const stageRef = React.createRef<Konva.Stage>()
    const root = createRoot(host)
    let settled = false

    function cleanup() {
      try { root.unmount() } catch (_) {}
      try { document.body.removeChild(host) } catch (_) {}
    }

    flushSync(() => {
      root.render(
        React.createElement(SlideRenderer, {
          slide, theme, totalSlides, brandIdentity,
          displayWidth: CANVAS_W, stageRef,
        })
      )
    })

    let attempts = 0
    const MAX_ATTEMPTS = 20

    function tryCapture() {
      if (settled) return
      const stage = stageRef.current
      if (!stage) {
        if (attempts >= MAX_ATTEMPTS) {
          settled = true
          cleanup()
          reject(new Error("Stage tidak mount"))
          return
        }
        attempts++
        setTimeout(tryCapture, 100)
        return
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (settled) return
          try {
            const dataURL = stage.toDataURL({ pixelRatio: PIXEL_RATIO })
            settled = true
            cleanup()
            resolve(dataURL)
          } catch (err) {
            settled = true
            cleanup()
            reject(err)
          }
        })
      })
    }

    setTimeout(tryCapture, 50)
  })
}

export async function exportPNG(
  slides: Slide[],
  theme: Theme,
  brandIdentity: BrandIdentity,
  onProgress?: (progress: number) => void,
  cancelRef?: { cancelled: boolean },
): Promise<void> {
  const JSZip = (await import("jszip")).default
  const zip = new JSZip()
  const total = slides.length

  for (let i = 0; i < total; i++) {
    if (cancelRef?.cancelled) return
    const dataURL = await renderSlideToDataURL(slides[i], theme, total, brandIdentity)
    if (cancelRef?.cancelled) return
    const base64 = dataURL.split(",")[1]
    zip.file(`slide-${String(i + 1).padStart(2, "0")}.png`, base64, { base64: true })
    onProgress?.(Math.round(((i + 1) / total) * 90))
  }

  if (cancelRef?.cancelled) return
  const blob = await zip.generateAsync({ type: "blob" })
  const link = document.createElement("a")
  link.download = "glito-carousel.zip"
  link.href = URL.createObjectURL(blob)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
  onProgress?.(100)
}

export async function exportPDF(
  slides: Slide[],
  theme: Theme,
  brandIdentity: BrandIdentity,
  onProgress?: (progress: number) => void,
  cancelRef?: { cancelled: boolean },
): Promise<void> {
  const total = slides.length
  const exportW = CANVAS_W * PIXEL_RATIO
  const exportH = CANVAS_H * PIXEL_RATIO
  const mmW = exportW * 0.2646
  const mmH = exportH * 0.2646
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [mmW, mmH] })

  for (let i = 0; i < total; i++) {
    if (cancelRef?.cancelled) return
    const dataURL = await renderSlideToDataURL(slides[i], theme, total, brandIdentity)
    if (cancelRef?.cancelled) return
    if (i > 0) pdf.addPage([mmW, mmH])
    pdf.addImage(dataURL, "PNG", 0, 0, mmW, mmH)
    onProgress?.(Math.round(((i + 1) / total) * 100))
  }

  pdf.save("glito-carousel.pdf")
}
