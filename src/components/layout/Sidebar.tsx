import { Button } from "@/components/ui/button"
import { Home, History, X, Menu, LogOut, User, Zap, BookOpen, Shield, FileText, Sun, Moon } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/components/theme-provider"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  currentPage: string
  tokens: number | null
  user: any
}

export function Sidebar({ sidebarOpen, setSidebarOpen, currentPage, tokens, user }: SidebarProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
      <div className="h-full flex flex-col dark:bg-[#1A1A1A] border dark:border-[#2e2e2e] sticky top-0 overscroll-none transition-colors duration-300">
        <div className="p-4 flex items-center gap-3 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={26} />}
          </Button>
          {sidebarOpen && (
            <h1 className="text-xl font-bold truncate">CarouselAI</h1>
          )}
        </div>

        <nav className="flex-1 px-2 space-y-2 mt-4 sticky top-20">
          <Button
            variant={currentPage === '/app' ? 'secondary' : 'ghost'}
            onClick={() => navigate('/app')}
            className={`w-full h-12 flex ${sidebarOpen ? "justify-start gap-4 px-4" : "justify-center px-0"}`}
          >
            <Home size={24} /> {sidebarOpen && <span className="font-medium">Home</span>}
          </Button>
          <Button
            variant={currentPage === '/app/history' ? 'secondary' : 'ghost'}
            onClick={() => navigate('/app/history')}
            className={`w-full h-12 flex ${sidebarOpen ? "justify-start gap-4 px-4" : "justify-center px-0"}`}
          >
            <History size={24} /> {sidebarOpen && <span className="font-medium">History</span>}
          </Button>
        </nav>

        <div className="mt-auto p-2 border-t dark:border-[#2e2e2e] space-y-1 shrink-0">
          {/* Credit Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className={`w-full h-12 flex ${sidebarOpen ? "justify-start gap-4 px-4" : "justify-center px-0"}`}>
                <Zap size={20} className="text-amber-500" />
                {sidebarOpen && <span className="font-medium text-sm">Credit: {tokens !== null ? tokens : '...'}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent side="right" className="w-60 p-4 space-y-4 bg-white
            dark:bg-[#242424] border border-slate-200 shadow-xl">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#888888] uppercase">Paket Saat Ini</p>
                <p className="font-semibold flex justify-between">
                  <span>Starter Plan</span>
                  <span className="text-blue-500">{tokens !== null ? `${tokens} Credits` : 'Loading...'}</span>
                </p>
              </div>
              {/* <Button className="w-full bg-blue-600 hover:bg-blue-700
              dark:text-[#f0f0f0]" onClick={() => navigate('/pricing')}>Upgrade Paket</Button> */}
            </PopoverContent>
          </Popover>

          {/* Profile Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className={`w-full h-12 flex ${sidebarOpen ? "justify-start gap-4 px-4" : "justify-center px-0"}`}>
                <User size={20} />
                {sidebarOpen && <span className="font-medium text-sm">Profile</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent side="right" className="w-60 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <p className="text-sm font-medium">{user?.email || 'User'}</p>
              </div>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-2 text-xs"><BookOpen size={14}/> FAQ</Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-xs"><Shield size={14}/> Terms of Service</Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-xs"><FileText size={14}/> Privacy Policy</Button>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
                <Button variant="ghost" onClick={() => signOut()} className="w-full justify-start gap-2 text-xs text-red-500"><LogOut size={14}/> Logout</Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className={`w-full h-12 flex ${sidebarOpen ? "justify-start gap-4 px-4" : "justify-center px-0"}`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {sidebarOpen && <span className="font-medium text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </Button>
        </div>
      </div>
  )
}
