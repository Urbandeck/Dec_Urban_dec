'use client';

import Link from 'next/link';
import { Shield, Lock, Eye, Database, Globe, UserCheck, AlertCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      icon: <Database className="text-blue-600" size={24} />,
      content: [
        {
          subtitle: 'Personal Information',
          items: [
            'Name, email address, and phone number',
            'Shipping and billing addresses',
            'Payment information (securely processed by Razorpay)',
            'Order history and preferences',
            'Account credentials'
          ]
        },
        {
          subtitle: 'Automatically Collected Information',
          items: [
            'IP address and device information',
            'Browser type and operating system',
            'Browsing behavior and page interactions',
            'Cookies and similar tracking technologies',
            'Location data (with your permission)'
          ]
        }
      ]
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      icon: <Eye className="text-green-600" size={24} />,
      content: [
        {
          subtitle: 'Service Delivery',
          items: [
            'Process and fulfill your orders',
            'Send order confirmations and shipping updates',
            'Provide customer support',
            'Manage your account and preferences',
            'Process payments and refunds'
          ]
        },
        {
          subtitle: 'Improvements and Marketing',
          items: [
            'Personalize your shopping experience',
            'Send promotional emails (with your consent)',
            'Improve our website and services',
            'Analyze usage patterns and trends',
            'Prevent fraud and enhance security'
          ]
        }
      ]
    },
    {
      id: 'data-sharing',
      title: 'Information Sharing',
      icon: <Globe className="text-purple-600" size={24} />,
      content: [
        {
          subtitle: 'We may share your information with:',
          items: [
            'Shipping partners to deliver your orders',
            'Payment processors (Razorpay) for secure transactions',
            'Service providers who assist in our operations',
            'Law enforcement when legally required',
            'Business partners with your explicit consent'
          ]
        },
        {
          subtitle: 'We never:',
          items: [
            'Sell your personal information to third parties',
            'Share your data for unrelated marketing purposes',
            'Transfer data without adequate protection',
            'Use your information beyond stated purposes'
          ]
        }
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: <Lock className="text-red-600" size={24} />,
      content: [
        {
          subtitle: 'Security Measures',
          items: [
            'SSL/TLS encryption for data transmission',
            'Secure storage with encryption at rest',
            'Regular security audits and updates',
            'Limited access to personal information',
            'PCI DSS compliance for payment processing'
          ]
        },
        {
          subtitle: 'Your Responsibilities',
          items: [
            'Keep your account credentials confidential',
            'Use strong, unique passwords',
            'Report any suspicious account activity',
            'Keep your contact information updated'
          ]
        }
      ]
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      icon: <UserCheck className="text-orange-600" size={24} />,
      content: [
        {
          subtitle: 'You have the right to:',
          items: [
            'Access your personal information',
            'Correct inaccurate data',
            'Request deletion of your data',
            'Opt-out of marketing communications',
            'Download your data in a portable format',
            'Withdraw consent at any time'
          ]
        }
      ]
    }
  ];

  const lastUpdated = 'January 5, 2025';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl opacity-90">Your privacy is important to us</p>
          <p className="mt-4 text-sm opacity-75">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center mb-6">
            <Shield className="text-indigo-600 mr-3" size={32} />
            <h2 className="text-2xl font-bold">Our Commitment to Privacy</h2>
          </div>
          
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              At UrbanDeck, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our 
              website or make a purchase from our digital frames shop.
            </p>
            <p className="mb-4">
              By using our services, you agree to the collection and use of information in accordance with this policy. 
              We encourage you to read this policy carefully to understand our practices regarding your personal data.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
              <p className="text-blue-800">
                <strong>Quick Summary:</strong> We collect only necessary information to provide our services, 
                never sell your data, use industry-standard security, and respect your privacy choices.
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">Table of Contents</h3>
          <div className="grid md:grid-cols-2 gap-2">
            {sections.map((section) => (
              <a 
                key={section.id}
                href={`#${section.id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                → {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Policy Sections */}
        {sections.map((section) => (
          <div key={section.id} id={section.id} className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center mb-6">
              {section.icon}
              <h2 className="text-2xl font-bold ml-3">{section.title}</h2>
            </div>
            
            {section.content.map((subsection, index) => (
              <div key={index} className="mb-6">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">{subsection.subtitle}</h3>
                <ul className="space-y-2">
                  {subsection.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}

        {/* Cookies Policy */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Cookie Policy</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              We use cookies and similar tracking technologies to improve your browsing experience on our website. 
              Cookies are small data files stored on your device that help us:
            </p>
            
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span className="text-gray-700">Remember your preferences and settings</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span className="text-gray-700">Keep you signed in to your account</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span className="text-gray-700">Understand how you use our website</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span className="text-gray-700">Show relevant advertisements</span>
              </li>
            </ul>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
              <div className="flex items-start">
                <AlertCircle className="text-yellow-600 mt-1 mr-2" size={20} />
                <p className="text-gray-700">
                  You can control cookies through your browser settings. However, disabling cookies may affect 
                  the functionality of our website and your user experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Children's Privacy */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Children's Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our services are not directed to individuals under the age of 18. We do not knowingly collect 
            personal information from children under 18. If we become aware that we have collected personal 
            information from a child under 18, we will take steps to delete such information.
          </p>
          <p className="text-gray-700">
            If you are a parent or guardian and believe your child has provided us with personal information, 
            please contact us immediately at support@urbandeck.shop.
          </p>
        </div>

        {/* International Transfers */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">International Data Transfers</h2>
          <p className="text-gray-700 mb-4">
            Your information may be transferred to and maintained on servers located outside of your state, 
            province, country, or other governmental jurisdiction where data protection laws may differ from 
            those in your jurisdiction.
          </p>
          <p className="text-gray-700">
            We take appropriate measures to ensure that your personal information receives an adequate level 
            of protection in the jurisdictions in which we process it.
          </p>
        </div>

        {/* Updates to Policy */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update our Privacy Policy from time to time to reflect changes in our practices or for 
            legal, operational, or regulatory reasons. We will notify you of any material changes by:
          </p>
          <ul className="space-y-2 ml-4 mb-4">
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              <span className="text-gray-700">Posting the new Privacy Policy on this page</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              <span className="text-gray-700">Updating the "Last updated" date at the top</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              <span className="text-gray-700">Sending you an email notification (for significant changes)</span>
            </li>
          </ul>
          <p className="text-gray-700">
            We encourage you to review this Privacy Policy periodically to stay informed about how we are 
            protecting your information.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Contact Us About Privacy</h2>
          <p className="mb-6 opacity-90">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
            please don't hesitate to contact us.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold mb-2">Email</h3>
              <a href="mailto:privacy@urbandeck.shop" className="underline">privacy@urbandeck.shop</a>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Phone</h3>
              <a href="tel:+919876543210" className="underline">+91 98765 43210</a>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Address</h3>
              <p className="text-sm">
                UrbanDeck Digital Frames<br />
                Mumbai, Maharashtra<br />
                India - 400001
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Related Policies:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            <Link href="/returns" className="text-blue-600 hover:underline">Return Policy</Link>
            <Link href="/warranty" className="text-blue-600 hover:underline">Warranty Policy</Link>
            <Link href="/help" className="text-blue-600 hover:underline">Help Center</Link>
            <Link href="/contact" className="text-blue-600 hover:underline">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}