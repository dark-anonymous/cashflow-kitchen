import { createClient } from '@/lib/supabase/server'
import OrdersList from './OrdersList'
import { redirect } from 'next/navigation'

export default async function OrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  let query = supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  const { data: orders } = await query

  const ordersWithTotal = orders?.map(order => ({
    ...order,
    total_amount: order.order_items?.reduce((sum: number, item: any) => sum + (item.line_total || 0), 0) || 0
  })) || []

  return <OrdersList orders={ordersWithTotal} />
}
