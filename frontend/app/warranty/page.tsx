'use client';

import Link from 'next/link';
import { Shield, AlertCircle } from 'lucide-react';

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Warranty Information</h1>
          <p className="text-xl opacity-90">Product warranty policy</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Warranty Overview */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <Shield className="text-gray-600 mr-3" size={32} />
            <h2 className="text-2xl font-bold">Warranty Policy</h2>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-8">
            <div className="flex items-start mb-4">
              <AlertCircle className="text-gray-600 mt-1 mr-3 flex-shrink-0" size={28} />
              <div>
                <h3 className="font-bold text-xl mb-3 text-gray-800">No Warranty Provided</h3>
                <p className="text-gray-700 mb-4">
                  Urbandec does not provide any manufacturer warranty, extended warranty, or warranty coverage for
                  the digital photo frames sold through our website.
                </p>
                <p className="text-gray-700 mb-4">
                  All products are sold "as is" without any warranty of any kind, either express or implied, including
                  but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
                </p>
                <p className="text-gray-700">
                  We encourage customers to inspect products upon delivery and report any issues within the 7-day return
                  period as outlined in our{' '}
                  <Link href="/returns" className="text-blue-600 hover:underline font-semibold">
                    Returns & Exchange Policy
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Support */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Customer Support</h2>
          <p className="text-gray-700 mb-4">
            While we do not provide warranty services, our customer support team is available to assist you with:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span className="text-gray-700">Product questions and setup guidance</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span className="text-gray-700">Order status and shipping information</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span className="text-gray-700">Return and exchange requests within 7 days</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span className="text-gray-700">General troubleshooting advice</span>
            </li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-800">
              <strong>Important:</strong> Product defects or issues must be reported within 7 days of delivery to be
              eligible for return or exchange. After this period, no claims will be accepted.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Assistance?</h2>
          <p className="mb-6 opacity-90">
            Our customer support team is here to help with your questions
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/contact" className="px-6 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition font-semibold">
              Contact Support
            </Link>
            <Link href="/returns" className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white/10 transition">
              View Returns Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}