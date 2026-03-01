'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit2, Trash2, Package, ToggleLeft, ToggleRight } from 'lucide-react'
import { Product } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'

export default function ProductsList({ products: initialProducts }: { products: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [showActive, setShowActive] = useState<boolean | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()
  const { showToast } = useToast()
  const router = useRouter()

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    if (showActive === null) return matchSearch
    return matchSearch && p.is_active === showActive
  })

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      showToast('Failed to update product', 'error')
    } else {
      setProducts(products.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p))
      showToast('Product updated', 'success')
    }
  }

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      showToast('Failed to delete product', 'error')
    } else {
      setProducts(products.filter(p => p.id !== id))
      showToast('Product deleted', 'success')
    }
    setDeleteId(null)
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <Link href="/products/new" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={showActive === null ? '' : showActive.toString()}
          onChange={(e) => setShowActive(e.target.value === '' ? null : e.target.value === 'true')}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <div key={product.id} className={`bg-white rounded-xl p-4 shadow-sm ${!product.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                      {product.category}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {formatCurrency(product.default_price)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(product.id, product.is_active)}
                    className={`p-2 rounded-lg ${product.is_active ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {product.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <Link
                    href={`/products/${product.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
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
            <h3 className="text-lg font-semibold mb-2">Delete Product?</h3>
            <p className="text-gray-600 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteProduct(deleteId)}
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
