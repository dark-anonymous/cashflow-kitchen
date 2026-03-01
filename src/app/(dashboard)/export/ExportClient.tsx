'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Download, ArrowLeft } from 'lucide-react'
import { formatCurrency, formatDate, formatTime, getPaymentMethodLabel, getExpenseCategoryLabel, getDeliveryMethodLabel, getStatusColor } from '@/lib/utils'

interface ExportClientProps {
  data: any[]
  tab: string
  startDate: string
  endDate: string
}

export default function ExportClient({ data, tab, startDate, endDate }: ExportClientProps) {
  const router = useRouter()
  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)

  const generateCSV = () => {
    let csvContent = ''
    let headers: string[] = []
    let rows: string[][] = []

    if (tab === 'sales') {
      headers = ['Date', 'Time', 'Product', 'Qty', 'Unit Price', 'Amount', 'Payment Method', 'Notes']
      rows = data.map((s: any) => [
        s.date,
        s.time,
        s.products?.name || '',
        s.qty.toString(),
        s.unit_price.toFixed(2),
        s.amount.toFixed(2),
        getPaymentMethodLabel(s.payment_method),
        s.notes || ''
      ])
    } else if (tab === 'income') {
      headers = ['Date', 'Time', 'Amount', 'Payment Method', 'Notes']
      rows = data.map((i: any) => [
        i.date,
        i.time,
        i.amount.toFixed(2),
        getPaymentMethodLabel(i.payment_method),
        i.notes || ''
      ])
    } else if (tab === 'expenses') {
      headers = ['Date', 'Time', 'Category', 'Amount', 'Payment Method', 'Supplier', 'Notes']
      rows = data.map((e: any) => [
        e.date,
        e.time,
        getExpenseCategoryLabel(e.category),
        e.amount.toFixed(2),
        getPaymentMethodLabel(e.payment_method),
        e.supplier || '',
        e.notes || ''
      ])
    } else if (tab === 'orders') {
      headers = ['Order Date', 'Time', 'Customer Name', 'Phone', 'Delivery Method', 'Status', 'Items', 'Total', 'Payment Method', 'Notes']
      rows = data.map((o: any) => [
        o.order_date,
        o.order_time,
        o.customer_name,
        o.phone,
        getDeliveryMethodLabel(o.delivery_method),
        o.status,
        o.order_items?.map((item: any) => `${item.products?.name} x${item.qty}`).join('; ') || '',
        o.order_items?.reduce((sum: number, item: any) => sum + item.line_total, 0).toFixed(2) || '0.00',
        o.payment_method ? getPaymentMethodLabel(o.payment_method) : '',
        o.notes || ''
      ])
    }

    csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${tab}_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const applyFilter = () => {
    const params = new URLSearchParams()
    params.set('tab', tab)
    if (localStartDate) params.set('start', localStartDate)
    if (localEndDate) params.set('end', localEndDate)
    router.push(`/export?${params.toString()}`)
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/transactions" className="flex items-center gap-2 text-gray-600">
        <ArrowLeft className="w-5 h-5" />
        Back to Transactions
      </Link>

      <h1 className="text-2xl font-bold text-gray-800">Export Data</h1>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Export Type</label>
          <div className="flex flex-wrap gap-2">
            {['sales', 'income', 'expenses', 'orders'].map(t => (
              <Link
                key={t}
                href={`/export?tab=${t}&start=${startDate}&end=${endDate}`}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${
                  tab === t 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
            />
            <input
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={applyFilter}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold capitalize">{tab}</h2>
            <p className="text-sm text-gray-500">{data.length} records found</p>
          </div>
          <button
            onClick={generateCSV}
            disabled={data.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Download CSV
          </button>
        </div>

        {data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {tab === 'sales' && (
                    <>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Product</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-left">Payment</th>
                    </>
                  )}
                  {tab === 'income' && (
                    <>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-left">Payment</th>
                    </>
                  )}
                  {tab === 'expenses' && (
                    <>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-left">Payment</th>
                    </>
                  )}
                  {tab === 'orders' && (
                    <>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Customer</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((item: any, index: number) => (
                  <tr key={index} className="border-t">
                    {tab === 'sales' && (
                      <>
                        <td className="px-3 py-2">{formatDate(item.date)}</td>
                        <td className="px-3 py-2">{item.products?.name || '-'}</td>
                        <td className="px-3 py-2 text-right">{item.qty}</td>
                        <td className="px-3 py-2 text-right text-green-600">{formatCurrency(item.amount)}</td>
                        <td className="px-3 py-2">{getPaymentMethodLabel(item.payment_method)}</td>
                      </>
                    )}
                    {tab === 'income' && (
                      <>
                        <td className="px-3 py-2">{formatDate(item.date)}</td>
                        <td className="px-3 py-2 text-right text-blue-600">{formatCurrency(item.amount)}</td>
                        <td className="px-3 py-2">{getPaymentMethodLabel(item.payment_method)}</td>
                      </>
                    )}
                    {tab === 'expenses' && (
                      <>
                        <td className="px-3 py-2">{formatDate(item.date)}</td>
                        <td className="px-3 py-2">{getExpenseCategoryLabel(item.category)}</td>
                        <td className="px-3 py-2 text-right text-red-600">{formatCurrency(item.amount)}</td>
                        <td className="px-3 py-2">{getPaymentMethodLabel(item.payment_method)}</td>
                      </>
                    )}
                    {tab === 'orders' && (
                      <>
                        <td className="px-3 py-2">{formatDate(item.order_date)}</td>
                        <td className="px-3 py-2">
                          <div>{item.customer_name}</div>
                          <div className="text-xs text-gray-500">{item.phone}</div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(item.order_items?.reduce((sum: number, i: any) => sum + i.line_total, 0) || 0)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 10 && (
              <p className="text-sm text-gray-500 text-center py-2">
                Showing first 10 of {data.length} records. Download CSV for all data.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
