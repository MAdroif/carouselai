import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./LandingPage.css"

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
    a: "Biasanya selesai dalam 1-2 menit, tergantung jumlah slide dan panjang konten.",
  },
  {
    q: "Apakah ada versi gratis untuk coba dulu?",
    a: "Ada. Begitu daftar, kamu langsung dapat kredit gratis untuk coba generate carousel. Mau lebih banyak? Cek paket di halaman Pricing.",
  },
]

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
          <div className="logo-icon">⚡</div>
          <span className="logo-text">Carousel<span>AI</span></span>
        </a>
        <div className="nav-right">
          <a href="#how-it-works" className="nav-link">Cara Kerja</a>
          <a href="/pricing" className="nav-link">Harga</a>
          <button className="btn-primary" onClick={() => navigate("/auth")}>Masuk</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="hero-content">
          <div className="status-banner">
            <span className="status-dot" />
            Sudah live · Coba gratis sekarang
          </div>

          <h1>
            Carousel Profesional
            <span className="line-accent">Auto Jadi dalam 30 Detik</span>
          </h1>

          <p className="hero-sub">
            Masukkan ide atau naskah kamu. AI yang urus layout, warna, dan slide-nya.
            Tinggal download dan posting ke Instagram atau TikTok.
          </p>

          <div className="cta-box">
            <div className="cta-label"><span>✦</span> Coba Sekarang</div>
            <div className="cta-title">Buat Carousel Pertama Kamu, Gratis</div>
            <div className="cta-desc">
              Daftar dalam beberapa detik, langsung dapat kredit gratis untuk coba generate.
            </div>
            <button className="submit-btn" onClick={() => navigate("/auth")}>
              Mulai Bikin Carousel →
            </button>
          </div>
        </div>
      </section>

      <div className="section reveal" id="how-it-works">
        <div className="section-tag">Cara Kerja</div>
        <h2 className="section-title">Tiga langkah,<br />carousel siap posting</h2>
        <p className="section-sub">Desain bukan lagi bottleneck. Kamu fokus ke ide, AI yang eksekusi.</p>

        <div className="steps">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon">✏️</div>
            <h3>Masukkan Skrip</h3>
            <p>Tulis ide atau paste naskah kamu. Bisa dari caption TikTok, thread, atau notes harian.</p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon">🎨</div>
            <h3>Pilih Template</h3>
            <p>Pilih dari berbagai template yang sudah dioptimasi buat engagement di sosial media.</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon">📤</div>
            <h3>Download & Posting</h3>
            <p>Ekspor dalam format 1:1, siap langsung upload ke Instagram, TikTok, atau LinkedIn.</p>
          </div>
        </div>

        <div className="demo-wrapper">
          <div className="demo-container">
            <div className="demo-topbar">
              <div className="dot-red" />
              <div className="dot-yellow" />
              <div className="dot-green" />
              <div className="demo-url">carouselai.app · Demo</div>
            </div>
            <video autoPlay loop muted playsInline preload="metadata">
              <source src="/DemoVid.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-tag">Kenapa CarouselAI</div>
        <h2 className="section-title">Dirancang untuk<br />content creator yang sibuk</h2>
        <p className="section-sub">Bukan pengganti Canva. Ini tool buat yang mau posting cepat tanpa ribet desain.</p>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon-wrap">⚡</div>
            <div><h3>Hemat Waktu Drastis</h3><p>Yang biasanya 2 jam di Canva, selesai dalam 5 menit.</p></div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrap">🤖</div>
            <div><h3>AI-Powered Layout</h3><p>AI yang pilih hierarki teks, warna, dan komposisi slide. Hasilnya konsisten dan profesional.</p></div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrap">📱</div>
            <div><h3>Multi-Platform Ready</h3><p>Format 1:1 yang dioptimasi buat semua platform. Satu kali bikin, bisa posting di mana aja.</p></div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrap">🚀</div>
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
            <p>Akhirnya gue bikin tool ini. Sekarang gue pakai sendiri setiap hari. Yang dulu 2 jam, sekarang gak sampai 5 menit.</p>
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
          <p>Mulai gratis sekarang, tanpa kartu kredit.</p>
          <button className="btn-primary" onClick={() => navigate("/auth")}>Coba Sekarang →</button>
        </div>
      </div>

      <footer className="footer">
        <p>© 2026 CarouselAI. All rights reserved.</p>
      </footer>
    </div>
  )
}