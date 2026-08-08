export function deriveDefaultHandle(email: string): string {
  const localPart = email.split('@')[0]
  const withoutTrailingDigits = localPart.replace(/\d+$/, '')
  const words = withoutTrailingDigits
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[._-]/)
    .filter(Boolean)
  if (words.length === 0) return 'User'
  return words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}
