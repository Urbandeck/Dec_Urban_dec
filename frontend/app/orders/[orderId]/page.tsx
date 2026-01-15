'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import { formatPrice } from '@/lib/utils'
import { downloadInvoicePDF } from '@/lib/invoice-pdf'
import { ENV_CONFIG } from '@/lib/env-config'
import Notification from '@/components/ui/notification'

interface OrderItem {
  productId: string
  productName?: string
  name?: string
  quantity: number
  price: number
  total?: number
  imageUrl?: string
  productAttributes?: string
  attributes?: string
}

interface Order {
  id: number
  orderId: string
  createdAt: string
  status: string
  totalAmount: number
  subtotal?: number
  shippingCost?: number
  items: OrderItem[]
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  shippingAddress?: {
    fullName?: string
    addressLine1?: string
    addressLine2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  customerDetails?: {
    fullName?: string
    addressLine1?: string
    addressLine2?: string
    city?: string
    state?: string
    postalCode?: string
    phone?: string
  }
  awbNumber?: string
  courierName?: string
  trackingUrl?: string
  paymentMethod?: string
  paymentStatus?: string
  shiprocketOrderId?: string
  shiprocketShipmentId?: string
  failureReason?: string
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const { isAuthenticated, _hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; title: string; message?: string } | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancellingOrder, setCancellingOrder] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated || !_hasHydrated) return

    if (!isAuthenticated) {
      router.push(`/login?redirect=/orders/${orderId}`)
      return
    }

    fetchOrderDetails()
  }, [isHydrated, _hasHydrated, isAuthenticated, orderId])

  const fetchOrderDetails = async () => {
    try {
      // Try to fetch from API first using orderId string
      try {
        const response = await axios.get(`${ENV_CONFIG.API_URL}/api/orders/by-order-id/${orderId}`, {
          withCredentials: true
        })
        setOrder(response.data)
        setLoading(false)
        return
      } catch (err) {
        // Try numeric ID endpoint
        const response = await axios.get(`${ENV_CONFIG.API_URL}/api/orders/${orderId}`, {
          withCredentials: true
        })
        setOrder(response.data)
        setLoading(false)
        return
      }
    } catch (err: any) {
      // Check localStorage as fallback
      const cachedOrders = localStorage.getItem('orders')
      if (cachedOrders) {
        const orders = JSON.parse(cachedOrders)
        const foundOrder = orders.find((o: Order) =>
          o.orderId === orderId || String(o.id) === orderId
        )
        if (foundOrder) {
          setOrder(foundOrder)
          setLoading(false)
          return
        }
      }

      setError('Order not found')
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return

    setCancellingOrder(true)
    try {
      const response = await axios.post(
        `${ENV_CONFIG.API_URL}/api/orders/${order.orderId || order.id}/cancel`,
        { reason: cancelReason || 'Cancelled by customer' },
        { withCredentials: true }
      )

      if (response.data.success) {
        setNotification({
          type: 'success',
          title: 'Order cancelled successfully',
          message: response.data.shiprocketCancelled
            ? 'Order and shipment have been cancelled'
            : 'Order has been cancelled'
        })
        setShowCancelModal(false)
        setCancelReason('')
        setOrder(prev => prev ? { ...prev, status: 'CANCELLED', failureReason: cancelReason || 'Cancelled by customer' } : null)
      } else {
        setNotification({
          type: 'error',
          title: 'Failed to cancel order',
          message: response.data.error || 'Unknown error occurred'
        })
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        title: 'Failed to cancel order',
        message: err.response?.data?.error || 'Please try again later'
      })
    } finally {
      setCancellingOrder(false)
    }
  }

  const getStatusDisplay = (status: string) => {
    const statusConfig: { [key: string]: { label: string, color: string, bgColor: string } } = {
      'PENDING': { label: 'Order Placed', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      'PAID': { label: 'Payment Confirmed', color: 'text-green-700', bgColor: 'bg-green-100' },
      'PROCESSING': { label: 'Processing', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      'SHIPPED': { label: 'Shipped', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      'OUT_FOR_DELIVERY': { label: 'Out for Delivery', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      'DELIVERED': { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100' },
      'CANCELLED': { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
      'FAILED': { label: 'Payment Failed', color: 'text-red-700', bgColor: 'bg-red-100' }
    }
    return statusConfig[status] || { label: status, color: 'text-gray-700', bgColor: 'bg-gray-100' }
  }

  // Show loading during hydration
  if (!isHydrated || !_hasHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-medium text-gray-900 mb-2">{error || 'Order not found'}</h2>
          <p className="text-gray-600 mb-4">We couldn't find the order you're looking for.</p>
          <Link href="/orders" className="text-blue-600 hover:underline">
            ← Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusDisplay(order.status)
  const shippingAddress = order.shippingAddress || order.customerDetails

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link href="/orders" className="text-blue-600 hover:underline mb-6 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-1">Order #{order.orderId || order.id}</p>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} ${statusInfo.bgColor}`}>
                {statusInfo.label}
              </span>
              {order.paymentMethod && (
                <span className="text-sm text-gray-600">
                  Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                </span>
              )}
            </div>
          </div>

          {/* Failure Reason */}
          {(order.status === 'CANCELLED' || order.status === 'FAILED') && order.failureReason && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <span className="font-medium">Reason: </span>
                {order.failureReason}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Items in your order</h2>
              <div className="space-y-4">
                {(order.items || []).map((item, index) => {
                  let imageUrl = item.imageUrl
                  if (imageUrl && imageUrl.startsWith('/api/')) {
                    imageUrl = `${ENV_CONFIG.API_URL}${imageUrl}`
                  }

                  return (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.productName || item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/products/${item.productId || ''}`}
                          className="text-base font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {item.productName || item.name}
                        </Link>
                        {(item.productAttributes || item.attributes) && (
                          <p className="text-sm text-gray-600 mt-1">{item.productAttributes || item.attributes}</p>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-medium text-gray-900">
                            {formatPrice(item.total || (item.price * item.quantity))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Shipping Information */}
            {shippingAddress && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                <div className="text-gray-700">
                  <p className="font-medium">{shippingAddress.fullName || order.customerName}</p>
                  <p>{shippingAddress.addressLine1}</p>
                  {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                  <p>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                  <p>{shippingAddress.country || 'India'}</p>
                  {(shippingAddress.phone || order.customerPhone) && (
                    <p className="mt-2 text-gray-600">Phone: {shippingAddress.phone || order.customerPhone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Tracking Information */}
            {(order.awbNumber || order.courierName) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Tracking Information</h2>
                <div className="space-y-2 text-gray-700">
                  {order.courierName && <p>Courier: {order.courierName}</p>}
                  {order.awbNumber && <p>AWB Number: {order.awbNumber}</p>}
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Track on carrier website
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{order.shippingCost ? formatPrice(order.shippingCost) : 'Free'}</span>
                </div>
                <div className="pt-3 border-t flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/orders/track/${order.orderId}`)}
                  className="w-full px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-md transition-colors"
                >
                  Track Package
                </button>
                <button
                  onClick={() => downloadInvoicePDF(order)}
                  className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors"
                >
                  Download Invoice
                </button>
                {!['CANCELLED', 'FAILED', 'DELIVERED'].includes(order.status) && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full px-4 py-2 border border-red-300 hover:bg-red-50 text-red-600 font-medium rounded-md transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
              <p className="text-sm text-gray-600 mb-3">
                For any queries about your order, please contact our customer support.
              </p>
              <div className="text-sm text-gray-700 space-y-1">
                <p>Email: urbandec.in@gmail.com</p>
                <p>Phone: +91 8105663269</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-900">Cancel Order</h2>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action cannot be undone. The order and any associated shipment will be cancelled.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel Order #{(order.orderId || order.id).toString().slice(0, 16).toUpperCase()}?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select a reason...</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelOrder}
                disabled={cancellingOrder}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium disabled:cursor-not-allowed transition-colors"
              >
                {cancellingOrder ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                No, Keep Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
