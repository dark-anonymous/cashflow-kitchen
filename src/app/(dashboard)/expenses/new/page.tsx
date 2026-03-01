'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/contexts/ToastContext'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getToday, getCurrentTime, formatCurrency } from '@/lib/utils'

const expenseCategories = [
  { value: 'ingredient', label: 'Bahan' },
  { value: 'packaging', label: 'Pembungkusan' },
  { value: 'delivery', label: 'Penghantaran' },
  { value: 'marketing', label: 'Pemasaran' },
  { value: 'utilities', label: 'Utiliti' },
  { value: 'other', label: 'Lain' }
]

export default function NewExpensePage() {
  const [date, setDate] = useState(getToday())
  const [time, setTime] = useState(getCurrentTime())
  const [category, setCategory] = useState('ingredient')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [supplier, setSupplier] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { showToast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showToast('Please login first', 'error')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      date,
      time,
      category,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      supplier: supplier || null,
      notes: notes || null
    })

    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Expense recorded', 'success')
      router.push('/transactions')
    }
    setLoading(false)
  }

  const handleSaveAndAddNext = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showToast('Please login first', 'error')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      date,
      time,
      category,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      supplier: supplier || null,
      notes: notes || null
    })

    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Expense recorded', 'success')
      setAmount('')
      setTime(getCurrentTime())
      setSupplier('')
      setNotes('')
    }
    setLoading(false)
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <Link href="/transactions" className="flex items-center gap-2 text-gray-600 mb-4">
        <ArrowLeft className="w-5 h-5" />
        Back to Transactions
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Expense</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
            required
          >
            {expenseCategories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RM)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-xl font-semibold"
            placeholder="0.00"
            required
          />
          {amount && (
            <p className="text-sm text-gray-500 mt-1">{formatCurrency(parseFloat(amount) || 0)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <div className="grid grid-cols-3 gap-3">
            {(['cash', 'transfer', 'ewallet'] as const).map(method => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`py-3 rounded-lg border-2 font-medium capitalize transition-colors ${
                  paymentMethod === method
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 text-gray-700 hover:border-primary'
                }`}
              >
                {method === 'cash' ? 'Tunai' : method === 'transfer' ? 'Transfer' : 'E-Wallet'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Supplier (Optional)</label>
          <input
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Bakery Supplier"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleSaveAndAddNext}
            disabled={loading}
            className="flex-1 py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Save & Add Next
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
