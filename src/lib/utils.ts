export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function formatDateTime(dateString: string, timeString: string): string {
  return `${formatDate(dateString)} ${formatTime(timeString)}`
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

export function getCurrentTime(): string {
  const now = new Date()
  return now.toTimeString().slice(0, 5)
}

export function getStartOfMonth(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
}

export function getEndOfMonth(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
}

export function getLast7Days(): { start: string; end: string }[] {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push({
      start: date.toISOString().split('T')[0],
      end: date.toISOString().split('T')[0]
    })
  }
  return days
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    delivered: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Tunai',
    transfer: 'Transfer',
    ewallet: 'E-Wallet'
  }
  return labels[method] || method
}

export function getExpenseCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    ingredient: 'Bahan',
    packaging: 'Pembungkusan',
    delivery: 'Penghantaran',
    marketing: 'Pemasaran',
    utilities: 'Utiliti',
    other: 'Lain'
  }
  return labels[category] || category
}

export function getDeliveryMethodLabel(method: string): string {
  return method === 'pickup' ? 'Pickup' : 'Delivery'
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function generateOrderItemsSummary(items: { product_name: string; qty: number }[]): string {
  return items.map(item => `${item.product_name} x${item.qty}`).join(', ')
}
