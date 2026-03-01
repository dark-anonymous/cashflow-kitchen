'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Edit2, Trash2, DollarSign, TrendingUp, TrendingDown, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/contexts/ToastContext'
import { formatCurrency, formatDate, formatTime, getPaymentMethodLabel, getExpenseCategoryLabel } from '@/lib/utils'

interface Transaction {
  id: string
  type: 'sale' | 'income' | 'expense'
  typeLabel: string
  date: string
  time: string
  amount: number
  payment_method: string
  notes: string | null
  created_at: string
  product?: any
  category?: string
}

interface TransactionsListProps {
  transactions: Transaction[]
  tab: string
  startDate: string
  endDate: string
}

export default function TransactionsList({ transactions: initialTransactions, tab, startDate, endDate }: TransactionsListProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<{ id: string; type: string } | null>(null)
  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { showToast } = useToast()

  useEffect(() => {
    setTransactions(initialTransactions)
  }, [initialTransactions])

  const filteredTransactions = transactions.filter(t => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      (t.product?.name || '').toLowerCase().includes(searchLower) ||
      (t.notes || '').toLowerCase().includes(searchLower) ||
      t.amount.toString().includes(search)
    )
  })

  const applyFilter = () => {
    const params = new URLSearchParams()
    params.set('tab', tab)
    if (localStartDate) params.set('start', localStartDate)
    if (localEndDate) params.set('end', localEndDate)
    router.push(`/transactions?${params.toString()}`)
  }

  const clearFilter = () => {
    setLocalStartDate('')
    setLocalEndDate('')
    router.push(`/transactions?tab=${tab}`)
  }

  const deleteTransaction = async () => {
    if (!deleteId) return

    const { error } = await supabase
      .from(deleteId.type === 'sale' ? 'sales' : deleteId.type === 'income' ? 'income' : 'expenses')
      .delete()
      .eq('id', deleteId.id)

    if (error) {
      showToast('Failed to delete', 'error')
    } else {
      showToast('Deleted successfully', 'success')
      setTransactions(transactions.filter(t => t.id !== deleteId.id))
    }
    setDeleteId(null)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-green-100 text-green-800'
      case 'income': return 'bg-blue-100 text-blue-800'
      case 'expense': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale': return <DollarSign className="w-4 h-4" />
      case 'income': return <TrendingUp className="w-4 h-4" />
      case 'expense': return <TrendingDown className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <Link href={`/export?tab=${tab}&start=${startDate}&end=${endDate}`} className="flex items-center gap-2 text-primary">
          <Download className="w-5 h-5" />
          Export
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'sales', 'income', 'expense'].map(t => (
          <Link
            key={t}
            href={`/transactions?tab=${t}`}
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
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
            Filter
          </button>
          {(localStartDate || localEndDate) && (
            <button
              onClick={clearFilter}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map(transaction => (
            <div key={`${transaction.type}-${transaction.id}`} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(transaction.type)}`}>
                    {getTypeIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(transaction.type)}`}>
                        {transaction.typeLabel}
                      </span>
                      {transaction.product && (
                        <span className="font-medium text-gray-800">{transaction.product.name}</span>
                      )}
                      {transaction.type === 'expense' && (
                        <span className="text-sm text-gray-500">
                          ({getExpenseCategoryLabel(transaction.category || 'other')})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.date)} {formatTime(transaction.time)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getPaymentMethodLabel(transaction.payment_method)}
                      {transaction.notes && ` • ${transaction.notes}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${
                    transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </span>
                  <button
                    onClick={() => setDeleteId({ id: transaction.id, type: transaction.type })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Transaction?</h3>
            <p className="text-gray-600 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteTransaction}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
