'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/contexts/ToastContext'
import { Loader2, ArrowLeft, Phone, MessageCircle, Check, X, Truck, Package } from 'lucide-react'
import { Order, OrderItem } from '@/types'
import { formatCurrency, formatDate, formatTime, getStatusColor, getPaymentMethodLabel, getDeliveryMethodLabel, generateWhatsAppLink, generateOrderItemsSummary } from '@/lib/utils'

interface OrderDetailProps {
  order: Order & { order_items: (OrderItem & { products: any })[] }
}

export default function OrderDetail({ order }: OrderDetailProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)
  const supabase = createClient()
  const { showToast } = useToast()
  const router = useRouter()

  const totalAmount = order.order_items?.reduce((sum, item) => sum + (item.line_total || 0), 0) || 0

  const itemsSummaryData = order.order_items?.map((item: any) => ({
    product_name: item.products?.name || 'Product',
    qty: item.qty
  })) || []
  
  const itemsSummary = generateOrderItemsSummary(itemsSummaryData)

  const updateStatus = async (status: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', order.id)

    if (error) {
      showToast('Failed to update status', 'error')
    } else {
      showToast('Status updated', 'success')
      router.refresh()
    }
    setLoading(false)
    setShowConfirm(null)
  }

  const convertToSales = async () => {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showToast('Please login first', 'error')
      setLoading(false)
      return
    }

    const salesRecords = order.order_items?.map(item => ({
      user_id: user.id,
      date: order.order_date,
      time: order.order_time,
      product_id: item.product_id,
      qty: item.qty,
      unit_price: item.unit_price,
      amount: item.line_total,
      payment_method: order.payment_method || 'cash',
      notes: `Order #${order.id.slice(0, 8)} - ${order.customer_name}`
    })) || []

    const { error: salesError } = await supabase.from('sales').insert(salesRecords)

    if (salesError) {
      showToast('Failed to convert to sales', 'error')
      setLoading(false)
      return
    }

    await supabase
      .from('orders')
      .update({ 
        converted_to_sales: true, 
        converted_at: new Date().toISOString() 
      })
      .eq('id', order.id)

    showToast('Order converted to sales', 'success')
    router.refresh()
    setLoading(false)
  }

  const updatePaymentMethod = async (method: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('orders')
      .update({ payment_method: method as any })
      .eq('id', order.id)

    if (error) {
      showToast('Failed to update payment method', 'error')
    } else {
      showToast('Payment method updated', 'success')
      router.refresh()
    }
    setLoading(false)
  }

  const getWhatsAppMessage = (type: string) => {
    const name = order.customer_name
    const itemsTxt = itemsSummary || 'order anda'
    
    const messages: Record<string, string> = {
      confirmed: `Hi ${name}, order anda untuk ${itemsTxt} telah disahkan. Total RM${totalAmount.toFixed(2)}. Terima kasih.`,
      reminder: `Hi ${name}, order ${itemsTxt} berjumlah RM${totalAmount.toFixed(2)}. Boleh buat pembayaran ya. Terima kasih.`,
      paid: `Hi ${name}, pembayaran RM${totalAmount.toFixed(2)} telah diterima. Order sedang diproses.`,
      ready: `Hi ${name}, order anda sudah siap. Boleh pickup hari ini.`,
      delivery: `Hi ${name}, order anda sedang dalam penghantaran.`
    }
    
    return messages[type] || ''
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <Link href="/orders" className="flex items-center gap-2 text-gray-600 mb-4">
        <ArrowLeft className="w-5 h-5" />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
        <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{order.customer_name}</h2>
            <p className="text-gray-600">{formatDate(order.order_date)} {formatTime(order.order_time)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{getDeliveryMethodLabel(order.delivery_method)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href={`tel:${order.phone}`} className="flex items-center gap-2 text-blue-600">
            <Phone className="w-4 h-4" />
            {order.phone}
          </a>
          {order.payment_method && (
            <span className="text-sm text-gray-500">
              Payment: {getPaymentMethodLabel(order.payment_method)}
            </span>
          )}
        </div>

        {order.notes && (
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            Note: {order.notes}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Items</h3>
        <div className="space-y-2">
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{item.products?.name || 'Product'}</p>
                <p className="text-sm text-gray-500">{item.qty} x {formatCurrency(item.unit_price)}</p>
              </div>
              <p className="font-semibold">{formatCurrency(item.line_total)}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 mt-3 border-t">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {order.status === 'paid' && !order.converted_to_sales && (
        <button
          onClick={convertToSales}
          disabled={loading}
          className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
          Convert to Sales
        </button>
      )}

      {order.converted_to_sales && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-medium">Converted to Sales</p>
          <p className="text-sm text-green-600">
            {order.converted_at && `on ${formatDate(order.converted_at)}`}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Actions</h3>
        
        {order.status === 'new' && (
          <button
            onClick={() => setShowConfirm('confirmed')}
            className="w-full py-3 bg-yellow-500 text-white rounded-lg font-medium mb-2"
          >
            Mark as Confirmed
          </button>
        )}

        {order.status === 'confirmed' && (
          <>
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Set Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {(['cash', 'transfer', 'ewallet'] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => updatePaymentMethod(method)}
                    disabled={loading}
                    className={`py-2 rounded-lg border-2 text-sm ${
                      order.payment_method === method
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {getPaymentMethodLabel(method)}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowConfirm('paid')}
              className="w-full py-3 bg-green-500 text-white rounded-lg font-medium"
            >
              Mark as Paid
            </button>
          </>
        )}

        {order.status === 'paid' && order.delivery_method === 'delivery' && (
          <button
            onClick={() => setShowConfirm('delivered')}
            className="w-full py-3 bg-purple-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Truck className="w-5 h-5" />
            Mark as Delivered
          </button>
        )}

        {order.status === 'paid' && order.delivery_method === 'pickup' && (
          <button
            onClick={() => setShowConfirm('delivered')}
            className="w-full py-3 bg-purple-500 text-white rounded-lg font-medium"
          >
            Mark as Ready for Pickup
          </button>
        )}

        {(order.status !== 'cancelled' && order.status !== 'delivered') && (
          <button
            onClick={() => setShowConfirm('cancelled')}
            className="w-full py-3 border-2 border-red-500 text-red-500 rounded-lg font-medium mt-2"
          >
            Cancel Order
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">WhatsApp Templates</h3>
        <div className="space-y-2">
          {order.status === 'new' && (
            <a
              href={generateWhatsAppLink(order.phone, getWhatsAppMessage('confirmed'))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100"
            >
              <MessageCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium">Send Confirmation</span>
            </a>
          )}
          
          {(order.status === 'confirmed' || order.status === 'new') && (
            <a
              href={generateWhatsAppLink(order.phone, getWhatsAppMessage('reminder'))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100"
            >
              <MessageCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Payment Reminder</span>
            </a>
          )}

          {order.status === 'confirmed' && (
            <a
              href={generateWhatsAppLink(order.phone, getWhatsAppMessage('paid'))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100"
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Payment Received</span>
            </a>
          )}

          {order.status === 'paid' && order.delivery_method === 'pickup' && (
            <a
              href={generateWhatsAppLink(order.phone, getWhatsAppMessage('ready'))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Ready for Pickup</span>
            </a>
          )}

          {order.status === 'paid' && order.delivery_method === 'delivery' && (
            <a
              href={generateWhatsAppLink(order.phone, getWhatsAppMessage('delivery'))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100"
            >
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Out for Delivery</span>
            </a>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">
              {showConfirm === 'cancelled' ? 'Cancel Order?' : `Mark as ${showConfirm}?`}
            </h3>
            <p className="text-gray-600 mb-4">
              {showConfirm === 'cancelled' 
                ? 'This action cannot be undone.' 
                : 'This will update the order status.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus(showConfirm)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
