'use client'
import { useMemo } from 'react'
import { useCartStore } from '@/store/cart.store'

export function useCart() {
  const store = useCartStore()
  const subtotal = useMemo(() => store.items.reduce((s, i) => s + i.unitPrice * i.quantity - i.discountAmount, 0), [store.items])
  const taxTotal = useMemo(() => store.items.reduce((s, i) => s + i.taxAmount, 0), [store.items])
  const orderDiscount = store.discountType === 'percent' ? subtotal * (store.discount / 100) : store.discount
  const total = Math.max(0, subtotal + taxTotal - orderDiscount - store.couponDiscount)
  const itemCount = store.items.reduce((s, i) => s + i.quantity, 0)
  return { ...store, subtotal, taxTotal, orderDiscount, total, itemCount }
}
