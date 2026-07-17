import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { signUp, signInWithGoogle } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast, Toaster } from "sonner"

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

export default function AuthPage({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter")
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          toast.error("Email atau password salah.")
          setLoading(false)
          return
        }
      } else {
        const { error } = await signUp(email, password)
        if (error) {
          toast.error(error.message || "Gagal mendaftar.")
          setLoading(false)
          return
        }
      }
      onAuthSuccess()
    } catch (error: any) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative h-svh w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Toaster position="top-right" richColors />
      <div className={`absolute inset-y-0 w-1/2 flex items-center justify-center p-8 transition-all duration-700 ease-in-out z-10 ${isLogin ? 'left-0' : 'left-1/2'}`}>
        <Card className="w-full max-w-sm shadow-xl p-6 transition-all duration-500 hover:shadow-2xl">
          <CardContent className="p-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{isLogin ? "Selamat Datang" : "Buat Akun Baru"}</h1>
              <p className="text-slate-500 text-sm">
                {isLogin ? "Masukkan detail untuk masuk" : "Mulai perjalanan carousel Anda"}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
              )}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full transition-all duration-300 hover:scale-[1.02]" disabled={loading}>
                {loading ? "Memproses..." : (isLogin ? "Masuk" : "Daftar")}
              </Button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400">Atau lanjut dengan</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={googleLoading || loading}
                onClick={async () => {
                  setGoogleLoading(true)
                  try {
                    await signInWithGoogle()
                    onAuthSuccess()
                  } catch (error) {
                    console.error(error)
                  } finally {
                    setGoogleLoading(false)
                  }
                }}
              >
                {googleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {googleLoading ? "Menghubungkan..." : "Google"}
              </Button>
            </form>
            <p className="text-center text-sm">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                {isLogin ? "Daftar" : "Masuk"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className={`absolute inset-y-0 w-1/2 flex items-center justify-center p-12 transition-all duration-700 ease-in-out ${isLogin ? 'left-1/2 bg-blue-600' : 'left-0 bg-indigo-600'}`}>
        <div className="text-white space-y-6 max-w-md animate-in fade-in zoom-in-95 duration-1000">
          <Sparkles size={48} className="transition-transform duration-700 hover:rotate-180" />
          <h2 className="text-4xl font-bold leading-tight">
            {isLogin ? "Siap melanjutkan kreasi?" : "Ubah Ide Jadi Konten"}
          </h2>
          <p className="text-blue-100 text-lg">
            {isLogin ? "Lanjutkan perjalanan kreatif Anda bersama CarouselAI." : "Rancang carousel profesional dalam detik."}
          </p>
        </div>
      </div>
    </div>
  )
}
