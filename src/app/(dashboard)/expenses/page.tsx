import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate, formatTime, getPaymentMethodLabel, getExpenseCategoryLabel } from '@/lib/utils'

export default async function ExpensesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/transactions" className="flex items-center gap-2 text-gray-600">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
        <Link href="/expenses/new" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
          <Plus className="w-5 h-5" />
          Add
        </Link>
      </div>

      {(!expenses || expenses.length === 0) ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No expense records yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map(item => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-red-600">{formatCurrency(item.amount)}</p>
                  <p className="text-sm text-gray-500">{formatDate(item.date)} {formatTime(item.time)}</p>
                  <p className="text-xs text-gray-400">
                    {getExpenseCategoryLabel(item.category)} • {getPaymentMethodLabel(item.payment_method)}
                  </p>
                  {item.supplier && <p className="text-sm text-gray-600 mt-1">Supplier: {item.supplier}</p>}
                  {item.notes && <p className="text-sm text-gray-500">{item.notes}</p>}
                </div>
                <Link href="/transactions?tab=expense" className="text-primary">
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
