import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  variantId?: string
  name: string
  sku: string
  image?: string
  unitPrice: number
  quantity: number
  discountAmount: number
  taxAmount: number
  taxRate: number
  totalPrice: number
  notes?: string
  modifiers: string[]
}

export interface HoldOrder {
  id: string
  name: string
  items: CartItem[]
  customerId: string | null
  createdAt: string
}

interface CartStore {
  items: CartItem[]
  customerId: string | null
  customerName: string | null
  discount: number
  discountType: 'fixed' | 'percent'
  couponCode: string | null
  couponDiscount: number
  notes: string
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  tableId: string | null
  holdOrders: HoldOrder[]
  addItem: (item: Omit<CartItem, 'quantity' | 'discountAmount' | 'taxAmount' | 'totalPrice' | 'modifiers'> & { quantity?: number }) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  updateItemDiscount: (productId: string, discount: number, variantId?: string) => void
  updateItemNotes: (productId: string, notes: string, variantId?: string) => void
  setCustomer: (id: string | null, name: string | null) => void
  setDiscount: (amount: number, type: 'fixed' | 'percent') => void
  setCoupon: (code: string | null, discount: number) => void
  setOrderType: (type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY') => void
  setTable: (tableId: string | null) => void
  setNotes: (notes: string) => void
  clearCart: () => void
  holdOrder: (name: string) => void
  resumeOrder: (id: string) => void
  deleteHoldOrder: (id: string) => void
}

const calcItemTotal = (item: CartItem) => {
  const base = item.unitPrice * item.quantity
  const afterDiscount = base - item.discountAmount
  const tax = afterDiscount * (item.taxRate / 100)
  return afterDiscount + tax
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customerId: null,
      customerName: null,
      discount: 0,
      discountType: 'fixed',
      couponCode: null,
      couponDiscount: 0,
      notes: '',
      orderType: 'DINE_IN',
      tableId: null,
      holdOrders: [],

      addItem: (newItem) => set((state) => {
        const key = newItem.variantId || newItem.productId
        const existing = state.items.find(i => (i.variantId || i.productId) === key)
        if (existing) {
          return {
            items: state.items.map(i => {
              if ((i.variantId || i.productId) === key) {
                const updated = { ...i, quantity: i.quantity + (newItem.quantity || 1) }
                updated.taxAmount = (updated.unitPrice * updated.quantity - updated.discountAmount) * (updated.taxRate / 100)
                updated.totalPrice = calcItemTotal(updated)
                return updated
              }
              return i
            })
          }
        }
        const item: CartItem = {
          ...newItem,
          quantity: newItem.quantity || 1,
          discountAmount: 0,
          taxAmount: 0,
          taxRate: (newItem as CartItem).taxRate || 0,
          totalPrice: 0,
          modifiers: [],
        }
        item.taxAmount = item.unitPrice * item.quantity * (item.taxRate / 100)
        item.totalPrice = calcItemTotal(item)
        return { items: [...state.items, item] }
      }),

      removeItem: (productId, variantId) => set((state) => ({
        items: state.items.filter(i => variantId ? i.variantId !== variantId : i.productId !== productId)
      })),

      updateQuantity: (productId, quantity, variantId) => set((state) => ({
        items: quantity <= 0
          ? state.items.filter(i => variantId ? i.variantId !== variantId : i.productId !== productId)
          : state.items.map(i => {
              const match = variantId ? i.variantId === variantId : i.productId === productId
              if (match) {
                const updated = { ...i, quantity }
                updated.taxAmount = (updated.unitPrice * updated.quantity - updated.discountAmount) * (updated.taxRate / 100)
                updated.totalPrice = calcItemTotal(updated)
                return updated
              }
              return i
            })
      })),

      updateItemDiscount: (productId, discount, variantId) => set((state) => ({
        items: state.items.map(i => {
          const match = variantId ? i.variantId === variantId : i.productId === productId
          if (match) {
            const updated = { ...i, discountAmount: discount }
            updated.taxAmount = (updated.unitPrice * updated.quantity - updated.discountAmount) * (updated.taxRate / 100)
            updated.totalPrice = calcItemTotal(updated)
            return updated
          }
          return i
        })
      })),

      updateItemNotes: (productId, notes, variantId) => set((state) => ({
        items: state.items.map(i => {
          const match = variantId ? i.variantId === variantId : i.productId === productId
          return match ? { ...i, notes } : i
        })
      })),

      setCustomer: (id, name) => set({ customerId: id, customerName: name }),
      setDiscount: (amount, type) => set({ discount: amount, discountType: type }),
      setCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      setOrderType: (type) => set({ orderType: type }),
      setTable: (tableId) => set({ tableId }),
      setNotes: (notes) => set({ notes }),

      clearCart: () => set({
        items: [], customerId: null, customerName: null, discount: 0,
        discountType: 'fixed', couponCode: null, couponDiscount: 0,
        notes: '', tableId: null,
      }),

      holdOrder: (name) => set((state) => ({
        holdOrders: [...state.holdOrders, {
          id: Date.now().toString(),
          name,
          items: state.items,
          customerId: state.customerId,
          createdAt: new Date().toISOString(),
        }],
        items: [], customerId: null, customerName: null,
      })),

      resumeOrder: (id) => set((state) => {
        const order = state.holdOrders.find(o => o.id === id)
        if (!order) return state
        return {
          items: order.items,
          customerId: order.customerId,
          holdOrders: state.holdOrders.filter(o => o.id !== id),
        }
      }),

      deleteHoldOrder: (id) => set((state) => ({
        holdOrders: state.holdOrders.filter(o => o.id !== id),
      })),
    }),
    { name: 'cart-storage' }
  )
)

export const useCartTotals = () => {
  const { items, discount, discountType, couponDiscount } = useCartStore()
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity - i.discountAmount, 0)
  const taxTotal = items.reduce((sum, i) => sum + i.taxAmount, 0)
  const itemDiscounts = items.reduce((sum, i) => sum + i.discountAmount, 0)
  const orderDiscount = discountType === 'percent' ? subtotal * (discount / 100) : discount
  const discountTotal = itemDiscounts + orderDiscount + couponDiscount
  const total = subtotal + taxTotal - orderDiscount - couponDiscount
  return { subtotal, taxTotal, discountTotal, total: Math.max(0, total) }
}
