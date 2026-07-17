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
  if (typeof error === 'object' && 'message' in error) {
    return error.message
  }
  
  return "Terjadi kesalahan sistem. Silakan coba beberapa saat lagi."
}
