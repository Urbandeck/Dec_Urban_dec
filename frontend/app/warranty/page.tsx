'use client';

import Link from 'next/link';
import { Shield, CheckCircle, XCircle, AlertCircle, Calendar, FileText, Award } from 'lucide-react';

export default function WarrantyPage() {
  const warrantyFeatures = [
    {
      icon: '🛡️',
      title: '2-Year Coverage',
      description: 'All UrbanDeck frames come with 24 months of manufacturer warranty'
    },
    {
      icon: '🔧',
      title: 'Free Repairs',
      description: 'No cost repairs for manufacturing defects during warranty period'
    },
    {
      icon: '🚚',
      title: 'Free Shipping',
      description: 'We cover shipping costs for warranty claims both ways'
    },
    {
      icon: '💯',
      title: 'Genuine Parts',
      description: 'Only original manufacturer parts used in all repairs'
    },
    {
      icon: '⚡',
      title: 'Quick Service',
      description: 'Most warranty repairs completed within 7-10 business days'
    },
    {
      icon: '📞',
      title: '24/7 Support',
      description: 'Round-the-clock customer support for warranty queries'
    }
  ];

  const extendedWarrantyPlans = [
    {
      duration: '1 Year Extension',
      originalPrice: 2999,
      discountedPrice: 1999,
      features: [
        'Extends warranty to 3 years total',
        'All standard warranty benefits',
        'Priority repair service',
        'One free screen replacement'
      ]
    },
    {
      duration: '2 Year Extension',
      originalPrice: 4999,
      discountedPrice: 3499,
      features: [
        'Extends warranty to 4 years total',
        'All standard warranty benefits',
        'Express 48-hour repair',
        'Two free screen replacements',
        'Accidental damage coverage'
      ],
      popular: true
    },
    {
      duration: '3 Year Extension',
      originalPrice: 6999,
      discountedPrice: 4999,
      features: [
        'Extends warranty to 5 years total',
        'All premium warranty benefits',
        'Same-day repair service',
        'Unlimited screen replacements',
        'Full accidental damage coverage',
        'Free annual maintenance'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Warranty Information</h1>
          <p className="text-xl opacity-90">Complete protection for your digital frames</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Warranty Overview */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <Shield className="text-green-600 mr-3" size={32} />
            <h2 className="text-2xl font-bold">Standard Manufacturer Warranty</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {warrantyFeatures.map((feature) => (
              <div key={feature.title} className="flex items-start">
                <span className="text-2xl mr-3">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 flex items-start">
              <CheckCircle className="mr-2 mt-0.5" size={18} />
              Your warranty period starts from the date of delivery and covers all manufacturing defects, 
              component failures, and software issues not caused by user damage.
            </p>
          </div>
        </div>

        {/* What's Covered */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center text-green-600">
              <CheckCircle className="mr-2" size={24} />
              What's Covered
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                <div>
                  <strong className="text-gray-800">Display Issues</strong>
                  <p className="text-gray-600 text-sm">Dead pixels, backlight problems, color distortion</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                <div>
                  <strong className="text-gray-800">Hardware Defects</strong>
                  <p className="text-gray-600 text-sm">Power supply, circuit board, connectivity issues</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                <div>
                  <strong className="text-gray-800">Software Problems</strong>
                  <p className="text-gray-600 text-sm">Firmware bugs, update failures, app crashes</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                <div>
                  <strong className="text-gray-800">Frame Components</strong>
                  <p className="text-gray-600 text-sm">Buttons, ports, speakers, mounting hardware</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                <div>
                  <strong className="text-gray-800">Battery Issues</strong>
                  <p className="text-gray-600 text-sm">Battery degradation, charging problems (if applicable)</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center text-red-600">
              <XCircle className="mr-2" size={24} />
              What's Not Covered
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">✗</span>
                <div>
                  <strong className="text-gray-800">Physical Damage</strong>
                  <p className="text-gray-600 text-sm">Drops, impacts, screen cracks, water damage</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">✗</span>
                <div>
                  <strong className="text-gray-800">Misuse or Neglect</strong>
                  <p className="text-gray-600 text-sm">Improper installation, voltage surges, modifications</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">✗</span>
                <div>
                  <strong className="text-gray-800">Normal Wear & Tear</strong>
                  <p className="text-gray-600 text-sm">Cosmetic damage, minor scratches, color fading</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">✗</span>
                <div>
                  <strong className="text-gray-800">Unauthorized Repairs</strong>
                  <p className="text-gray-600 text-sm">Damage from third-party repair attempts</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">✗</span>
                <div>
                  <strong className="text-gray-800">Lost Accessories</strong>
                  <p className="text-gray-600 text-sm">Lost remotes, cables, or mounting brackets</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* How to Claim Warranty */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">How to Claim Warranty</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Register Claim</h3>
              <p className="text-gray-600 text-sm">Log in to your account and submit warranty claim with issue details</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Verification</h3>
              <p className="text-gray-600 text-sm">Our team verifies your purchase and warranty eligibility</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Pickup Scheduled</h3>
              <p className="text-gray-600 text-sm">Free doorstep pickup arranged at your convenient time</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Repair & Return</h3>
              <p className="text-gray-600 text-sm">Device repaired and delivered back within 7-10 days</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/account" className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              <FileText className="mr-2" size={18} />
              File Warranty Claim
            </Link>
          </div>
        </div>

        {/* Extended Warranty */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Extended Warranty Plans</h2>
            <p className="text-gray-600">Get additional coverage beyond standard warranty</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {extendedWarrantyPlans.map((plan) => (
              <div 
                key={plan.duration}
                className={`border rounded-lg p-6 relative ${
                  plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-lg font-bold mb-2">{plan.duration}</h3>
                <div className="mb-4">
                  <span className="text-gray-400 line-through text-sm">₹{plan.originalPrice}</span>
                  <span className="text-3xl font-bold ml-2">₹{plan.discountedPrice}</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-sm">
                      <CheckCircle className="text-green-500 mr-2 mt-0.5" size={16} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-2 rounded-lg transition ${
                  plan.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  Select Plan
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 mt-1 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-lg mb-2">Important Warranty Information</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Keep your original invoice/receipt safe - it's required for warranty claims</li>
                <li>• Register your product within 15 days of purchase for hassle-free claims</li>
                <li>• Warranty is non-transferable and valid only for the original purchaser</li>
                <li>• International purchases may have different warranty terms</li>
                <li>• Extended warranty must be purchased within 30 days of product delivery</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Warranty Registration */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 text-center">
          <Award className="mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Register Your Product</h2>
          <p className="mb-6 opacity-90">Register now to activate your warranty and get exclusive benefits</p>
          <div className="flex justify-center gap-4">
            <Link href="/account" className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold">
              Register Product
            </Link>
            <Link href="/help" className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white/10 transition">
              Learn More
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Have Questions About Warranty?</h3>
          <p className="text-gray-600 mb-6">Our support team is here to help you understand your coverage</p>
          <div className="flex justify-center gap-4">
            <Link href="/contact" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Contact Support
            </Link>
            <a href="tel:+919876543210" className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition">
              Call: +91 98765 43210
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}