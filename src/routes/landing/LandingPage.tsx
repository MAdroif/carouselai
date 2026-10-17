import { useId, useState } from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  CirclePlay,
  Download,
  Layers,
  MousePointer2,
  Palette,
  PencilLine,
  Sparkles,
  Zap,
} from "lucide-react"
import "./LandingPage.css"

type Sample = {
  name: string
  description: string
  image: string
  alt: string
  style: "minimal" | "editorial" | "bold"
}

const samples: Sample[] = [
  {
    name: "Minimalis",
    description: "Ruang lega dan tampilan yang bersih.",
    image: "/assets/landing/minimalist-clean/slide-1.webp",
    alt: "Contoh slide carousel dengan gaya minimalis",
    style: "minimal",
  },
  {
    name: "Editorial",
    description: "Tipografi tegas untuk ide yang ingin menonjol.",
    image: "/assets/landing/bold-stabilu/slide-1.webp",
    alt: "Contoh slide carousel dengan gaya editorial",
    style: "editorial",
  },
  {
    name: "Bold",
    description: "Kontras kuat untuk pesan yang langsung terbaca.",
    image: "/assets/landing/bold/slide-1.webp",
    alt: "Contoh slide carousel dengan gaya bold",
    style: "bold",
  },
]

const faqs = [
  {
    question: "Apa itu Glito?",
    answer:
      "Glito adalah tool AI untuk membantu mengubah ide atau topik menjadi draft carousel visual. Tujuannya mengurangi pekerjaan desain yang repetitif, bukan menggantikan ide dan penilaianmu.",
  },
  {
    question: "Bagaimana cara menggunakannya?",
    answer:
      "Mulai dari topik atau bahan tulisan, buat carousel, lalu tinjau hasilnya. Kamu bisa melanjutkan penyuntingan di editor sebelum mengunduh hasilnya.",
  },
  {
    question: "Apakah hasilnya masih bisa diedit?",
    answer:
      "Ya. Alur Glito mencakup editor agar kamu bisa meninjau dan merapikan hasil sebelum mengunduhnya. Tetap periksa teks dan visual agar sesuai dengan maksud kontenmu.",
  },
  {
    question: "Apakah Glito punya versi gratis?",
    answer:
      "Kredit gratis tersedia untuk mencoba Glito. Jumlah kredit dan ketentuan yang berlaku ditampilkan di aplikasi, sehingga kamu bisa memeriksanya sebelum melanjutkan.",
  },
  {
    question: "Apakah Glito menggantikan Canva?",
    answer:
      "Tidak sepenuhnya. Glito berfokus mempercepat pembuatan draft carousel dengan AI. Tool desain umum seperti Canva tetap berguna untuk kebutuhan desain yang sangat spesifik atau pengaturan manual yang lebih luas.",
  },
  {
    question: "Apakah hasilnya pasti viral atau meningkatkan engagement?",
    answer:
      "Tidak ada tool yang bisa menjamin itu. Glito membantu proses produksi visual; kualitas ide, akurasi informasi, relevansi audiens, dan distribusi konten tetap berpengaruh pada hasil akhirnya.",
  },
]

function PrimaryCta({
  onClick,
  children = "Coba Glito Gratis",
  className = "",
}: {
  onClick: () => void
  children?: ReactNode
  className?: string
}) {
  return (
    <button className={`glito-button glito-button-primary ${className}`} onClick={onClick}>
      <span>{children}</span>
      <ArrowRight aria-hidden="true" size={17} strokeWidth={2.2} />
    </button>
  )
}

function Brand() {
  return (
    <a className="glito-brand" href="#beranda" aria-label="Glito, kembali ke awal">
      <span className="glito-brand-mark" aria-hidden="true">
        <Zap size={18} fill="currentColor" strokeWidth={2.3} />
      </span>
      <span>glito</span>
    </a>
  )
}

function HeroPreview() {
  return (
    <div className="glito-hero-preview" aria-label="Pratinjau contoh hasil carousel Glito">
      <div className="glito-preview-window-bar">
        <span className="glito-window-dot glito-window-dot-pink" />
        <span className="glito-window-dot glito-window-dot-yellow" />
        <span className="glito-window-dot glito-window-dot-green" />
        <span className="glito-preview-window-title">Contoh hasil carousel</span>
        <span className="glito-preview-chip"><Sparkles size={12} /> Contoh visual</span>
      </div>
      <div className="glito-preview-workspace">
        <div className="glito-preview-sidecopy">
          <span className="glito-preview-kicker">DARI IDE MENJADI VISUAL</span>
          <strong>Draft yang bisa kamu lanjutkan.</strong>
          <p>Mulai dari hasil AI, lalu tinjau dan sesuaikan di editor.</p>
          <div className="glito-preview-checkline"><Check size={14} /> Bisa ditinjau sebelum diunduh</div>
        </div>
        <div className="glito-preview-stack" aria-hidden="true">
          <div className="glito-preview-paper glito-preview-paper-back">
            <img src="/assets/landing/bold/slide-2.webp" alt="" loading="lazy" />
          </div>
          <div className="glito-preview-paper glito-preview-paper-mid">
            <img src="/assets/landing/bold-stabilu/slide-2.webp" alt="" loading="lazy" />
          </div>
          <div className="glito-preview-paper glito-preview-paper-front">
            <img src="/assets/landing/minimalist-clean/slide-1.webp" alt="" loading="eager" />
          </div>
        </div>
      </div>
      <div className="glito-preview-footer">
        <span><span className="glito-status-dot" /> Pratinjau contoh</span>
        <span>Ide tetap dari kamu <ArrowDownRight size={14} /></span>
      </div>
    </div>
  )
}

function SampleCard({ sample, index }: { sample: Sample; index: number }) {
  return (
    <article className={`glito-sample-card glito-sample-${sample.style}`}>
      <div className="glito-sample-image-wrap">
        <img src={sample.image} alt={sample.alt} loading="lazy" />
        <span className="glito-sample-number">0{index + 1}</span>
      </div>
      <div className="glito-sample-copy">
        <h3>{sample.name}</h3>
        <p>{sample.description}</p>
      </div>
    </article>
  )
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <article className="glito-step-card">
      <div className="glito-step-head">
        <span className="glito-step-number">{number}</span>
        <span className="glito-step-icon" aria-hidden="true">{icon}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <article className={`glito-faq-item${open ? " is-open" : ""}`}>
      <h3 className="glito-faq-heading">
        <button
          className="glito-faq-trigger"
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{question}</span>
          <ChevronDown className="glito-faq-chevron" size={19} aria-hidden="true" />
        </button>
      </h3>
      <div className="glito-faq-panel" id={panelId} hidden={!open}>
        <p>{answer}</p>
      </div>
    </article>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const goToAuth = () => navigate("/auth")

  return (
    <div className="glito-landing" id="beranda">
      <a className="glito-skip-link" href="#konten-utama">Lewati ke konten</a>

      <header className="glito-header">
        <div className="glito-header-inner">
          <Brand />
          <nav className="glito-nav" aria-label="Navigasi utama">
            <a href="#contoh">Contoh hasil</a>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="glito-header-actions">
            <button className="glito-login-link" type="button" onClick={goToAuth}>Masuk</button>
            <PrimaryCta onClick={goToAuth} className="glito-header-cta">Coba gratis</PrimaryCta>
          </div>
        </div>
      </header>

      <main id="konten-utama">
        <section className="glito-hero" aria-labelledby="glito-hero-title">
          <div className="glito-hero-grid" aria-hidden="true" />
          <div className="glito-hero-inner">
            <div className="glito-hero-copy">
              <div className="glito-eyebrow"><span className="glito-eyebrow-icon"><Sparkles size={14} /></span> AI carousel generator untuk content creator</div>
              <h1 id="glito-hero-title">Dari ide konten menjadi <span>carousel visual.</span></h1>
              <p className="glito-hero-description">
                Ubah topik menjadi draft carousel dengan bantuan AI. Tinjau, edit, lalu unduh hasilnya—tanpa harus menyusun setiap elemen desain dari nol.
              </p>
              <div className="glito-hero-actions">
                <PrimaryCta onClick={goToAuth} />
                <a className="glito-secondary-link" href="#contoh">Lihat contoh hasil <ArrowDownRight size={17} /></a>
              </div>
              <div className="glito-hero-reassurance">
                <span><Check size={15} /> Kredit gratis tersedia untuk mencoba</span>
                <span><Check size={15} /> Hasil bisa ditinjau sebelum diunduh</span>
              </div>
            </div>
            <div className="glito-hero-art">
              <HeroPreview />
              <div className="glito-floating-note"><span className="glito-floating-note-icon"><Layers size={17} /></span><span><strong>Mulai dari ide</strong><small>Lanjutkan dengan gaya visualmu</small></span></div>
            </div>
          </div>
          <div className="glito-hero-bottomline"><span>BUAT PROSES DESAIN LEBIH RINGKAS</span><span className="glito-bottomline-rule" /><span>IDE · DRAFT · EDIT · UNDUH</span></div>
        </section>

        <section className="glito-section glito-samples-section" id="contoh" aria-labelledby="glito-samples-title">
          <div className="glito-section-heading glito-heading-row">
            <div>
              <p className="glito-section-eyebrow">LIHAT HASILNYA</p>
              <h2 id="glito-samples-title">Satu topik, banyak kemungkinan visual.</h2>
            </div>
            <p className="glito-section-intro">Ini contoh gaya visual yang bisa kamu jadikan referensi. Hasil aktual tetap perlu ditinjau dan disesuaikan dengan isi kontenmu.</p>
          </div>
          <div className="glito-samples-grid">
            {samples.map((sample, index) => <SampleCard key={sample.name} sample={sample} index={index} />)}
          </div>
        </section>

        <section className="glito-demo-section" aria-labelledby="glito-demo-title">
          <div className="glito-demo-inner">
            <div className="glito-demo-copy">
              <p className="glito-section-eyebrow">LIHAT ALURNYA</p>
              <h2 id="glito-demo-title">Dari proses yang berulang ke alur yang lebih sederhana.</h2>
              <p>Kenali alur kerja Glito sebelum mulai. Buat draft, periksa hasilnya, lalu lanjutkan penyuntingan sesuai kebutuhan kontenmu.</p>
              <a href="#cara-kerja" className="glito-text-link">Pelajari tiga langkahnya <ArrowRight size={16} /></a>
            </div>
            <div className="glito-video-frame">
              <div className="glito-video-caption"><span className="glito-video-play-icon"><CirclePlay size={19} /></span><span><strong>Demo Glito</strong><small>Rekaman alur produk</small></span></div>
              <video controls playsInline preload="metadata" poster="/assets/landing/minimalist-clean/slide-1.webp" aria-label="Video demo alur kerja Glito">
                <source src="/dashboard-demo1.mp4" type="video/mp4" />
                Browser kamu tidak mendukung pemutaran video ini.
              </video>
            </div>
          </div>
        </section>

        <section className="glito-section glito-how-section" id="cara-kerja" aria-labelledby="glito-how-title">
          <div className="glito-section-heading glito-centered-heading">
            <p className="glito-section-eyebrow">CARA KERJA</p>
            <h2 id="glito-how-title">Tiga langkah dari ide ke carousel.</h2>
            <p className="glito-section-intro">Kamu tetap mengarahkan isi kontennya. Glito membantu mempercepat bagian produksi visual.</p>
          </div>
          <div className="glito-steps-grid">
            <StepCard number="01" icon={<PencilLine size={21} />} title="Mulai dari topik" description="Tulis ide atau masukkan bahan tulisan yang ingin kamu kembangkan menjadi carousel." />
            <StepCard number="02" icon={<Sparkles size={21} />} title="Buat draft visual" description="Biarkan AI membantu menyusun draft, lalu pilih hasil yang paling sesuai dengan tujuan kontenmu." />
            <StepCard number="03" icon={<Download size={21} />} title="Edit dan unduh" description="Periksa teks, rapikan hasil di editor, lalu unduh saat sudah siap digunakan." />
          </div>
          <div className="glito-steps-note"><Sparkles size={16} /> AI membantu proses produksi; keputusan akhir dan kualitas informasi tetap di tanganmu.</div>
        </section>

        <section className="glito-benefits-section" aria-labelledby="glito-benefits-title">
          <div className="glito-benefits-inner">
            <div className="glito-benefits-copy">
              <p className="glito-section-eyebrow">DIBUAT UNTUK ALUR KERJA CREATOR</p>
              <h2 id="glito-benefits-title">Lebih sedikit pekerjaan repetitif. Lebih banyak ruang untuk ide.</h2>
              <p>Glito cocok ketika hambatanmu bukan kekurangan ide, tetapi waktu yang habis untuk menyusun setiap slide.</p>
              <PrimaryCta onClick={goToAuth}>Coba Glito Gratis</PrimaryCta>
            </div>
            <div className="glito-benefits-list">
              <article className="glito-benefit-item">
                <span className="glito-benefit-icon"><Zap size={19} /></span>
                <div><h3>Mulai dari ide, bukan kanvas kosong</h3><p>Gunakan topik sebagai titik awal agar proses menyusun visual tidak selalu dimulai dari nol.</p></div>
              </article>
              <article className="glito-benefit-item">
                <span className="glito-benefit-icon"><Palette size={19} /></span>
                <div><h3>Eksplorasi gaya visual</h3><p>Lihat contoh pendekatan visual yang berbeda, lalu pilih yang mendukung pesan kontenmu.</p></div>
              </article>
              <article className="glito-benefit-item">
                <span className="glito-benefit-icon"><MousePointer2 size={19} /></span>
                <div><h3>Tetap punya kendali</h3><p>Tinjau dan edit hasil sebelum diunduh. Jangan langsung memublikasikan teks AI tanpa pemeriksaan.</p></div>
              </article>
            </div>
          </div>
        </section>

        <section className="glito-fit-section" aria-labelledby="glito-fit-title">
          <div className="glito-fit-inner">
            <div className="glito-fit-heading">
              <p className="glito-section-eyebrow">COCOK UNTUK SIAPA?</p>
              <h2 id="glito-fit-title">Berguna saat kamu perlu produksi carousel dengan lebih praktis.</h2>
            </div>
            <div className="glito-fit-columns">
              <div className="glito-fit-column glito-fit-good">
                <h3><Check size={18} /> Glito cocok jika kamu…</h3>
                <ul>
                  <li>Sering membuat carousel untuk konten atau bisnis.</li>
                  <li>Ingin mempercepat proses dari topik ke draft visual.</li>
                  <li>Masih ingin memeriksa dan mengedit hasil sebelum posting.</li>
                </ul>
              </div>
              <div className="glito-fit-column glito-fit-limit">
                <h3><Layers size={18} /> Perlu diingat</h3>
                <ul>
                  <li>AI bisa membuat teks atau visual yang perlu diperbaiki.</li>
                  <li>Glito tidak menjamin konten viral atau engagement tinggi.</li>
                  <li>Desain yang sangat spesifik mungkin tetap perlu dikerjakan manual.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="glito-faq-section" id="faq" aria-labelledby="glito-faq-title">
          <div className="glito-faq-inner">
            <div className="glito-faq-intro">
              <p className="glito-section-eyebrow">FAQ</p>
              <h2 id="glito-faq-title">Sebelum mulai.</h2>
              <p>Jawaban singkat untuk membantu kamu memutuskan apakah Glito sesuai dengan alur kerjamu.</p>
            </div>
            <div className="glito-faq-list">
              {faqs.map((faq) => <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />)}
            </div>
          </div>
        </section>

        <section className="glito-final-cta" aria-labelledby="glito-final-title">
          <div className="glito-final-cta-inner">
            <div className="glito-final-sparkle" aria-hidden="true"><Sparkles size={23} /></div>
            <p className="glito-section-eyebrow">MULAI DARI SATU IDE</p>
            <h2 id="glito-final-title">Coba ubah idemu menjadi carousel.</h2>
            <p>Buat draft pertama, periksa hasilnya, lalu putuskan sendiri apakah Glito cocok untukmu.</p>
            <PrimaryCta onClick={goToAuth}>Coba Glito Gratis</PrimaryCta>
            <span className="glito-final-note">Kredit gratis tersedia untuk mencoba.</span>
          </div>
        </section>
      </main>

      <footer className="glito-footer">
        <div className="glito-footer-inner">
          <Brand />
          <p>Alat bantu untuk membuat proses produksi carousel lebih praktis.</p>
          <span>© {new Date().getFullYear()} Glito</span>
        </div>
      </footer>
    </div>
  )
}
