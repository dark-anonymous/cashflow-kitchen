export type PaymentMethod = 'cash' | 'transfer' | 'ewallet'

export type ProductCategory = 'cake' | 'cookies' | 'others'

export type ExpenseCategory = 'ingredient' | 'packaging' | 'delivery' | 'marketing' | 'utilities' | 'other'

export type OrderStatus = 'new' | 'confirmed' | 'paid' | 'delivered' | 'cancelled'

export type DeliveryMethod = 'pickup' | 'delivery'

export interface Product {
  id: string
  user_id: string
  name: string
  category: ProductCategory
  default_price: number
  is_active: boolean
  created_at: string
}

export interface Sale {
  id: string
  user_id: string
  date: string
  time: string
  product_id: string
  qty: number
  unit_price: number
  amount: number
  payment_method: PaymentMethod
  notes: string | null
  created_at: string
  product?: Product
}

export interface Income {
  id: string
  user_id: string
  date: string
  time: string
  amount: number
  payment_method: PaymentMethod
  notes: string | null
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  date: string
  time: string
  category: ExpenseCategory
  amount: number
  payment_method: PaymentMethod
  supplier: string | null
  notes: string | null
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  order_date: string
  order_time: string
  customer_name: string
  phone: string
  delivery_method: DeliveryMethod
  status: OrderStatus
  payment_method: PaymentMethod | null
  notes: string | null
  converted_to_sales: boolean
  converted_at: string | null
  created_at: string
  items?: OrderItem[]
  total_amount?: number
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  qty: number
  unit_price: number
  line_total: number
  product?: Product
}

export interface DashboardStats {
  todaySales: number
  todayIncome: number
  todayExpenses: number
  todayNet: number
  monthSales: number
  monthIncome: number
  monthExpenses: number
  monthNet: number
  pendingOrders: number
}

export interface DailyReport {
  date: string
  totalSales: number
  totalIncome: number
  totalExpenses: number
  net: number
  salesByProduct: { name: string; total: number }[]
}

export interface MonthlyReport {
  month: string
  totalSales: number
  totalIncome: number
  totalExpenses: number
  net: number
  topProduct: { name: string; total: number } | null
  dailyData: { date: string; sales: number; net: number }[]
}
