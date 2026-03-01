'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Plus, 
  ShoppingCart, 
  Menu,
  Package,
  DollarSign,
  TrendingUp,
  FileText,
  BarChart3
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/sales/new', icon: Plus, label: 'Add', accent: true },
  { href: '/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/transactions', icon: FileText, label: 'History' },
]

const moreItems = [
  { href: '/products', icon: Package, label: 'Products' },
  { href: '/income', icon: DollarSign, label: 'Income' },
  { href: '/expenses', icon: TrendingUp, label: 'Expenses' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
]

export function BottomNav() {
  const pathname = usePathname()
  const isAddPage = pathname?.includes('/new')

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = item.accent 
              ? isAddPage 
              : pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  item.accent 
                    ? 'text-white bg-primary rounded-full -top-4 mx-4 shadow-lg' 
                    : isActive 
                      ? 'text-primary' 
                      : 'text-gray-500'
                }`}
                style={item.accent ? { width: 'calc(25% - 16px)' } : undefined}
              >
                <Icon className={`w-6 h-6 ${item.accent ? 'w-8 h-8' : ''}`} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex-col z-40">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">Cashflow Kitchen</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/products" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
            <Package className="w-5 h-5" />
            Products
          </Link>
          <Link href="/sales/new" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
            <Plus className="w-5 h-5" />
            Add Sale
          </Link>
          <Link href="/income" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
            <DollarSign className="w-5 h-5" />
            Income
          </Link>
          <Link href="/expenses" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
            <TrendingUp className="w-5 h-5" />
            Expenses
          </Link>
          <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
            <ShoppingCart className="w-5 h-5" />
            Orders
          </Link>
          <Link href="/transactions" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
            <FileText className="w-5 h-5" />
            Transactions
          </Link>
          <Link href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
            <BarChart3 className="w-5 h-5" />
            Reports
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">v1.0.0</p>
        </div>
      </div>
    </>
  )
}

export function MobileMenu() {
  const pathname = usePathname()
  
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between px-4 h-14">
        <h1 className="text-lg font-bold text-primary">Cashflow Kitchen</h1>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
            <Menu className="w-5 h-5" />
          </label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-white rounded-box w-52 mt-2 border border-gray-200">
            {moreItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={pathname === item.href ? 'active' : ''}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
