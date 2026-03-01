import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.then(store => store.get(name)?.value)
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.then(store => {
            try {
              store.set(name, value, options)
            } catch (error) {
              // Handle cookie error
            }
          })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.then(store => {
            try {
              store.set(name, '', options)
            } catch (error) {
              // Handle cookie error
            }
          })
        },
      },
    }
  )
}
