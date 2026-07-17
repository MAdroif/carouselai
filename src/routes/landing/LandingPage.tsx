import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Zap, PencilLine, Palette, Upload, Cpu, Smartphone, Rocket, Heart, MessageCircle, Send, Bookmark } from "lucide-react"
import HeroVisual from "./HeroVisual"
import "./LandingPage.css"

function IGMockup({ images, className }: { images: string[]; className?: string }) {
  return (
    <div className={`ig-mockup-container ${className}`}>
      <div className="ig-screen">
        <div className="ig-header">
          <div className="ig-user-info">
            <div className="ig-avatar" />
            <span className="ig-username">dataframe</span>
          </div>
          <div className="ig-options">•••</div>
        </div>

        <div className="ig-carousel-viewport">
          {images.map((src, i) => (
            <div key={i} className="ig-slide-wrapper">
              <img src={src} alt={`Slide ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ))}
        </div>

        <div className="ig-footer">
          <div className="ig-actions">
            <Heart className="size-6" />
            <MessageCircle className="size-6" />
            <Send className="size-6" />
          </div>
          <div className="ig-bookmark">
            <Bookmark className="size-6" />
          </div>
        </div>
      </div>
    </div>
  )
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
              Ide Konten
              <span className="line-accent">Jadi Carousel dalam 60 Detik</span>
            </h1>
            <p className="hero-sub">
              Stop buang waktu buat hal repetitif seperti atur layout dan warna. Fokus ke ide dan strategi kontenmu, biar AI yang eksekusi visualnya. Cepat, simpel, dan ramah di kantong.
            </p>
            <button className="submit-btn" onClick={() => navigate("/auth")}>
              Coba Gratis Sekarang
            </button>
            <p className="cta-subtext">Klaim kredit gratismu sekarang.</p>
          </div>
          <div className="hero-visual">
            <HeroVisual />
          </div>
        </div>
      </section>

      <div className="gallery-wrapper reveal">
        <div className="section-tag">Satu AI, Banyak Gaya</div>
        <h2 className="section-title">Hasilnya Selalu Beda,<br />Sesuai Topik Kamu</h2>
        <div className="gallery-track">
          <IGMockup images={[
            "/assets/landing/minimalist-clean/slide-1.webp",
            "/assets/landing/minimalist-clean/slide-2.webp",
            "/assets/landing/minimalist-clean/slide-3.webp",
            "/assets/landing/minimalist-clean/slide-4.webp",
            "/assets/landing/minimalist-clean/slide-5.webp",
            "/assets/landing/minimalist-clean/slide-6.webp"
          ]} />
          <IGMockup images={[
            "/assets/landing/bold-stabilu/slide-1.webp",
            "/assets/landing/bold-stabilu/slide-2.webp",
            "/assets/landing/bold-stabilu/slide-3.webp",
            "/assets/landing/bold-stabilu/slide-4.webp",
            "/assets/landing/bold-stabilu/slide-5.webp",
            "/assets/landing/bold-stabilu/slide-6.webp"
          ]} />
          <IGMockup images={[
            "/assets/landing/bold/slide-1.webp",
            "/assets/landing/bold/slide-2.webp",
            "/assets/landing/bold/slide-3.webp",
            "/assets/landing/bold/slide-4.webp",
            "/assets/landing/bold/slide-5.webp",
            "/assets/landing/bold/slide-6.webp"
          ]} />
        </div>
      </div>

      <div className="demo-wrapper reveal">
        <div className="section-tag">Intip Prosesnya</div>
        <h2 className="section-title">Ide Jadi Visual<br />dalam Sekejap</h2>
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
            <source src="/dashboard-demo1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <div className="section reveal" id="how-it-works">
        <div className="section-tag">Proses 60 Detik</div>
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
            <p>Pilih dari berbagai tema, dari yang minimalis sampai yang bold.</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon"><Upload className="size-5" /></div>
            <h3>Download & Posting</h3>
            <p>Ekspor dalam format 4:5, siap langsung upload ke Instagram, TikTok.</p>
          </div>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-tag">Kenapa CarouselAI</div>
        <h2 className="section-title">Bikin Konten<br />Gak Harus Siksa Diri</h2>
        <p className="section-sub">Bukan pengganti kreativitas. Ini tool buat kamu yang benci kerjaan repetitif saat desain.</p>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon-wrap"><Zap className="size-5" /></div>
            <div><h3>Bye-bye Kerja Repetitif</h3><p>Yang biasanya 2 jam geser-geser elemen di Canva, selesai dalam 60 detik. Waktumu terlalu berharga untuk sekadar atur margin.</p></div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrap"><Cpu className="size-5" /></div>
            <div><h3>Ide &gt; Desain</h3><p>Fokus ke riset topik dan strategi marketing agar konten high-engagement. Urusan visual? Serahkan ke AI.</p></div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrap"><Smartphone className="size-5" /></div>
            <div><h3>Harga Ramah, Hasil Instan</h3><p>Didesain khusus untuk creator Indonesia. Gak perlu langganan tool mahal untuk bisa konsisten posting setiap hari.</p></div>
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
            <p>Gue kepikiran: "Harusnya ini bisa otomatis." Gue benci banget sama bagian repetitif dari desain. Gue pengen fokus di brainstorming ide, bukan di pixel-pushing.</p>
            <p>Akhirnya gue bikin tool ini. Sekarang gue pakai sendiri setiap hari. Yang dulu 2 jam, sekarang cuma butuh 60 detik.</p>
            <p><strong>Kalau gue gak yakin tool ini useful buat buang kerjaan repetitif, gue gak akan release.</strong></p>
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
          <h2>Berhenti jadi budak desain,<br />mulai jadi strategist.</h2>
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

const FAQS = [
  {
    q: "Tool ini cocok buat siapa?",
    a: "Content creator dan social media manager yang benci kerjaan repetitif saat desain. Kalau kamu lebih suka ngulik desain sampai pixel-perfect, Canva tetap lebih cocok. Tool ini buat yang mau fokus ke ide konten dan posting cepat.",
  },
  {
    q: "Apa bedanya dengan Canva?",
    a: "CarouselAI fokus ke kecepatan dan penghapusan tugas repetitif. Masukkan ide, pilih tema, download. Canva lebih fleksibel tapi jauh lebih makan waktu.",
  },
  {
    q: "Berapa lama prosesnya?",
    a: "Biasanya selesai dalam 60 detik, tergantung jumlah slide dan panjang konten.",
  },
  {
    q: "Apakah ada versi gratis untuk coba dulu?",
    a: "Ada. Begitu daftar, kamu langsung dapat kredit gratis untuk validasi apakah tool ini cocok dengan alur kerjamu. Mau lebih banyak? Cek paket di halaman Pricing.",
  },
]
