import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = "/" // Force reload to clear corrupted state
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                <AlertCircle size={48} />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ups! Terjadi Kesalahan</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Sesuatu tidak berjalan semestinya. Kami telah mencatat masalah ini dan sedang memperbaikinya.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-slate-200 dark:bg-slate-800 rounded-lg text-left text-xs font-mono text-slate-600 dark:text-slate-400 overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <Button onClick={this.handleReset} className="w-full py-6 text-lg rounded-2xl">
              Muat Ulang Aplikasi
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
