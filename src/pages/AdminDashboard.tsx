import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Ganti dengan email akun kamu sendiri
const ADMIN_EMAIL = "dataframe777@gmail.com"

interface UserStat {
  email: string
  total_generate: number
  terakhir_generate: string | null
}

interface FunnelStats {
  started: number
  completed: number
  downloaded: number
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [userStats, setUserStats] = useState<UserStat[]>([])
  const [funnel, setFunnel] = useState<FunnelStats | null>(null)
  const [loadingFunnel, setLoadingFunnel] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAdmin(user?.email === ADMIN_EMAIL)
      setChecking(false)
    }
    checkAccess()
  }, [])

  useEffect(() => {
    if (!isAdmin) return

    async function loadStats() {
      setLoadingStats(true)
      const { data, error } = await supabase.rpc("get_user_generation_stats")

      if (error) {
        toast.error("Gagal ambil data dashboard", {
          description: error.message,
        })
        setLoadingStats(false)
        return
      }

      setUserStats(data ?? [])
      setLoadingStats(false)
    }

    loadStats()
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
  
    async function loadFunnel() {
      setLoadingFunnel(true)
      const { data, error } = await supabase.rpc("get_funnel_stats")
  
      if (error) {
        toast.error("Gagal ambil data funnel", {
          description: error.message,
        })
        setLoadingFunnel(false)
        return
      }
  
      setFunnel(data?.[0] ?? null)
      setLoadingFunnel(false)
    }
  
    loadFunnel()
  }, [isAdmin])

  if (checking) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Akses ditolak</p>
      </div>
    )
  }

  const totalUser = userStats.length
  const totalGenerateSemua = userStats.reduce((sum, row) => sum + row.total_generate, 0)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-2">Dashboard Developer</h1>
      <p className="text-slate-500 mb-8">Monitoring aktivitas generate carousel per user</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total User Pernah Generate</p>
          <p className="text-3xl font-semibold mt-1">{totalUser}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Generate Semua User</p>
          <p className="text-3xl font-semibold mt-1">{totalGenerateSemua}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-5 mb-8">
        <p className="text-sm text-slate-500 mb-4">Funnel Generate Carousel</p>
        {loadingFunnel ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Memuat data funnel...
          </div>
        ) : funnel ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-semibold">{funnel.started}</p>
              <p className="text-xs text-slate-500">Mulai Generate</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{funnel.completed}</p>
              <p className="text-xs text-slate-500">
                Berhasil Selesai
                {funnel.started > 0 && (
                  <span className="text-slate-400">
                    {" "}({Math.round((funnel.completed / funnel.started) * 100)}%)
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{funnel.downloaded}</p>
              <p className="text-xs text-slate-500">
                Download Hasil
                {funnel.completed > 0 && (
                  <span className="text-slate-400">
                    {" "}({Math.round((funnel.downloaded / funnel.completed) * 100)}%)
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">Belum ada data</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Email</th>
              <th className="px-4 py-3 font-medium text-slate-600">Total Generate</th>
              <th className="px-4 py-3 font-medium text-slate-600">Terakhir Aktif</th>
            </tr>
          </thead>
          <tbody>
            {loadingStats ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  <Loader2 className="size-5 animate-spin inline-block mr-2" />
                  Memuat data...
                </td>
              </tr>
            ) : userStats.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  Belum ada data generate
                </td>
              </tr>
            ) : (
              userStats.map((row, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">{row.total_generate}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {row.terakhir_generate
                      ? new Date(row.terakhir_generate).toLocaleString("id-ID")
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
