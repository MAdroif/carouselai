import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Zap, PencilLine, Palette, Upload, Cpu, Smartphone, Rocket } from "lucide-react"
import "./LandingPage.css"
import { type Slide } from "@/components/carousel/SlideRenderer"

const creamTheme = {
  bg: "#FAFAFA",
  name: "Minimalist Clean",
  text: "#27272A",
  bgAlt: "#F4F4F5",
  accent: "#09090B",
  gradient: "linear-gradient(180deg, #FAFAFA 0%, #F4F4F5 100%)",
  highlight: "#F97316",
  textMuted: "#71717A",
  accentText: "#FFFFFF",
  fontWeight: "500",
}

const exampleSlides: Slide[] = [
  {
    items: [],
    slide: 1,
    title: "Desain Carousel Lu Bagus Tapi Sepi Mulu?",
    svg_code: "<svg viewBox='0 0 100 100'><circle cx='100' cy='50' r='40' fill='currentColor' opacity='0.08'/><line x1='10' y1='10' x2='90' y2='10' stroke='currentColor' stroke-width='0.5' stroke-dasharray='2'/></svg>",
    body_text: "Ternyata ini penyebab aslinya, sadar gak?",
    highlights: ["sadar gak?"],
    highlight_bg: "#F97316",
    image_keyword: "minimalist design concept",
    composition: { focus: "headline", style: "bold", accent: "none", alignment: "center" },
  },
  {
    items: [],
    slide: 2,
    title: "Bukan Soal Estetika, Tapi Soal Retensi",
    svg_code: "<svg viewBox='0 0 100 100'><line x1='10' y1='0' x2='10' y2='100' stroke='currentColor' stroke-width='0.2' stroke-dasharray='1 3'/><line x1='30' y1='0' x2='30' y2='100' stroke='currentColor' stroke-width='0.2' stroke-dasharray='1 3'/><line x1='50' y1='0' x2='50' y2='100' stroke='currentColor' stroke-width='0.2' stroke-dasharray='1 3'/></svg>",
    body_text: "Algoritma gak peduli sama visual estetik kamu.",
    highlights: ["visual estetik kamu"],
    highlight_bg: "#F97316",
    image_keyword: "simple minimal graphic",
    composition: { focus: "balanced", style: "minimalist", accent: "line", alignment: "left" },
  },
  {
    items: [
      {
        item_title: "1. Swipe Ke Kanan",
        icon_keyword: "swipe",
        item_description: "Nunjukin kalau audiens kamu beneran tertarik membaca kelanjutan ceritamu.",
      },
      {
        item_title: "2. Waktu Membaca",
        icon_keyword: "time",
        item_description: "Sembari swipe, dwell time atau durasi bertahan di postinganmu otomatis meroket.",
      },
      {
        item_title: "3. Sinyal FYP",
        icon_keyword: "signal",
        item_description: "Sistem ngebaca ini sebagai sinyal positif dan langsung nyebarin kontenmu lebih luas.",
      },
    ],
    slide: 3,
    title: "Gini Cara Kerja Mesin Rekomendasi IG",
    svg_code: "<svg viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='none' stroke='currentColor' stroke-width='0.5' stroke-dasharray='4'/><circle cx='50' cy='50' r='30' fill='none' stroke='currentColor' stroke-width='0.3' stroke-dasharray='2'/></svg>",
    body_text: "Setiap swipe itu kayak vote buat kontenmu.",
    highlights: ["vote buat kontenmu"],
    image_keyword: "organic workflow connection",
    composition: { focus: "balanced", style: "card-flow", accent: "none", alignment: "left" },
  },
  {
    items: [
      {
        item_title: "Hook Kuat",
        icon_keyword: "hook",
        item_description: "Bikin rasa penasaran yang gak tertahankan di 3 detik pertama slide satu kamu.",
      },
      {
        item_title: "Jembatan Logika",
        icon_keyword: "bridge",
        item_description: "Tiap akhir slide harus bikin orang reflek bertanya 'eh terus kelanjutannya gimana?'.",
      },
      {
        item_title: "Satu Topik",
        icon_keyword: "focus",
        item_description: "Jangan maruk. Bahas satu masalah spesifik aja biar audiens gak pusing bacanya.",
      },
    ],
    slide: 4,
    title: "3 Aturan Biar Orang Betah Swipe",
    svg_code: "<svg viewBox='0 0 100 100'><rect x='10' y='10' width='30' height='30' fill='none' stroke='currentColor' stroke-width='0.5' stroke-dasharray='1'/><rect x='60' y='10' width='30' height='30' fill='none' stroke='currentColor' stroke-width='0.5' stroke-dasharray='1'/><rect x='10' y='60' width='30' height='30' fill='none' stroke='currentColor' stroke-width='0.5' stroke-dasharray='1'/></svg>",
    body_text: "Kamu harus kuasai psikologi pembaca ini.",
    highlights: ["psikologi pembaca"],
    image_keyword: "strategy rules concept",
    composition: { focus: "balanced", style: "card-grid", accent: "none", alignment: "left" },
  },
  {
    items: [],
    slide: 5,
    title: "Carousel Itu Kayak Naik Tangga",
    svg_code: "<svg viewBox='0 0 100 100'><path d='M 10 90 L 30 70 L 50 50 L 70 30 L 90 10' fill='none' stroke='currentColor' stroke-width='0.5' stroke-dasharray='2'/></svg>",
    body_text: "Kalo ada satu anak tangga yang bolong, audiens bakalan langsung males naik dan pergi.",
    highlights: ["langsung males naik"],
    highlight_bg: "#F97316",
    image_keyword: "clean step analogy",
    composition: { focus: "balanced", style: "minimalist", accent: "clean-sans", alignment: "left" },
  },
  {
    items: [],
    slide: 6,
    title: "Siap Bikin Carousel Yang Gak Dilewati?",
    svg_code: "<svg viewBox='0 0 100 100'><circle cx='50' cy='100' r='48' fill='none' stroke='currentColor' stroke-width='1'/><circle cx='50' cy='100' r='40' fill='none' stroke='currentColor' stroke-width='0.5' stroke-dasharray='2'/></svg>",
    body_text: "Coba praktekin tips ini di konten kamu selanjutnya!",
    highlights: ["konten kamu selanjutnya!"],
    highlight_bg: "#F97316",
    image_keyword: "minimal success arrow",
    composition: { focus: "headline", style: "bold", accent: "pill", alignment: "center" },
  },
]

const FAQS = [
  {
    q: "Tool ini cocok buat siapa?",
    a: "Content creator dan social media manager yang butuh bikin carousel cepat untuk konten harian. Kalau kamu tipe yang suka ngulik desain sampai pixel-perfect, Canva tetap lebih cocok. Tool ini buat yang mau langsung posting.",
  },
  {
    q: "Apa bedanya dengan Canva?",
    a: "CarouselAI fokus ke kecepatan dan otomatisasi. Masukkan ide, pilih template, download. Canva lebih fleksibel tapi lebih makan waktu.",
  },
  {
    q: "Berapa lama prosesnya?",
    a: "Biasanya selesai dalam 60 detik, tergantung jumlah slide dan panjang konten.",
  },
  {
    q: "Apakah ada versi gratis untuk coba dulu?",
    a: "Ada. Begitu daftar, kamu langsung dapat kredit gratis untuk coba generate carousel. Mau lebih banyak? Cek paket di halaman Pricing.",
  },
]

function HeroCard({ item, theme }: { item: any; theme: any }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "8px",
      backgroundColor: theme.bgAlt, border: `1px solid ${theme.accent}33`,
      borderRadius: "8px", padding: "8px", width: "100%", boxSizing: "border-box",
      color: theme.text, fontWeight: theme.fontWeight
    }}>
      <div style={{
        width: "24px", height: "24px", minWidth: "24px", borderRadius: "6px",
        backgroundColor: `${theme.accent}22`, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ width: "12px", height: "12px", backgroundColor: theme.accent, borderRadius: "2px" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
        <h4 style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.2 }}>
          {item.item_title}
        </h4>
        <p style={{ margin: 0, fontSize: "0.65rem", color: theme.textMuted, lineHeight: 1.3 }}>
          {item.item_description}
        </p>
      </div>
    </div>
  )
}

function HeroHighlightedText({ text, highlights, color, bg }: { text: string; highlights?: string[]; color: string; bg?: string }) {
  if (!highlights || highlights.length === 0) return <>{text}</>;
  
  const pattern = highlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isHighlight = highlights.some(h => h.toLowerCase() === part.toLowerCase());
        return isHighlight ? (
          <span key={i} style={{ backgroundColor: bg || `${color}33`, padding: "0 4px", borderRadius: "4px", fontWeight: 700 }}>
            {part}
          </span>
        ) : <span key={i}>{part}</span>;
      })}
    </>
  );
}

function HeroCardLayout({ slide, theme }: { slide: any; theme: any }) {
  const { style, alignment, accent } = slide.composition;
  const items = slide.items || [];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" }}>
      {/* SVG Background Decoration */}
      {slide.svg_code && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: 0.3,
          pointerEvents: "none", color: theme.accent
        }}>
          <div style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: slide.svg_code }} />
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {/* Title with Accents */}
        <div style={{ 
          display: "flex", 
          justifyContent: alignment === "center" ? "center" : alignment === "left" ? "flex-start" : "flex-end",
          marginBottom: "12px" 
        }}>
          {accent === "pill" ? (
            <div style={{
              backgroundColor: theme.bgAlt, padding: "6px 16px", borderRadius: "100px",
              border: `1px solid ${theme.accent}44`, display: "inline-block"
            }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: theme.fontWeight, color: theme.text, margin: 0, lineHeight: 1.2 }}>
                {slide.title}
              </h3>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: theme.fontWeight, color: theme.text, margin: 0, lineHeight: 1.2 }}>
                {slide.title}
              </h3>
              {accent === "line" && (
                <div style={{ 
                  width: "40px", height: "4px", backgroundColor: theme.highlight, 
                  marginTop: "4px", borderRadius: "2px",
                  alignSelf: alignment === "center" ? "center" : "flex-start"
                }} />
              )}
            </div>
          )}
        </div>

        {/* Content Layout */}
        {style === "card-grid" && items.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" }}>
            {items.map((item: any, i: number) => <HeroCard key={i} item={item} theme={theme} />)}
          </div>
        ) : style === "card-flow" && items.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
            {items.map((item: any, i: number) => <HeroCard key={i} item={item} theme={theme} />)}
          </div>
        ) : (
          <div style={{ 
            width: "100%", 
            textAlign: alignment, 
            fontSize: "0.9rem", 
            color: theme.text, 
            fontWeight: 300,
            lineHeight: 1.5 
          }}>
            <HeroHighlightedText 
              text={slide.body_text} 
              highlights={slide.highlights} 
              color={theme.text} 
              bg={slide.highlight_bg} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <div className="faq-q" onClick={() => setOpen(!open)}>
        {q}
        <span className="faq-arrow">▼</span>
      </div>
      <div className="faq-a">
        <p>{a}</p>
      </div>
    </div>
  )
}

function CoverflowDemo({ slides, theme }: { slides: Slide[]; theme: any }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const updateOffsets = () => {
    requestAnimationFrame(() => {
      const container = scrollRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const containerCenter = containerRect.left + containerRect.width / 2

      cardRefs.current.forEach((card) => {
        if (!card) return
        const cardRect = card.getBoundingClientRect()
        const cardCenter = cardRect.left + cardRect.width / 2
        const offset = (cardCenter - containerCenter) / cardRect.width
        const clamped = Math.max(-2.2, Math.min(2.2, offset))
        const distance = Math.abs(clamped)
        const scale = 1 - Math.min(distance * 0.22, 0.4)
        const opacity = 1 - Math.min(distance * 0.35, 0.6)
        const blur = Math.min(distance * 3, 5)
        const zIndex = 100 - Math.round(distance * 10)

        card.style.transform = `scale(${scale})`
        card.style.opacity = `${opacity}`
        card.style.filter = `blur(${blur}px)`
        card.style.zIndex = `${zIndex}`
      })
    })
  }

  useEffect(() => {
    updateOffsets()
    const container = scrollRef.current
    if (!container) return
    container.addEventListener("scroll", updateOffsets, { passive: true })
    window.addEventListener("resize", updateOffsets)
    return () => {
      container.removeEventListener("scroll", updateOffsets)
      window.removeEventListener("resize", updateOffsets)
    }
  }, [])

  return (
    <div className="coverflow-scroll" ref={scrollRef}>
      <div className="coverflow-spacer" />
      {slides.map((slide, i) => {
        return (
          <div
            className="coverflow-card"
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            style={{
              marginLeft: i === 0 ? 0 : "-139px",
            }}
          >
            <div style={{
              width: '260px',
              height: '260px',
              backgroundColor: theme.bg,
              borderRadius: '20px',
              overflow: 'hidden',
              border: `1px solid ${theme.accent}22`,
            }}>
              <div style={{
                width: '400px',
                height: '400px',
                padding: '24px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                gap: '18px',
                color: theme.text,
                transform: 'scale(0.65)',
                transformOrigin: 'top left',
              }}>
                <HeroCardLayout slide={slide} theme={theme} />
              </div>
            </div>
          </div>
        )
      })}
      <div className="coverflow-spacer" />
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".reveal")
    if (!els) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing-body" ref={rootRef}>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <a href="#" className="logo">
          <div className="logo-icon"><Zap className="size-5" /></div>
          <span className="logo-text">Carousel<span>AI</span></span>
        </a>
        <div className="nav-right">
          <a href="#how-it-works" className="nav-link">Cara Kerja</a>
          {/* <a href="/pricing" className="nav-link">Harga</a> */}
          <button className="btn-primary" onClick={() => navigate("/auth")}>Masuk</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="hero-container">
          <div className="hero-content">
            <h1>
              Konten Carousel
              <span className="line-accent">Auto Jadi dalam 60 Detik</span>
            </h1>

            <p className="hero-sub">
              Masukkan ide, tema dan jumlah slide yang kamu inginkan. AI yang urus layout, warna, dan slidenya.
              Tinggal download dan posting ke Instagram atau TikTok.
            </p>

            <button className="submit-btn" onClick={() => navigate("/auth")}>
              Mulai Gratis
            </button>
            <p className="cta-subtext">Gratis, cepat dan tanpa ribet.</p>
          </div>

          <div className="hero-visual">
            <CoverflowDemo slides={exampleSlides} theme={creamTheme} />
          </div>
        </div>
      </section>

      <div className="demo-wrapper reveal">
        <div className="section-tag">Liat Sendiri</div>
        <h2 className="section-title">Prosesnya Beneran Secepat Ini</h2>
        <div className="demo-container">
          <div className="demo-topbar">
            <div className="dot-red" />
            <div className="dot-yellow" />
            <div className="dot-green" />
            <div className="demo-url">app.carouselai.com/dashboard</div>
          </div>
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{ width: '100%', display: 'block' }}
          >
            <source src="/dashboard-demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <div className="section reveal" id="how-it-works">
        <div className="section-tag">Cara Kerja</div>
        <h2 className="section-title">Tiga langkah,<br />carousel siap posting</h2>
        <p className="section-sub">Desain bukan lagi bottleneck. Kamu fokus ke ide, AI yang eksekusi.</p>

        <div className="steps">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon"><PencilLine className="size-5" /></div>
            <h3>Masukkan Topik</h3>
            <p>Tulis ide atau topik kamu. Bisa dari caption TikTok, thread, atau notes harian.</p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon"><Palette className="size-5" /></div>
            <h3>Pilih Tema</h3>
            <p>Pilih dari berbagai tema yang sudah dioptimasi buat engagement di sosial media.</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon"><Upload className="size-5" /></div>
            <h3>Download & Posting</h3>
            <p>Ekspor dalam format 1:1, siap langsung upload ke Instagram, TikTok, atau LinkedIn.</p>
          </div>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-tag">Kenapa CarouselAI</div>
        <h2 className="section-title">Dirancang untuk<br />content creator yang sibuk</h2>
        <p className="section-sub">Bukan pengganti Canva. Ini tool buat yang mau posting cepat tanpa ribet desain.</p>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon-wrap"><Zap className="size-5" /></div>
            <div><h3>Hemat Waktu Drastis</h3><p>Yang biasanya 2 jam di Canva, selesai dalam 60 detik.</p></div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrap"><Cpu className="size-5" /></div>
            <div><h3>AI-Powered Layout</h3><p>AI yang pilih hierarki teks, warna, dan komposisi slide. Hasilnya konsisten dan siap posting.</p></div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrap"><Smartphone className="size-5" /></div>
            <div><h3>Multi-Platform Ready</h3><p>Format 1:1 yang dioptimasi buat semua platform. Satu kali bikin, bisa posting di mana aja.</p></div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrap"><Rocket className="size-5" /></div>
            <div><h3>Langsung Siap Posting</h3><p>Output berupa gambar siap upload. Tidak perlu export-import-convert lagi.</p></div>
          </div>
        </div>
      </div>

      <div className="section reveal">
        <div className="founder-section">
          <div>
            <h2>Kenapa Gue Bikin Tool Ini</h2>
            <p>Dulu gue spend 2-3 jam setiap kali bikin carousel buat konten. Buka Canva, pilih template, copy-paste teks satu-per-satu, atur layout, capek banget.</p>
            <p>Gue kepikiran: "Harusnya ini bisa otomatis." AI bisa breakdown teks jadi slide, pilih layout yang bagus, atur warna konsisten.</p>
            <p>Akhirnya gue bikin tool ini. Sekarang gue pakai sendiri setiap hari. Yang dulu 2 jam, sekarang cuma butuh 60 detik.</p>
            <p><strong>Kalau gue gak yakin tool ini useful, gue gak akan release.</strong></p>
          </div>
          <div className="founder-cta">
            <p>Mau coba sendiri?</p>
            <button className="btn-primary" onClick={() => navigate("/auth")}>Mulai Sekarang</button>
          </div>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-tag">FAQ</div>
        <h2 className="section-title">Pertanyaan yang<br />sering ditanya</h2>
        <div className="faq-list">
          {FAQS.map((item) => <FaqItem key={item.q} q={item.q} a={item.a} />)}
        </div>
      </div>

      <div className="bottom-cta reveal">
        <div className="orb-bg" />
        <div className="bottom-cta-content">
          <h2>Jangan buang waktu<br />desain carousel manual</h2>
          <p>Coba dulu sebelum bayar apa pun.</p>
          <button className="btn-primary" onClick={() => navigate("/auth")}>Coba Sekarang →</button>
        </div>
      </div>

      <footer className="footer">
        <p>© 2026 CarouselAI. All rights reserved.</p>
      </footer>
    </div>
  )
}