import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseError(error: any): string {
  if (!error) return "Terjadi kesalahan yang tidak diketahui"
  
  const message = error?.message || String(error).toLowerCase()
  
  // 1. Network Errors
  if (
    message.toLowerCase().includes("fetch") || 
    message.toLowerCase().includes("network") || 
    message.toLowerCase().includes("timeout") ||
    message.toLowerCase().includes("failed to fetch")
  ) {
    return "Koneksi internet terganggu. Periksa koneksi Anda dan coba lagi."
  }
  
  // 2. Authentication Errors
  if (message.includes("User tidak ditemukan") || message.toLowerCase().includes("unauthorized")) {
    return "Sesi Anda telah berakhir atau tidak ditemukan. Silakan masuk kembali."
  }
  
  // 3. Supabase / API Errors
  if (typeof error === 'object' && 'message' in error && error.message) {
    const msg = String(error.message)
    if (msg && msg !== "[object Object]" && msg !== "{}") return msg
  }
  
  return "Terjadi kesalahan sistem. Silakan coba beberapa saat lagi."
}



// ========== localStorage helpers ==========
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    // Data korup dibuang, jangan bikin app crash
    try { localStorage.removeItem(key) } catch {}
    return fallback
  }
}


export function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota penuh / private mode -> diamkan
  }
}