'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Plus, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardClientProps {
  todaySales: number
  todayIncome: number
  todayExpenses: number
  todayNet: number
  monthSales: number
  monthIncome: number
  monthExpenses: number
  monthNet: number
  pendingOrders: number
  chartData: { date: string; label: string; sales: number; net: number }[]
}

export default function DashboardClient({
  todaySales,
  todayIncome,
  todayExpenses,
  todayNet,
  monthSales,
  monthIncome,
  monthExpenses,
  monthNet,
  pendingOrders,
  chartData
}: DashboardClientProps) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sales Today"
          value={formatCurrency(todaySales)}
          icon={<DollarSign className="w-5 h-5" />}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Income Today"
          value={formatCurrency(todayIncome)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Exp Today"
          value={formatCurrency(todayExpenses)}
          icon={<TrendingDown className="w-5 h-5" />}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          title="Net Today"
          value={formatCurrency(todayNet)}
          icon={todayNet >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          color={todayNet >= 0 ? 'text-green-600' : 'text-red-600'}
          bgColor={todayNet >= 0 ? 'bg-green-50' : 'bg-red-50'}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Month Sales"
          value={formatCurrency(monthSales)}
          icon={<DollarSign className="w-5 h-5" />}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Month Income"
          value={formatCurrency(monthIncome)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Month Expenses"
          value={formatCurrency(monthExpenses)}
          icon={<TrendingDown className="w-5 h-5" />}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          title="Month Net"
          value={formatCurrency(monthNet)}
          icon={monthNet >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          color={monthNet >= 0 ? 'text-green-600' : 'text-red-600'}
          bgColor={monthNet >= 0 ? 'bg-green-50' : 'bg-red-50'}
        />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">7-Day Trend</h2>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `RM${v}`} />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value) || 0)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="sales" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} name="Sales" />
              <Line type="monotone" dataKey="net" stroke="#8B5A2B" strokeWidth={2} dot={{ r: 4 }} name="Net" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {pendingOrders > 0 && (
        <Link href="/orders?status=new" className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl p-4 hover:bg-yellow-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 text-white p-2 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-yellow-800">{pendingOrders} Pending Order{pendingOrders > 1 ? 's' : ''}</p>
              <p className="text-sm text-yellow-600">Click to view</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-yellow-600" />
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickButton href="/sales/new" label="Sale" color="bg-green-500" />
        <QuickButton href="/income/new" label="Income" color="bg-blue-500" />
        <QuickButton href="/expenses/new" label="Expense" color="bg-red-500" />
        <QuickButton href="/orders/new" label="Order" color="bg-purple-500" />
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, bgColor }: { 
  title: string
  value: string
  icon: React.ReactNode
  color: string
  bgColor: string
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${bgColor} ${color}`}>
          {icon}
        </div>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  )
}

function QuickButton({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <Link 
      href={href}
      className="flex flex-col items-center justify-center py-4 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
      style={{ backgroundColor: color }}
    >
      <Plus className="w-6 h-6 mb-1" />
      {label}
    </Link>
  )
}
