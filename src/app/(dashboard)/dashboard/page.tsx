import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const today = new Date().toISOString().split('T')[0]
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const [salesResult, incomeResult, expensesResult, pendingOrdersResult] = await Promise.all([
    supabase.from('sales').select('amount').gte('date', startOfMonth),
    supabase.from('income').select('amount').gte('date', startOfMonth),
    supabase.from('expenses').select('amount').gte('date', startOfMonth),
    supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'new')
  ])

  const [todaySalesResult, todayIncomeResult, todayExpensesResult] = await Promise.all([
    supabase.from('sales').select('amount').eq('date', today),
    supabase.from('income').select('amount').eq('date', today),
    supabase.from('expenses').select('amount').eq('date', today)
  ])

  const monthSales = salesResult.data?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0
  const monthIncome = incomeResult.data?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0
  const monthExpenses = expensesResult.data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
  const pendingOrders = pendingOrdersResult.count || 0

  const todaySales = todaySalesResult.data?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0
  const todayIncome = todayIncomeResult.data?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0
  const todayExpenses = todayExpensesResult.data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0

  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    last7Days.push(date.toISOString().split('T')[0])
  }

  const dailyData = await Promise.all(
    last7Days.map(async (date) => {
      const [salesData, expensesData, incomeData] = await Promise.all([
        supabase.from('sales').select('amount').eq('date', date),
        supabase.from('expenses').select('amount').eq('date', date),
        supabase.from('income').select('amount').eq('date', date)
      ])
      const sales = salesData.data?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0
      const expenses = expensesData.data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
      const income = incomeData.data?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0
      return {
        date,
        label: new Date(date).toLocaleDateString('ms-MY', { weekday: 'short' }),
        sales,
        income,
        expenses,
        net: sales + income - expenses
      }
    })
  )

  return (
    <DashboardClient
      todaySales={todaySales}
      todayIncome={todayIncome}
      todayExpenses={todayExpenses}
      todayNet={todaySales + todayIncome - todayExpenses}
      monthSales={monthSales}
      monthIncome={monthIncome}
      monthExpenses={monthExpenses}
      monthNet={monthSales + monthIncome - monthExpenses}
      pendingOrders={pendingOrders}
      chartData={dailyData}
    />
  )
}
