'use client';

import Link from 'next/link';
import { Truck, Clock, Package, MapPin, Globe, CheckCircle, Info } from 'lucide-react';

export default function ShippingPage() {
  const shippingZones = [
    {
      zone: 'Metro Cities',
      cities: 'Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune',
      standardDelivery: '2-3 business days',
      expressDelivery: 'Next day delivery',
      freeShippingMin: 999
    },
    {
      zone: 'Tier 1 Cities',
      cities: 'Ahmedabad, Surat, Jaipur, Lucknow, Kanpur, Nagpur, Indore, Thane',
      standardDelivery: '3-5 business days',
      expressDelivery: '2-3 business days',
      freeShippingMin: 1499
    },
    {
      zone: 'Tier 2 & 3 Cities',
      cities: 'Other major cities and towns',
      standardDelivery: '5-7 business days',
      expressDelivery: '3-4 business days',
      freeShippingMin: 1999
    },
    {
      zone: 'Remote Areas',
      cities: 'Northeast states, J&K, Ladakh, Island territories',
      standardDelivery: '7-10 business days',
      expressDelivery: '5-7 business days',
      freeShippingMin: 2499
    }
  ];

  const shippingRates = [
    {
      weight: 'Up to 5 kg',
      metro: 99,
      tier1: 149,
      tier23: 199,
      remote: 299
    },
    {
      weight: '5-10 kg',
      metro: 149,
      tier1: 199,
      tier23: 249,
      remote: 399
    },
    {
      weight: '10-15 kg',
      metro: 199,
      tier1: 249,
      tier23: 299,
      remote: 499
    },
    {
      weight: 'Above 15 kg',
      metro: 249,
      tier1: 299,
      tier23: 349,
      remote: 599
    }
  ];

  const trackingSteps = [
    {
      status: 'Order Placed',
      description: 'Your order has been received and confirmed',
      icon: '📝'
    },
    {
      status: 'Processing',
      description: 'We are preparing your order for shipment',
      icon: '📦'
    },
    {
      status: 'Shipped',
      description: 'Your order has been handed over to courier',
      icon: '🚚'
    },
    {
      status: 'In Transit',
      description: 'Package is on the way to your location',
      icon: '🚛'
    },
    {
      status: 'Out for Delivery',
      description: 'Your package is with delivery agent',
      icon: '📍'
    },
    {
      status: 'Delivered',
      description: 'Package successfully delivered',
      icon: '✅'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
          <p className="text-xl opacity-90">Fast, reliable delivery across India</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Shipping Features */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Why Choose Our Shipping</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Truck className="text-teal-600" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600 text-sm">On orders above ₹999 for metro cities</p>
            </div>
            
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="text-emerald-600" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Express Delivery</h3>
              <p className="text-gray-600 text-sm">Next day delivery available in select cities</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Package className="text-purple-600" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Secure Packaging</h3>
              <p className="text-gray-600 text-sm">Extra protection for fragile electronics</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-green-600" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Live Tracking</h3>
              <p className="text-gray-600 text-sm">Track your order in real-time</p>
            </div>
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Delivery Zones & Timeframes</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Zone</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Coverage</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Standard</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Express</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Free Shipping</th>
                </tr>
              </thead>
              <tbody>
                {shippingZones.map((zone) => (
                  <tr key={zone.zone} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 font-medium">{zone.zone}</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">{zone.cities}</td>
                    <td className="border border-gray-200 px-4 py-3">{zone.standardDelivery}</td>
                    <td className="border border-gray-200 px-4 py-3">{zone.expressDelivery}</td>
                    <td className="border border-gray-200 px-4 py-3">Above ₹{zone.freeShippingMin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-emerald-50 border-l-4 border-emerald-500 p-4">
            <p className="text-emerald-800">
              <strong>Note:</strong> Delivery times are estimates and may vary during peak seasons, 
              festivals, or due to unforeseen circumstances.
            </p>
          </div>
        </div>

        {/* Shipping Rates */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Shipping Rates by Weight</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Weight</th>
                  <th className="border border-gray-200 px-4 py-3 text-center font-semibold">Metro</th>
                  <th className="border border-gray-200 px-4 py-3 text-center font-semibold">Tier 1</th>
                  <th className="border border-gray-200 px-4 py-3 text-center font-semibold">Tier 2&3</th>
                  <th className="border border-gray-200 px-4 py-3 text-center font-semibold">Remote</th>
                </tr>
              </thead>
              <tbody>
                {shippingRates.map((rate) => (
                  <tr key={rate.weight} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 font-medium">{rate.weight}</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">₹{rate.metro}</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">₹{rate.tier1}</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">₹{rate.tier23}</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">₹{rate.remote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">Express delivery charges: Standard rate + 50%</p>
            <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
              Calculate Shipping Cost
            </button>
          </div>
        </div>

        {/* Order Tracking */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Track Your Order</h2>
          
          <div className="mb-8">
            <p className="text-gray-700 mb-4">
              Stay updated with real-time tracking of your order from warehouse to doorstep.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <input
                type="text"
                placeholder="Enter your order ID or tracking number"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                Track Order
              </button>
            </div>
          </div>

          <h3 className="font-semibold text-lg mb-4">Order Journey</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackingSteps.map((step, index) => (
              <div key={step.status} className="flex items-start">
                <span className="text-2xl mr-3">{step.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-800">{step.status}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* International Shipping */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <Globe className="text-emerald-600 mr-3" size={32} />
            <h2 className="text-2xl font-bold">International Shipping</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-3">Available Countries</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={18} />
                  <span className="text-gray-700">United States</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={18} />
                  <span className="text-gray-700">United Kingdom</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={18} />
                  <span className="text-gray-700">Canada</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={18} />
                  <span className="text-gray-700">Australia</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={18} />
                  <span className="text-gray-700">Singapore</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={18} />
                  <span className="text-gray-700">UAE</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-3">Important Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  Delivery time: 10-15 business days
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  Shipping charges calculated at checkout
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  Import duties and taxes may apply
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  Tracking available throughout journey
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  Insurance included for all shipments
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Shipping Partners */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Our Trusted Shipping Partners</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-2">
                <span className="text-2xl font-bold text-gray-700">DTDC</span>
              </div>
              <p className="text-sm text-gray-600">Pan India</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-2">
                <span className="text-2xl font-bold text-gray-700">BlueDart</span>
              </div>
              <p className="text-sm text-gray-600">Express</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-2">
                <span className="text-2xl font-bold text-gray-700">Delhivery</span>
              </div>
              <p className="text-sm text-gray-600">E-commerce</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-2">
                <span className="text-2xl font-bold text-gray-700">FedEx</span>
              </div>
              <p className="text-sm text-gray-600">International</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-800 hover:text-teal-600">
                Do you provide same-day delivery?
              </summary>
              <p className="mt-2 text-gray-600">
                Same-day delivery is available for select pin codes in Mumbai, Delhi, and Bangalore for orders 
                placed before 12 PM. Additional charges apply.
              </p>
            </details>

            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-800 hover:text-teal-600">
                Can I change my delivery address after placing the order?
              </summary>
              <p className="mt-2 text-gray-600">
                You can change the delivery address within 2 hours of placing the order. After that, address 
                changes are subject to availability and may incur additional charges.
              </p>
            </details>

            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-800 hover:text-teal-600">
                What if I'm not available during delivery?
              </summary>
              <p className="mt-2 text-gray-600">
                Our delivery partners will attempt delivery twice. You can also reschedule delivery through 
                the tracking link. After two failed attempts, the order will be returned to our warehouse.
              </p>
            </details>

            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-800 hover:text-teal-600">
                Do you deliver to PO Box addresses?
              </summary>
              <p className="mt-2 text-gray-600">
                Currently, we do not deliver to PO Box addresses. Please provide a complete street address 
                for successful delivery.
              </p>
            </details>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg p-8 text-center">
          <Truck className="mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-4">Need Help with Shipping?</h2>
          <p className="mb-6 opacity-90">
            Our customer support team is available to assist with all shipping queries
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/contact" className="px-6 py-3 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition font-semibold">
              Contact Support
            </Link>
            <Link href="/help" className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white/10 transition">
              Visit Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}