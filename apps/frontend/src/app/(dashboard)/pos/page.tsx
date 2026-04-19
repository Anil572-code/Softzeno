'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/product.service'
import { saleService } from '@/services/sale.service'
import { useCartStore } from '@/store/cart.store'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Minus, Trash2, ShoppingCart, Pause, CreditCard, Banknote, QrCode } from 'lucide-react'
import { toast } from 'sonner'

export default function POSPage() {
  const [search, setSearch] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'QR'>('CASH')
  const [amountTendered, setAmountTendered] = useState('')
  const [processing, setProcessing] = useState(false)

  const {
    items, addItem, removeItem, updateQuantity, clearCart, holdOrder,
    customerId, customerName, setCustomer,
    discount, discountType, setDiscount,
    notes, setNotes,
    subtotal, taxTotal, discountTotal, total,
  } = useCartStore()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  })

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products-pos', search, activeCategoryId],
    queryFn: () => productService.getProducts({
      search,
      categoryId: activeCategoryId === 'all' ? undefined : activeCategoryId,
      limit: 60,
    }),
  })

  const products = productsData?.data ?? []
  const change = Math.max(0, parseFloat(amountTendered || '0') - total)

  async function handleCompleteSale() {
    if (items.length === 0) {
      toast.error('Add items to cart first')
      return
    }
    setProcessing(true)
    try {
      await saleService.createSale({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discountAmount: i.discountAmount,
          taxAmount: i.taxAmount,
          notes: i.notes,
        })),
        customerId: customerId ?? undefined,
        discount,
        discountType,
        notes,
        payments: [{ method: paymentMethod, amount: total }],
      })
      clearCart()
      setPaymentOpen(false)
      toast.success('Sale completed!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to complete sale')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 -m-4 lg:-m-6">
      {/* Left: Product catalog */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden border-r">
        {/* Search */}
        <div className="p-4 bg-white dark:bg-slate-800 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products, SKU, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-4 py-2 bg-white dark:bg-slate-800 border-b overflow-x-auto">
          <Tabs value={activeCategoryId} onValueChange={setActiveCategoryId}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
              {(categories?.data ?? []).map((cat: any) => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs px-3">
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-3 h-28 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <ShoppingCart className="h-10 w-10 mb-2" />
              <p>No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => addItem({
                    productId: product.id,
                    name: product.name,
                    sku: product.sku ?? '',
                    unitPrice: product.sellingPrice,
                    taxRate: product.taxClass?.rate ?? 0,
                  })}
                  className="bg-white dark:bg-slate-800 rounded-lg p-3 text-left hover:shadow-md hover:border-indigo-300 border border-transparent transition-all active:scale-95 touch-manipulation"
                >
                  <div className="w-full aspect-square bg-gray-100 dark:bg-slate-700 rounded-md mb-2 flex items-center justify-center">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-300">
                        {product.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-800 dark:text-white truncate">{product.name}</p>
                  <p className="text-sm font-bold text-indigo-600 mt-0.5">{formatCurrency(product.sellingPrice)}</p>
                  {product.trackStock && (
                    <Badge
                      variant={product.stockQty <= 0 ? 'destructive' : product.stockQty <= 5 ? 'outline' : 'secondary'}
                      className="text-xs mt-1 py-0"
                    >
                      {product.stockQty <= 0 ? 'Out' : `${product.stockQty} left`}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 lg:w-96 flex flex-col bg-white dark:bg-slate-800 shadow-lg">
        {/* Cart header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            Current Order
          </h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => holdOrder('Hold ' + new Date().toLocaleTimeString())}
              disabled={items.length === 0}
              title="Hold order"
            >
              <Pause className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={clearCart} disabled={items.length === 0}>
              Clear
            </Button>
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <ShoppingCart className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs mt-1">Click products to add them</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.unitPrice)} each</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-red-400 hover:text-red-600"
                      onClick={() => removeItem(item.productId, item.variantId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-bold text-sm">{formatCurrency(item.totalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="p-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax</span>
            <span>{formatCurrency(taxTotal)}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-indigo-600">{formatCurrency(total)}</span>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700"
            disabled={items.length === 0}
            onClick={() => setPaymentOpen(true)}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Charge {formatCurrency(total)}
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center py-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-sm text-gray-500">Amount Due</p>
              <p className="text-4xl font-bold text-indigo-600">{formatCurrency(total)}</p>
            </div>

            {/* Payment method */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'CASH', label: 'Cash', icon: Banknote },
                  { key: 'CARD', label: 'Card', icon: CreditCard },
                  { key: 'QR', label: 'QR Pay', icon: QrCode },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPaymentMethod(key as any)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === key
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'CASH' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="tendered">Amount Tendered</Label>
                  <Input
                    id="tendered"
                    type="number"
                    placeholder="0.00"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    className="text-lg mt-1"
                    autoFocus
                  />
                </div>
                {parseFloat(amountTendered) > 0 && (
                  <div className="flex justify-between py-3 px-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="font-medium text-green-700">Change</span>
                    <span className="font-bold text-green-700 text-lg">{formatCurrency(change)}</span>
                  </div>
                )}
                {/* Quick cash buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[total, Math.ceil(total / 5) * 5, Math.ceil(total / 10) * 10, Math.ceil(total / 20) * 20].map((amt) => (
                    <Button
                      key={amt}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmountTendered(amt.toFixed(2))}
                      className="text-xs"
                    >
                      {formatCurrency(amt)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="text-center py-6 text-gray-500">
                <CreditCard className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">Swipe or tap card on terminal</p>
              </div>
            )}

            {paymentMethod === 'QR' && (
              <div className="text-center py-6">
                <QrCode className="h-16 w-16 mx-auto text-gray-700" />
                <p className="text-sm text-gray-500 mt-2">Scan QR to pay {formatCurrency(total)}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 flex-1"
              onClick={handleCompleteSale}
              disabled={processing || (paymentMethod === 'CASH' && parseFloat(amountTendered || '0') < total)}
            >
              {processing ? 'Processing...' : 'Complete Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
