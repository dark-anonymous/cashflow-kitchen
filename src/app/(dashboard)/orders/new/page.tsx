'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/contexts/ToastContext'
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/types'
import { formatCurrency, getToday, getCurrentTime } from '@/lib/utils'

interface OrderItem {
  id: string
  product_id: string
  qty: number
  unit_price: number
  line_total: number
}

export default function NewOrderPage() {
  const [orderDate, setOrderDate] = useState(getToday())
  const [orderTime, setOrderTime] = useState(getCurrentTime())
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState('pickup')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', product_id: '', qty: 1, unit_price: 0, line_total: 0 }
  ])
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
          setItems([{ 
            id: '1', 
            product_id: data[0].id, 
            qty: 1, 
            unit_price: data[0].default_price, 
            line_total: data[0].default_price 
          }])
        }
      }
    }

    fetchProducts()
  }, [])

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item
      
      const updated = { ...item, [field]: value }
      
      if (field === 'product_id') {
        const product = products.find(p => p.id === value)
        if (product) {
          updated.unit_price = product.default_price
          updated.line_total = product.default_price * updated.qty
        }
      }
      
      if (field === 'qty' || field === 'unit_price') {
        updated.line_total = updated.qty * updated.unit_price
      }
      
      return updated
    }))
  }

  const addItem = () => {
    const newId = Math.random().toString(36).substring(7)
    const defaultProduct = products[0]?.id || ''
    setItems([...items, { 
      id: newId, 
      product_id: defaultProduct, 
      qty: 1, 
      unit_price: products[0]?.default_price || 0, 
      line_total: products[0]?.default_price || 0 
    }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.line_total, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerName || !phone) {
      showToast('Please fill in customer details', 'error')
      return
    }

    const validItems = items.filter(item => item.product_id && item.qty > 0)
    if (validItems.length === 0) {
      showToast('Please add at least one item', 'error')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showToast('Please login first', 'error')
      setLoading(false)
      return
    }

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      user_id: user.id,
      order_date: orderDate,
      order_time: orderTime,
      customer_name: customerName,
      phone,
      delivery_method: deliveryMethod,
      status: 'new',
      notes: notes || null
    }).select().single()

    if (orderError) {
      showToast(orderError.message, 'error')
      setLoading(false)
      return
    }

    const orderItems = validItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      qty: item.qty,
      unit_price: item.unit_price,
      line_total: item.line_total
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      showToast(itemsError.message, 'error')
      await supabase.from('orders').delete().eq('id', order.id)
    } else {
      showToast('Order created', 'success')
      router.push('/orders')
    }
    setLoading(false)
  }

  const handleSaveAndNew = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerName || !phone) {
      showToast('Please fill in customer details', 'error')
      return
    }

    const validItems = items.filter(item => item.product_id && item.qty > 0)
    if (validItems.length === 0) {
      showToast('Please add at least one item', 'error')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showToast('Please login first', 'error')
      setLoading(false)
      return
    }

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      user_id: user.id,
      order_date: orderDate,
      order_time: orderTime,
      customer_name: customerName,
      phone,
      delivery_method: deliveryMethod,
      status: 'new',
      notes: notes || null
    }).select().single()

    if (orderError) {
      showToast(orderError.message, 'error')
      setLoading(false)
      return
    }

    const orderItems = validItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      qty: item.qty,
      unit_price: item.unit_price,
      line_total: item.line_total
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      showToast(itemsError.message, 'error')
      await supabase.from('orders').delete().eq('id', order.id)
    } else {
      showToast('Order created', 'success')
      setCustomerName('')
      setPhone('')
      setNotes('')
      setOrderTime(getCurrentTime())
      if (products.length > 0) {
        setItems([{ 
          id: '1', 
          product_id: products[0].id, 
          qty: 1, 
          unit_price: products[0].default_price, 
          line_total: products[0].default_price 
        }])
      }
    }
    setLoading(false)
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <Link href="/orders" className="flex items-center gap-2 text-gray-600 mb-4">
        <ArrowLeft className="w-5 h-5" />
        Back to Orders
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Customer Details</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={orderTime}
                onChange={(e) => setOrderTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., 0123456789"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
            <div className="grid grid-cols-2 gap-3">
              {(['pickup', 'delivery'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setDeliveryMethod(method)}
                  className={`py-3 rounded-lg border-2 font-medium capitalize transition-colors ${
                    deliveryMethod === method
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 text-gray-700 hover:border-primary'
                  }`}
                >
                  {method === 'pickup' ? 'Pickup' : 'Delivery'}
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
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Order Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500 mt-3">{index + 1}.</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <select
                    value={item.product_id}
                    onChange={(e) => updateItem(item.id, 'product_id', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary text-sm"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Price"
                  />
                  <div className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-primary flex items-center justify-between">
                    <span>{formatCurrency(item.line_total)}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSaveAndNew}
            disabled={loading}
            className="flex-1 py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Save & New
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Order'}
          </button>
        </div>
      </form>
    </div>
  )
}
