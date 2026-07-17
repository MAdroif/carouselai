import { useState, useEffect, memo } from "react"
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom"
import { getCurrentUser, onAuthStateChange } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import AuthPage from "@/routes/auth/AuthPage"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Sidebar } from "@/components/layout/Sidebar"
import { HistoryPage } from "@/routes/dashboard/HistoryPage"
import { PricingPage } from "@/components/PricingPage"
import GeneratorPage from "@/routes/generator/GeneratorPage"
import LandingPage from "@/routes/landing/LandingPage"

const ExportProgressOverlay = memo(({ progress }: { progress: number }) => (
  <div className="fixed inset-0 z-[1000] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
    <div className="flex flex-col items-center gap-4 max-w-xs w-full text-center">
      <div className="space-y-2">
        <h3 className="text-lg font-bold">Exporting...</h3>
        <p className="text-sm text-slate-500">Mohon tunggu, sedang memproses file Anda.</p>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-500 h-full transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-mono font-medium text-slate-400">
        {progress}% Selesai
      </span>
    </div>
  </div>
))
ExportProgressOverlay.displayName = "ExportProgressOverlay"

function AppLayout({ children, sidebarOpen, setSidebarOpen, tokens, user }: any) {
  const location = useLocation();
  const isPricingPage = location.pathname === '/pricing';
  const isAuthPage = location.pathname === '/auth';
  const isLandingPage = location.pathname === '/';

  if (isAuthPage || isLandingPage) return <>{children}</>;

  return (
    <>
      {!isPricingPage && (
        <div className={`fixed inset-0 left-0 z-50 bg-white dark:bg-[2e2e2e]
        transition-all duration-350 ease-out ${sidebarOpen ? 'w-64' :
        'w-16'}`}>
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            currentPage={location.pathname}
            tokens={tokens}
            user={user}
          />
        </div>
      )}

      {sidebarOpen && !isPricingPage && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-all duration-350 ease-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`flex-1 flex flex-col min-h-screen overflow-y-auto ${isPricingPage ? '' : 'ml-16'} dark:bg-[0f0f0f]`}>
        {children}
      </div>
    </>
  )
}

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userTokens, setUserTokens] = useState<number | null>(null)
  const [isExportingHistory, setIsExportingHistory] = useState(false)
  const [exportHistoryProgress, setExportHistoryProgress] = useState(0)

  const fetchTokens = async () => {
    if (!user || typeof user !== 'object' || !user.id) return
    try {
      const { data, error } = await supabase.from('profiles').select('tokens').eq('id', user.id).single()
      if (error) throw error
      if (data) setUserTokens(data.tokens)
    } catch (error) {
      console.error("Failed to fetch tokens:", error)
      setUserTokens(null)
    }
  }

  useEffect(() => {
    fetchTokens()
  }, [user])

  useEffect(() => {
    getCurrentUser().then((u) => { setUser(u); setLoadingUser(false) })
    const subPromise = onAuthStateChange((u) => setUser(u))
    return () => { subPromise.then((s) => s.unsubscribe()) }
  }, [])

  const handleSelectTier = (tierId: string) => {
    toast.info(`Anda memilih paket ${tierId}.`, {
      description: "Sistem pembayaran sedang dalam tahap pengembangan. Fitur ini akan segera hadir!",
    });
  }

  if (loadingUser) return <div className="flex h-screen items-center justify-center">Loading...</div>

  return (
    <BrowserRouter>
      <div className="min-h-screen flex bg-transparent relative overflow-hidden">
        <Toaster position="top-right" richColors />

        <AppLayout
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          tokens={userTokens}
          user={user}
        >
          <Routes>
            <Route path="/" element={
              loadingUser ? <div className="flex h-screen items-center justify-center">Loading...</div> :
              user ? <Navigate to="/app" /> :
              <LandingPage />
            } />
            <Route path="/app" element={
              user ? (
                <GeneratorPage userTokens={userTokens ?? 0} onTokensChange={fetchTokens} />
              ) : (
                <Navigate to="/auth" />
              )
            } />
            <Route path="/auth" element={
              !user ? <AuthPage onAuthSuccess={() => {}} /> : <Navigate to="/app" />
            } />
            <Route path="/app/history" element={
              user ? (
                <HistoryPage
                  setIsExporting={setIsExportingHistory}
                  setExportProgress={setExportHistoryProgress}
                />
              ) : (
                <Navigate to="/auth" />
              )
            } />
            <Route path="/pricing" element={
              <PricingPage onSelectTier={handleSelectTier} />
            } />
          </Routes>
        </AppLayout>

        {isExportingHistory && (
          <ExportProgressOverlay progress={exportHistoryProgress} />
        )}
      </div>
    </BrowserRouter>
  )
}