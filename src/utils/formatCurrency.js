export const formatCurrency = (value) => {
  if (typeof value !== 'number') return value
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}


