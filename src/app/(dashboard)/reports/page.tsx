'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#8B5A2B', '#A67B5B', '#D4A574', '#F5E6D3', '#22C55E', '#3B82F6']

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadReport()
  }, [reportType, date, month])

  const loadReport = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    if (reportType === 'daily') {
      const [salesResult, incomeResult, expensesResult, productSalesResult] = await Promise.all([
        supabase.from('sales').select('amount').eq('date', date).eq('user_id', user.id),
        supabase.from('income').select('amount').eq('date', date).eq('user_id', user.id),
        supabase.from('expenses').select('amount').eq('date', date).eq('user_id', user.id),
        supabase.from('sales').select('amount, products(name)').eq('date', date).eq('user_id', user.id)
      ])

      const totalSales = salesResult.data?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0
      const totalIncome = incomeResult.data?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0
      const totalExpenses = expensesResult.data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0

      const salesByProduct: Record<string, number> = {}
      productSalesResult.data?.forEach((s: any) => {
        const name = s.products?.name || 'Unknown'
        salesByProduct[name] = (salesByProduct[name] || 0) + s.amount
      })

      const salesByProductArray = Object.entries(salesByProduct).map(([name, total]) => ({
        name,
        total
      }))

      setData({
        totalSales,
        totalIncome,
        totalExpenses,
        net: totalSales + totalIncome - totalExpenses,
        salesByProduct: salesByProductArray
      })
    } else {
      const startOfMonth = `${month}-01`
      const endOfMonth = new Date(parseInt(month.slice(0, 4)), parseInt(month.slice(5, 7)), 0).toISOString().split('T')[0]

      const [salesResult, incomeResult, expensesResult] = await Promise.all([
        supabase.from('sales').select('date, amount, products(name)').gte('date', startOfMonth).lte('date', endOfMonth).eq('user_id', user.id),
        supabase.from('income').select('date, amount').gte('date', startOfMonth).lte('date', endOfMonth).eq('user_id', user.id),
        supabase.from('expenses').select('date, amount').gte('date', startOfMonth).lte('date', endOfMonth).eq('user_id', user.id)
      ])

      const totalSales = salesResult.data?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0
      const totalIncome = incomeResult.data?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0
      const totalExpenses = expensesResult.data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0

      const productSales: Record<string, number> = {}
      salesResult.data?.forEach((s: any) => {
        const name = s.products?.name || 'Unknown'
        productSales[name] = (productSales[name] || 0) + s.amount
      })

      const topProduct = Object.entries(productSales).length > 0
        ? Object.entries(productSales).reduce((max, [name, total]) => 
            total > max[1] ? [name, total] : max
          )
        : null

      const dailyDataMap: Record<string, { sales: number; net: number }> = {}
      salesResult.data?.forEach((s: any) => {
        if (!dailyDataMap[s.date]) dailyDataMap[s.date] = { sales: 0, net: 0 }
        dailyDataMap[s.date].sales += s.amount || 0
      })
      expensesResult.data?.forEach((e: any) => {
        if (!dailyDataMap[e.date]) dailyDataMap[e.date] = { sales: 0, net: 0 }
        dailyDataMap[e.date].net = dailyDataMap[e.date].sales - (e.amount || 0)
      })

      const dailyData = Object.entries(dailyDataMap).map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('ms-MY', { day: 'numeric' }),
        sales: values.sales,
        net: values.net
      }))

      setData({
        totalSales,
        totalIncome,
        totalExpenses,
        net: totalSales + totalIncome - totalExpenses,
        topProduct: topProduct ? { name: topProduct[0], total: topProduct[1] as number } : null,
        dailyData
      })
    }

    setLoading(false)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>

      <div className="flex gap-2">
        <button
          onClick={() => setReportType('daily')}
          className={`px-4 py-2 rounded-lg font-medium ${
            reportType === 'daily' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Daily Report
        </button>
        <button
          onClick={() => setReportType('monthly')}
          className={`px-4 py-2 rounded-lg font-medium ${
            reportType === 'monthly' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Monthly Report
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        {reportType === 'daily' ? (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
          />
        ) : (
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
          />
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(data.totalSales)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(data.totalIncome)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(data.totalExpenses)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Net</p>
              <p className={`text-xl font-bold ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.net)}
              </p>
            </div>
          </div>

          {reportType === 'monthly' && data.topProduct && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Top Product</h3>
              <div className="flex items-center justify-between">
                <span className="text-lg">{data.topProduct.name}</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(data.topProduct.total)}</span>
              </div>
            </div>
          )}

          {reportType === 'daily' && data.salesByProduct.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Sales by Product</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.salesByProduct}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {data.salesByProduct.map((entry: any, index: number) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {reportType === 'monthly' && data.dailyData.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Daily Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `RM${v}`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                    <Bar dataKey="sales" fill="#22C55E" name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
