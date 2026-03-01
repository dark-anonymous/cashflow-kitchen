import { createClient } from '@/lib/supabase/server'
import TransactionsList from './TransactionsList'
import { redirect } from 'next/navigation'

export default async function TransactionsPage({ searchParams }: { searchParams: { tab?: string; start?: string; end?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const tab = searchParams.tab || 'all'
  const startDate = searchParams.start || ''
  const endDate = searchParams.end || ''

  let sales, income, expenses

  if (tab === 'all' || tab === 'sales') {
    let salesQuery = supabase
      .from('sales')
      .select('*, products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (startDate) salesQuery = salesQuery.gte('date', startDate)
    if (endDate) salesQuery = salesQuery.lte('date', endDate)
    
    const { data: salesData } = await salesQuery
    sales = salesData?.map(s => ({ ...s, type: 'sale', typeLabel: 'Sale' })) || []
  }

  if (tab === 'all' || tab === 'income') {
    let incomeQuery = supabase
      .from('income')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (startDate) incomeQuery = incomeQuery.gte('date', startDate)
    if (endDate) incomeQuery = incomeQuery.lte('date', endDate)
    
    const { data: incomeData } = await incomeQuery
    income = incomeData?.map(i => ({ ...i, type: 'income', typeLabel: 'Income' })) || []
  }

  if (tab === 'all' || tab === 'expense') {
    let expenseQuery = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (startDate) expenseQuery = expenseQuery.gte('date', startDate)
    if (endDate) expenseQuery = expenseQuery.lte('date', endDate)
    
    const { data: expenseData } = await expenseQuery
    expenses = expenseData?.map(e => ({ ...e, type: 'expense', typeLabel: 'Expense' })) || []
  }

  let transactions: any[] = []
  if (tab === 'all') {
    transactions = [...(sales || []), ...(income || []), ...(expenses || [])]
    transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (tab === 'sales') {
    transactions = sales || []
  } else if (tab === 'income') {
    transactions = income || []
  } else if (tab === 'expense') {
    transactions = expenses || []
  }

  return <TransactionsList 
    transactions={transactions} 
    tab={tab}
    startDate={startDate}
    endDate={endDate}
  />
}
