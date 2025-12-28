'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { ENV_CONFIG } from '@/lib/env-config'

interface TrackingEvent {
  date: string
  time: string
  status: string
  location: string
  description: string
}

interface Order {
  orderId: string
  orderDate: string
  status: string
  totalAmount: number
  items: any[]
  shippingAddress?: any
  awbNumber?: string
  courierName?: string
  trackingUrl?: string
  shiprocketStatus?: string
}

export default function TrackOrderPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Map order status to tracking events
  const getTrackingEvents = (order: Order): TrackingEvent[] => {
    const events: TrackingEvent[] = []
    const orderDate = new Date(order.orderDate)

    // Always show Order Placed
    events.push({
      date: orderDate.toLocaleDateString(),
      time: orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Order Placed',
      location: 'Online',
      description: 'Your order has been successfully placed'
    })

    // Add events based on status
    const statusMap: { [key: string]: TrackingEvent } = {
      'PROCESSING': {
        date: orderDate.toLocaleDateString(),
        time: new Date(orderDate.getTime() + 2 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Processing',
        location: 'Warehouse',
        description: 'Your order is being prepared for shipment'
      },
      'SHIPPED': {
        date: new Date(orderDate.getTime() + 86400000).toLocaleDateString(),
        time: '10:00 AM',
        status: 'Shipped',
        location: order.courierName || 'Distribution Center',
        description: `Your order has been shipped${order.awbNumber ? ` (AWB: ${order.awbNumber})` : ''}`
      },
      'OUT_FOR_DELIVERY': {
        date: new Date(orderDate.getTime() + 172800000).toLocaleDateString(),
        time: '09:00 AM',
        status: 'Out for Delivery',
        location: 'Local Facility',
        description: 'Your order is out for delivery'
      },
      'DELIVERED': {
        date: new Date(orderDate.getTime() + 259200000).toLocaleDateString(),
        time: '05:00 PM',
        status: 'Delivered',
        location: 'Your Address',
        description: 'Your order has been successfully delivered'
      }
    }

    // Add events based on current status
    const statusOrder = ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']
    const currentIndex = statusOrder.indexOf(order.status)

    for (let i = 0; i <= currentIndex && i < statusOrder.length; i++) {
      const status = statusOrder[i]
      if (statusMap[status]) {
        events.push(statusMap[status])
      }
    }

    // If shiprocket status is available, use it for more accurate tracking
    if (order.shiprocketStatus) {
      // Add shiprocket specific status
      events.push({
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: order.shiprocketStatus,
        location: 'Courier Update',
        description: `Latest status from ${order.courierName || 'courier'}`
      })
    }

    return events
  }

  const fetchOrderDetails = async () => {
    try {
      // First, try to get from localStorage (cached orders)
      const cachedOrders = localStorage.getItem('orders')
      if (cachedOrders) {
        const orders = JSON.parse(cachedOrders)
        const foundOrder = orders.find((o: Order) => o.orderId === orderId)
        if (foundOrder) {
          setOrder(foundOrder)

          // If order has AWB number, fetch real-time tracking from Shiprocket
          if (foundOrder.awbNumber) {
            try {
              const trackingResponse = await axios.get(
                `${ENV_CONFIG.API_URL}/api/shiprocket/track/${foundOrder.awbNumber}`,
                { withCredentials: true }
              )

              // Update order with real-time tracking data
              if (trackingResponse.data && trackingResponse.data.tracking_data) {
                const trackingData = trackingResponse.data.tracking_data
                setOrder(prev => ({
                  ...prev!,
                  shiprocketStatus: trackingData.shipment_status || prev!.shiprocketStatus,
                  courierName: trackingData.courier_name || prev!.courierName,
                  trackingUrl: trackingData.tracking_url || prev!.trackingUrl
                }))
              }
            } catch (trackErr) {
              console.error('Error fetching tracking data:', trackErr)
              // Continue with cached data if tracking fetch fails
            }
          }

          setLoading(false)
          return
        }
      }

      // If not in cache, fetch from API - try both endpoints
      try {
        // First try the by-order-id endpoint which uses the order ID string
        const response = await axios.get(`${ENV_CONFIG.API_URL}/api/orders/by-order-id/${orderId}`, {
          withCredentials: true
        })
        const orderData = response.data
        setOrder(orderData)

        // If order has AWB number, fetch real-time tracking
        if (orderData.awbNumber) {
          try {
            const trackingResponse = await axios.get(
              `${ENV_CONFIG.API_URL}/api/shiprocket/track/${orderData.awbNumber}`,
              { withCredentials: true }
            )

            if (trackingResponse.data && trackingResponse.data.tracking_data) {
              const trackingData = trackingResponse.data.tracking_data
              setOrder(prev => ({
                ...prev!,
                shiprocketStatus: trackingData.shipment_status,
                courierName: trackingData.courier_name || prev!.courierName,
                trackingUrl: trackingData.tracking_url || prev!.trackingUrl
              }))
            }
          } catch (trackErr) {
            console.error('Error fetching tracking data:', trackErr)
          }
        }
      } catch (err) {
        // If that fails, try the numeric ID endpoint
        const response = await axios.get(`${ENV_CONFIG.API_URL}/api/orders/${orderId}`, {
          withCredentials: true
        })
        const orderData = response.data
        setOrder(orderData)

        // If order has AWB number, fetch real-time tracking
        if (orderData.awbNumber) {
          try {
            const trackingResponse = await axios.get(
              `${ENV_CONFIG.API_URL}/api/shiprocket/track/${orderData.awbNumber}`,
              { withCredentials: true }
            )

            if (trackingResponse.data && trackingResponse.data.tracking_data) {
              const trackingData = trackingResponse.data.tracking_data
              setOrder(prev => ({
                ...prev!,
                shiprocketStatus: trackingData.shipment_status,
                courierName: trackingData.courier_name || prev!.courierName,
                trackingUrl: trackingData.tracking_url || prev!.trackingUrl
              }))
            }
          } catch (trackErr) {
            console.error('Error fetching tracking data:', trackErr)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Unable to fetch order details. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link href="/orders" className="text-blue-600 hover:underline">
            ← Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const trackingEvents = getTrackingEvents(order)
  const currentStep = trackingEvents.length - 1

  // Default status steps for progress bar
  const allStatuses = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered']

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/orders" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Orders
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-600 mb-6">Order ID: {orderId}</p>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Delivery Status</h2>
              <span className="text-sm text-gray-500">
                Expected delivery: {new Date(Date.now() + 259200000).toLocaleDateString()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>
              <div
                className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-500"
                style={{ width: `${(currentStep / (trackingEvents.length - 1)) * 100}%` }}
              ></div>

              <div className="relative flex justify-between">
                {allStatuses.map((status, index) => {
                  const isCompleted = trackingEvents.some(e => e.status === status)
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <span className="text-xs mt-2 text-center max-w-20">
                        {status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Tracking History</h2>
            <div className="space-y-4">
              {trackingEvents.slice().reverse().map((event, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5"></div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium">{event.status}</h3>
                      <span className="text-sm text-gray-500">
                        {event.date} at {event.time}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                    <p className="text-gray-500 text-sm mt-1">📍 {event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t pt-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Shipping Information</h3>
                <p className="text-sm text-gray-600">
                  {order.courierName && <span>Carrier: {order.courierName}<br /></span>}
                  {order.awbNumber ? (
                    <span>Tracking Number: {order.awbNumber}<br /></span>
                  ) : (
                    <span>Tracking Number: UD{orderId.slice(0, 10).toUpperCase()}<br /></span>
                  )}
                  Shipping Method: Standard Delivery<br />
                  Order Total: ₹{order.totalAmount?.toFixed(2) || '0.00'}
                </p>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >
                    Track on carrier website →
                  </a>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600">
                  For any queries about your order, please contact our customer support.<br />
                  Email: urbandec.in@gmail.com<br />
                  Phone: +91 8105663269
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}