import { createClient } from '@/lib/supabase/server'
import OrderDetail from './OrderDetail'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!order) {
    redirect('/orders')
  }

  return <OrderDetail order={order} />
}
