import { createClient } from '@/lib/supabase/client'

export async function seedUserProducts() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count === 0) {
    await supabase.from('products').insert([
      { user_id: user.id, name: 'Kek Batik', category: 'cake', default_price: 45.00 },
      { user_id: user.id, name: 'Cookies', category: 'cookies', default_price: 25.00 }
    ])
  }
}
