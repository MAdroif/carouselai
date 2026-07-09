import { Sparkles } from "lucide-react"

export function TokenBadge({ tokens }: { tokens: number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-800 shrink-0">
      <Sparkles size={12} />
      <span>{tokens} Token</span>
    </div>
  )
}
