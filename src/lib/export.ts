import React from "react"
import { createRoot } from "react-dom/client"
import html2canvas from "html2canvas-pro"
import * as htmlToImage from "html-to-image"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { jsPDF } from "jspdf"
import type { Theme } from "@/lib/themes"
import { type Slide, SlideRenderer } from "@/components/carousel/SlideRenderer"

export async function renderHiddenSlideLegacy(slide: Slide, theme: Theme) {
  const container = document.createElement("div")
  container.style.position = "absolute"
  container.style.left = "-9999px"
  container.style.top = "0"
  container.style.width = "1080px"
  container.style.height = "1080px"
  container.style.background = "#ffffff"
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(
    React.createElement(
      "div",
      { className: "w-[1080px] h-[1080px] bg-white overflow-hidden" },
      React.createElement(SlideRenderer, { slide, theme })
    )
  )

  await new Promise((resolve) => setTimeout(resolve, 800))
  const canvas = await html2canvas(container, {
    scale: 1,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  })
  root.unmount()
  document.body.removeChild(container)
  return canvas
}

export async function renderHiddenSlide(slide: Slide, theme: Theme) {
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.top = "0"
  container.style.left = "0"
  container.style.width = "1080px"
  container.style.height = "1080px"
  container.style.opacity = "0"
  container.style.pointerEvents = "none"
  container.style.zIndex = "-1000"
  container.style.background = "#ffffff"
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(
    React.createElement(
      "div",
      { 
        className: "w-[1080px] h-[1080px] bg-white overflow-hidden",
        style: { width: '1080px', height: '1080px' }
      },
      React.createElement(SlideRenderer, { slide, theme })
    )
  )

  // Tunggu hingga React selesai rendering dan font terload
  await new Promise((resolve) => setTimeout(resolve, 1200))
  
  try {
    // Pastikan konten sudah ada di dalam container sebelum capture
    if (!container.innerHTML || container.children.length === 0) {
      throw new Error("Container is empty");
    }

    const canvas = await htmlToImage.toCanvas(container, {
      width: 1080,
      height: 1080,
      style: {
        opacity: '1', // Paksa opacity 1 hanya saat capture
        visibility: 'visible',
      },
      pixelRatio: 1, // Maintain 1:1 scale as per original requirement
    })
    
    root.unmount()
    document.body.removeChild(container)
    return canvas
  } catch (error) {
    console.error("Export failed, falling back to legacy", error)
    root.unmount()
    document.body.removeChild(container)
    return await renderHiddenSlideLegacy(slide, theme)
  }
}

export async function exportPNG(slides: Slide[], theme: Theme, onProgress?: (p: number) => void) {
  const zip = new JSZip()
  for (let i = 0; i < slides.length; i++) {
    if (onProgress) onProgress(Math.round(((i + 1) / slides.length) * 100))
    const canvas = await renderHiddenSlide(slides[i], theme)
    const imgData = canvas.toDataURL("image/png").split(",")[1]
    zip.file(`slide-${i + 1}.png`, imgData, { base64: true })
  }
  const content = await zip.generateAsync({ type: "blob" })
  saveAs(content, "slides.zip")
}

export async function exportPDF(slides: Slide[], theme: Theme, onProgress?: (p: number) => void) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [1080, 1080] })
  for (let i = 0; i < slides.length; i++) {
    if (onProgress) onProgress(Math.round(((i + 1) / slides.length) * 100))
    const canvas = await renderHiddenSlide(slides[i], theme)
    if (i > 0) pdf.addPage([1080, 1080])
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 1080, 1080)
  }
  pdf.save("carousel.pdf")
}
