'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, ShoppingCart, Phone, MessageCircle, MoreVertical } from 'lucide-react'
import { Order, OrderItem } from '@/types'
import { formatCurrency, formatDate, getStatusColor, generateWhatsAppLink } from '@/lib/utils'

interface OrderWithItems extends Order {
  order_items?: (OrderItem & { products?: any })[]
}

interface OrdersListProps {
  orders: OrderWithItems[]
}

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'paid', label: 'Paid' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
]

export default function OrdersList({ orders }: OrdersListProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filteredOrders = orders.filter(order => {
    const matchSearch = 
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search)
    if (!status) return matchSearch
    return matchSearch && order.status === status
  })

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <Link href="/orders/new" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <Plus className="w-5 h-5" />
          New Order
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{order.customer_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    {order.converted_to_sales && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                        Sold
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(order.order_date)}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.order_items?.length || 0} item(s) • {formatCurrency(order.total_amount || 0)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={`tel:${order.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      {order.phone}
                    </a>
                    <a
                      href={generateWhatsAppLink(order.phone, `Hi ${order.customer_name}, status order anda: ${order.status}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-green-600 hover:underline"
                    >
                      <MessageCircle className="w-3 h-3" />
                      WhatsApp
                    </a>
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {order.delivery_method === 'pickup' ? 'Pickup' : 'Delivery'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
