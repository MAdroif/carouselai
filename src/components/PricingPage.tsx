import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Star, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PricingTier {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  buttonText: string
  tierId: string
  options?: { label: string; price: string; value: string }[]
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "Rp 0",
    description: "Cocok untuk mencoba kekuatan AI Carousel.",
    features: [
      "10 Kredit per bulan (Recurring)",
      "Welcome Bonus 10 Kredit",
      "Akses semua Tema Preset",
      "Export PNG & PDF",
      "Tidak ada pembatasan kualitas",
    ],
    buttonText: "Gunakan Gratis",
    tierId: 'free'
  },
  {
    name: "Pay-As-You-Go",
    price: "Mulai Rp 15rb",
    description: "Beli kredit sesuai kebutuhan, tidak akan hangus.",
    features: [
      "Kredit berlaku selamanya",
      "Bebas pilih jumlah kredit",
      "Kualitas render Prioritas",
      "Tanpa komitmen bulanan",
    ],
    highlighted: true,
    buttonText: "Beli Kredit",
    tierId: 'paygo',
    options: [
      { label: "10 Kredit", price: "Rp 15.000", value: "paygo-10" },
      { label: "30 Kredit", price: "Rp 35.000", value: "paygo-30" },
      { label: "60 Kredit", price: "Rp 60.000", value: "paygo-60" },
    ]
  },
  {
    name: "Monthly Pro",
    price: "Rp 89rb /bln",
    description: "Untuk agency dan kreator konten aktif.",
    features: [
      "60 Kredit per bulan",
      "Bundled Caption + Tag SEO",
      "Rollover maks 30 kredit",
      "Prioritas generasi tercepat",
      "Dukungan Prioritas",
    ],
    buttonText: "Langganan Sekarang",
    tierId: 'monthly'
  }
]

export function PricingPage({ onSelectTier }: { onSelectTier: (id: string) => void }) {
  const [isPaygoModalOpen, setIsPaygoModalOpen] = useState(false)

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 dark:text-white">
          Pilih Paket yang <span className="text-blue-600">Tepat</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Mulai dari gratis hingga paket profesional untuk kebutuhan konten Anda. 
          Pilih rencana yang sesuai dengan skala produksi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative p-8 rounded-3xl border transition-all duration-300 hover:scale-105 ${
              tier.highlighted
                ? "border-blue-500 shadow-2xl shadow-blue-500/20 bg-white dark:bg-slate-900 ring-2 ring-blue-500"
                : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50"
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Star size={12} fill="currentColor" /> PALING POPULER
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2 dark:text-white">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold dark:text-white">{tier.price}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {tier.description}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <Check size={18} className="text-blue-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className={`w-full py-6 rounded-2xl font-bold transition-all ${
                tier.highlighted
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              onClick={() => {
                if (tier.tierId === 'paygo') {
                  setIsPaygoModalOpen(true)
                } else {
                  onSelectTier(tier.tierId)
                }
              }}
            >
              {tier.buttonText}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-16 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
        <Info size={16} />
        <p>Butuh paket custom untuk perusahaan? <span className="text-blue-600 font-medium cursor-pointer hover:underline">Hubungi kami</span></p>
      </div>

      <Dialog open={isPaygoModalOpen} onOpenChange={setIsPaygoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Pilih Jumlah Kredit</DialogTitle>
            <DialogDescription className="text-center">
              Pilih paket kredit yang sesuai dengan kebutuhan Anda. Kredit Pay-As-You-Go tidak akan pernah hangus.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {[
              { label: "10 Kredit", price: "Rp 15.000", value: "paygo-10", desc: "Cocok untuk pemula" },
              { label: "30 Kredit", price: "Rp 35.000", value: "paygo-30", desc: "Hemat 22%" },
              { label: "60 Kredit", price: "Rp 60.000", value: "paygo-60", desc: "Hemat 33% - Paling Untung" },
            ].map((opt) => (
              <div 
                key={opt.value} 
                onClick={() => {
                  onSelectTier(opt.value)
                  setIsPaygoModalOpen(false)
                }}
                className="flex justify-between items-center p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600">{opt.label}</span>
                  <span className="text-xs text-slate-500">{opt.desc}</span>
                </div>
                <span className="font-extrabold text-blue-600">{opt.price}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
