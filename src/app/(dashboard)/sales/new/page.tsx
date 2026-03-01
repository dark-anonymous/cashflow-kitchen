'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/contexts/ToastContext'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/types'
import { formatCurrency, getToday, getCurrentTime } from '@/lib/utils'

export default function NewSalePage() {
  const [date, setDate] = useState(getToday())
  const [time, setTime] = useState(getCurrentTime())
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [amount, setAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (data) {
        setProducts(data)
        if (data.length > 0) {
          setProductId(data[0].id)
          setUnitPrice(data[0].default_price.toString())
        }
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    const qtyNum = parseFloat(qty) || 0
    const priceNum = parseFloat(unitPrice) || 0
    setAmount(qtyNum * priceNum)
  }, [qty, unitPrice])

  const handleProductChange = (id: string) => {
    setProductId(id)
    const product = products.find(p => p.id === id)
    if (product) {
      setUnitPrice(product.default_price.toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showToast('Please login first', 'error')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('sales').insert({
      user_id: user.id,
      date,
      time,
      product_id: productId,
      qty: parseFloat(qty),
      unit_price: parseFloat(unitPrice),
      amount,
      payment_method: paymentMethod,
      notes: notes || null
    })

    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Sale recorded', 'success')
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

    const { error } = await supabase.from('sales').insert({
      user_id: user.id,
      date,
      time,
      product_id: productId,
      qty: parseFloat(qty),
      unit_price: parseFloat(unitPrice),
      amount,
      payment_method: paymentMethod,
      notes: notes || null
    })

    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Sale recorded', 'success')
      setQty('1')
      setTime(getCurrentTime())
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

      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Sale</h1>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
          <select
            value={productId}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
            required
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.default_price)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              step="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (RM)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
          <div className="text-2xl font-bold text-primary">{formatCurrency(amount)}</div>
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
