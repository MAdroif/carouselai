import { createRoot } from "react-dom/client"
import html2canvas from "html2canvas-pro"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { jsPDF } from "jspdf"
import { Slide, Theme } from "@/types"
import { SlideRenderer } from "@/components/slide-renderer"

export async function renderHiddenSlide(slide: Slide, theme: Theme) {
  const container = document.createElement("div")
  container.style.position = "absolute"
  container.style.left = "-9999px"
  container.style.top = "0"
  container.style.width = "540px"
  container.style.height = "540px"
  container.style.background = "#ffffff"
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(
    <div className="w-[540px] h-[540px] bg-white overflow-hidden">
      <SlideRenderer slide={slide} theme={theme} />
    </div>
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
