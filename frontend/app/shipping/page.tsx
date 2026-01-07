'use client';

import Link from 'next/link';
import { Truck, Globe, CheckCircle } from 'lucide-react';

export default function ShippingPage() {

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
        {/* Shipping Policy Overview */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Shipping Policy</h2>

          <div className="space-y-6">
            {/* Shipping Cost Calculation */}
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">How Shipping Charges Are Calculated</h3>
              <p className="text-gray-700">
                Shipping charges are calculated at checkout based on delivery location and package weight.
                This ensures you only pay for the actual delivery cost to your area.
              </p>
            </div>

            {/* Estimated Charges */}
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Estimated Shipping Charges</h3>
              <p className="text-gray-700">
                Shipping charges typically range between <strong>₹150 and ₹300</strong> depending on the destination
                and courier availability. The exact amount will be displayed at checkout before you confirm your order.
              </p>
            </div>

            {/* Shipping Coverage */}
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Shipping Coverage</h3>
              <p className="text-gray-700 mb-2">
                We currently ship across all serviceable locations within India.
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Note:</strong> Remote or non-serviceable pin codes may take longer or may not be deliverable.
                Serviceability will be checked during checkout.
              </p>
            </div>

            {/* Order Processing Time */}
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Order Processing Time</h3>
              <p className="text-gray-700">
                Orders are processed and dispatched within <strong>1–3 business days</strong> after order confirmation
                and payment verification.
              </p>
            </div>

            {/* Delivery Timeline */}
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Delivery Timeline</h3>
              <p className="text-gray-700">
                Orders are usually delivered within <strong>5–10 business days</strong> after dispatch, depending on
                the delivery location. Metro cities typically receive orders faster than remote areas.
              </p>
            </div>

            {/* COD Charges */}
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Cash on Delivery (COD)</h3>
              <p className="text-gray-700">
                Additional charges may apply for Cash on Delivery (COD) orders. Prepaid orders are processed faster
                and may have priority in dispatch.
              </p>
            </div>

            {/* Delivery Delays Clause */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Important Notice</h3>
              <p className="text-gray-700">
                Delivery timelines are estimates and may be affected by factors beyond our control such as weather
                conditions, holidays, courier delays, or other unforeseen circumstances. We appreciate your
                understanding and patience.
              </p>
            </div>

            {/* RTO Policy */}
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Return to Origin (RTO) Policy</h3>
              <p className="text-gray-700">
                In case of unsuccessful delivery due to customer unavailability, incorrect address, or refusal to
                accept the package, the return shipping cost may be deducted from the refund amount. Please ensure
                you provide accurate delivery details and are available to receive the package.
              </p>
            </div>
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
            {trackingSteps.map((step) => (
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
            <Globe className="text-blue-600 mr-3" size={32} />
            <h2 className="text-2xl font-bold">International Shipping</h2>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700 mb-3">
              <strong>Currently, we only ship within India.</strong>
            </p>
            <p className="text-gray-600">
              We are working on expanding our services to international destinations. If you are interested in
              international shipping, please contact our support team, and we will notify you once the service
              becomes available.
            </p>
          </div>
        </div>

        {/* Shipping Partners */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Our Courier Partners</h2>

          <div className="bg-teal-50 border-l-4 border-teal-500 p-6">
            <p className="text-gray-700 mb-4">
              We ship orders using reliable courier partners such as <strong>Shiprocket</strong> and its associated
              logistics providers to ensure safe and timely delivery of your products.
            </p>
            <p className="text-gray-600 text-sm">
              The courier partner for your order will be automatically selected based on the delivery location,
              package weight, and fastest available route to ensure optimal delivery.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-800 hover:text-teal-600">
                How much will shipping cost for my order?
              </summary>
              <p className="mt-2 text-gray-600">
                Shipping charges are calculated at checkout based on your delivery location and package weight.
                Typically, shipping charges range between ₹150 and ₹300. The exact amount will be displayed
                before you confirm your order.
              </p>
            </details>

            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-800 hover:text-teal-600">
                How long will it take for my order to be delivered?
              </summary>
              <p className="mt-2 text-gray-600">
                Orders are processed within 1–3 business days and typically delivered within 5–10 business days
                after dispatch. Delivery time depends on your location, with metro cities receiving orders faster
                than remote areas.
              </p>
            </details>

            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-800 hover:text-teal-600">
                Do you offer Cash on Delivery (COD)?
              </summary>
              <p className="mt-2 text-gray-600">
                Yes, we offer COD for eligible orders. Please note that additional charges may apply for COD orders.
                Prepaid orders are processed faster and may have priority in dispatch.
              </p>
            </details>

            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-800 hover:text-teal-600">
                Can I change my delivery address after placing the order?
              </summary>
              <p className="mt-2 text-gray-600">
                You can change the delivery address within 2 hours of placing the order by contacting our support team.
                After that, address changes may not be possible once the order is dispatched.
              </p>
            </details>

            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-800 hover:text-teal-600">
                What if I'm not available during delivery?
              </summary>
              <p className="mt-2 text-gray-600">
                Our delivery partners will attempt delivery multiple times. You can also reschedule delivery through
                the tracking link. If delivery fails due to customer unavailability or refusal, the return shipping
                cost may be deducted from your refund amount.
              </p>
            </details>

            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-800 hover:text-teal-600">
                Do you ship to my area?
              </summary>
              <p className="mt-2 text-gray-600">
                We ship across all serviceable locations within India. Remote or non-serviceable pin codes may take
                longer or may not be deliverable. Serviceability will be verified during checkout.
              </p>
            </details>

            <details className="border-b pb-4">
              <summary className="cursor-pointer font-semibold text-gray-800 hover:text-teal-600">
                Which courier partner will deliver my order?
              </summary>
              <p className="mt-2 text-gray-600">
                We use Shiprocket and its associated logistics providers for deliveries. The courier partner is
                automatically selected based on your delivery location, package weight, and fastest available route.
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