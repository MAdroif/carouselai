// @/lib/export.ts
import React from "react"
import { createRoot } from "react-dom/client"
import { flushSync } from "react-dom"
import Konva from "konva"
import jsPDF from "jspdf"
import { SlideRenderer, CANVAS_W, CANVAS_H, type Slide, type BrandIdentity } from "@/components/carousel/SlideRenderer"
import type { Theme } from "@/lib/themes"

const FONT_FAMILY = "Plus Jakarta Sans"
const FONT_WEIGHTS = [400, 500, 600, 700, 800]
const PIXEL_RATIO = 1.5

// ─── Preload font ────────────────────────────────────────────────────────────
async function ensureFontsLoaded(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return
  // Selalu load ulang, jangan cache, karena stage offscreen butuh font fresh
  await Promise.all(FONT_WEIGHTS.map((w) => document.fonts.load(`${w} 60px "${FONT_FAMILY}"`)))
  await document.fonts.ready
}

// ─── Render 1 slide ke dataURL ───────────────────────────────────────────────
async function renderSlideToDataURL(
  slide: Slide,
  theme: Theme,
  totalSlides: number,
  brandIdentity?: BrandIdentity,
): Promise<string> {
  await ensureFontsLoaded()

  const host = document.createElement("div")
  Object.assign(host.style, {
    position: "fixed", left: "-99999px", top: "0",
    width: `${CANVAS_W}px`, height: `${CANVAS_H}px`, pointerEvents: "none",
  })
  document.body.appendChild(host)

  return new Promise<string>((resolve, reject) => {
    const stageRef = React.createRef<Konva.Stage>()
    const root = createRoot(host)

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
    let settled = false

    function cleanup() {
      try { root.unmount() } catch (_) {}
      try { document.body.removeChild(host) } catch (_) {}
    }

    function tryCapture() {
      if (settled) return
      const stage = stageRef.current

      if (!stage) {
        if (attempts >= MAX_ATTEMPTS) {
          settled = true
          cleanup()
          reject(new Error("Stage tidak mount setelah 2 detik"))
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
            const base64 = dataURL.split(",")[1] || ""

            if (base64.length < 10000 && attempts < MAX_ATTEMPTS) {
              attempts++
              setTimeout(tryCapture, 150)
              return
            }

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

// ─── Export PNG (ZIP) ────────────────────────────────────────────────────────
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

// ─── Export PDF ──────────────────────────────────────────────────────────────
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
