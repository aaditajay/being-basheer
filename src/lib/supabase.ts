import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isValidUrl = (str: string | undefined): boolean => {
    if (!str) return false
    try {
      const parsed = new URL(str)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  if (!url || !key || !isValidUrl(url)) {
    console.warn(
      'Warning: Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing or invalid. Using placeholders to prevent app crash.'
    )
    return createBrowserClient(
      'https://placeholder-project.supabase.co',
      key || 'placeholder-anon-key'
    )
  }

  return createBrowserClient(url, key)
}
