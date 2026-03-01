import { createClient } from '@/lib/supabase/server'
import ExportClient from './ExportClient'
import { redirect } from 'next/navigation'

export default async function ExportPage({ searchParams }: { searchParams: { tab?: string; start?: string; end?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const tab = searchParams.tab || 'sales'
  const startDate = searchParams.start || ''
  const endDate = searchParams.end || ''

  let data: any[] = []

  if (tab === 'sales') {
    let query = supabase
      .from('sales')
      .select('*, products(name)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    
    const { data: salesData } = await query
    data = salesData || []
  } else if (tab === 'income') {
    let query = supabase
      .from('income')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    
    const { data: incomeData } = await query
    data = incomeData || []
  } else if (tab === 'expenses') {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    
    const { data: expenseData } = await query
    data = expenseData || []
  } else if (tab === 'orders') {
    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .eq('user_id', user.id)
      .order('order_date', { ascending: false })
    
    if (startDate) query = query.gte('order_date', startDate)
    if (endDate) query = query.lte('order_date', endDate)
    
    const { data: ordersData } = await query
    data = ordersData || []
  }

  return <ExportClient data={data} tab={tab} startDate={startDate} endDate={endDate} />
}
