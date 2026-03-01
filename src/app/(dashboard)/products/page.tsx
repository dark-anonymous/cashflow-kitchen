import { createClient } from '@/lib/supabase/server'
import ProductsList from './ProductsList'
import { redirect } from 'next/navigation'

export default async function ProductsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <ProductsList products={products || []} />
}
