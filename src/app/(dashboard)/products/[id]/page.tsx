'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/contexts/ToastContext'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('cake')
  const [defaultPrice, setDefaultPrice] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const supabase = createClient()
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        showToast('Product not found', 'error')
        router.push('/products')
        return
      }

      setName(data.name)
      setCategory(data.category)
      setDefaultPrice(data.default_price.toString())
      setIsActive(data.is_active)
      setInitialLoading(false)
    }

    fetchProduct()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('products')
      .update({
        name,
        category,
        default_price: parseFloat(defaultPrice),
        is_active: isActive
      })
      .eq('id', params.id)

    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Product updated', 'success')
      router.push('/products')
    }
    setLoading(false)
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <Link href="/products" className="flex items-center gap-2 text-gray-600 mb-4">
        <ArrowLeft className="w-5 h-5" />
        Back to Products
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
          >
            <option value="cake">Cake</option>
            <option value="cookies">Cookies</option>
            <option value="others">Others</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Price (RM)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={defaultPrice}
            onChange={(e) => setDefaultPrice(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 text-primary rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Product'}
        </button>
      </form>
    </div>
  )
}
