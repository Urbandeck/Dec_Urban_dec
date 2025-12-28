'use client';

import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Returns & Exchange</h1>
          <p className="text-xl opacity-90">Easy returns within 7 days of purchase</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Return Policy Overview */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Our Return Policy</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="text-green-600" size={28} />
              </div>
              <h3 className="font-semibold mb-2">7-Day Returns</h3>
              <p className="text-gray-600 text-sm">Return any item within 7 days of delivery</p>
            </div>
            
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Package className="text-emerald-600" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Free Returns</h3>
              <p className="text-gray-600 text-sm">We provide prepaid return shipping labels</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-purple-600" size={28} />
              </div>
              <h3 className="font-semibold mb-2">Full Refund</h3>
              <p className="text-gray-600 text-sm">100% refund on eligible returns</p>
            </div>
          </div>

          <div className="border-l-4 border-emerald-500 pl-4 py-2 bg-emerald-50">
            <p className="text-gray-700">
              <strong>Note:</strong> Items must be returned in original condition with all accessories, manuals, and packaging materials.
            </p>
          </div>
        </div>

        {/* Eligible & Non-Eligible Items */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center text-green-600">
              <CheckCircle className="mr-2" size={24} />
              Eligible for Return
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Unopened items in original packaging</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Items with manufacturing defects</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Wrong or damaged items received</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Items within 7-day return window</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Items with all accessories included</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center text-red-600">
              <XCircle className="mr-2" size={24} />
              Not Eligible for Return
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                <span className="text-gray-700">Used or damaged items by customer</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                <span className="text-gray-700">Items without original packaging</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                <span className="text-gray-700">Customized or personalized products</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                <span className="text-gray-700">Items past 7-day return window</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                <span className="text-gray-700">Missing accessories</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Exchange Policy */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Exchange Policy</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              We offer free exchanges for items that are defective or if you received the wrong product. 
              Exchanges are subject to product availability.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <div className="flex items-start">
                <AlertCircle className="text-yellow-600 mt-1 mr-2" size={20} />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Important Exchange Information</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Exchanges must be initiated within 7 days of delivery</li>
                    <li>• Size or color exchanges are available for the same model only</li>
                    <li>• If the exchange item costs more, you'll need to pay the difference</li>
                    <li>• Exchange shipping is free for manufacturing defects</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refund Information */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Refund Process</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Refund Timeline</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Item received at warehouse</span>
                    <span className="font-semibold">Day 1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Quality inspection</span>
                    <span className="font-semibold">1-2 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Refund initiated</span>
                    <span className="font-semibold">2-3 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Amount credited to account</span>
                    <span className="font-semibold">5-7 days</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Refund Methods</h3>
              <p className="text-gray-700">
                Refunds will be processed to the original payment method used during purchase:
              </p>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Credit/Debit Card: 5-7 business days</li>
                <li>• UPI: 2-3 business days</li>
                <li>• Net Banking: 5-7 business days</li>
                <li>• Store Credit: Instant</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Need Help with Returns?</h3>
          <p className="text-gray-600 mb-6">Our customer support team is here to assist you</p>
          <div className="flex justify-center gap-4">
            <Link href="/contact" className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}