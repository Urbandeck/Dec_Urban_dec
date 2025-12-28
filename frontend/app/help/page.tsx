'use client';

import Link from 'next/link';
import { ChevronRight, Search, Phone, Mail, MessageCircle, Clock } from 'lucide-react';

export default function HelpCenterPage() {
  const helpCategories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      topics: [
        'How to choose the right digital frame',
        'Setting up your new frame',
        'Connecting to Wi-Fi',
        'Uploading photos and videos'
      ]
    },
    {
      title: 'Orders & Shipping',
      icon: '📦',
      topics: [
        'Track your order',
        'Shipping policies',
        'Delivery timeframes',
        'International shipping'
      ]
    },
    {
      title: 'Account & Billing',
      icon: '💳',
      topics: [
        'Creating an account',
        'Managing your profile',
        'Payment methods',
        'Invoice and receipts'
      ]
    },
    {
      title: 'Product Support',
      icon: '🛠️',
      topics: [
        'Troubleshooting common issues',
        'Software updates',
        'Frame specifications',
        'Warranty information'
      ]
    },
    {
      title: 'Returns & Refunds',
      icon: '↩️',
      topics: [
        'Return policy',
        'How to initiate a return',
        'Refund process',
        'Exchange products'
      ]
    },
    {
      title: 'Privacy & Security',
      icon: '🔒',
      topics: [
        'Data protection',
        'Secure payments',
        'Account security',
        'Privacy settings'
      ]
    }
  ];

  const popularQuestions = [
    {
      question: 'How do I connect my frame to Wi-Fi?',
      answer: 'Go to Settings > Network > Wi-Fi on your frame. Select your network and enter the password.'
    },
    {
      question: 'What photo formats are supported?',
      answer: 'Our frames support JPEG, PNG, GIF, and MP4 video formats up to 4K resolution.'
    },
    {
      question: 'Can I upload photos remotely?',
      answer: 'Yes! Use our mobile app to send photos from anywhere to your connected frame.'
    },
    {
      question: 'What is the warranty period?',
      answer: 'All Urbandec frames come with a 2-year manufacturer warranty covering defects.'
    },
    {
      question: 'How do I track my order?',
      answer: 'Visit the Orders page in your account or use the tracking link in your confirmation email.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl opacity-90">How can we help you today?</p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Browse Help Topics</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpCategories.map((category) => (
            <div key={category.title} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="text-lg font-semibold mb-3">{category.title}</h3>
              <ul className="space-y-2">
                {category.topics.map((topic) => (
                  <li key={topic}>
                    <Link href="#" className="text-gray-600 hover:text-blue-600 flex items-center text-sm">
                      <ChevronRight size={14} className="mr-1" />
                      {topic}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Popular Questions */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Popular Questions</h2>
          <div className="space-y-4">
            {popularQuestions.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Still Need Help?</h2>
          <p className="text-center text-gray-600 mb-8">Our customer support team is here to assist you</p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Phone className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm">+91 98765 43210</p>
              <p className="text-gray-500 text-xs mt-1">Mon-Sat, 9AM-6PM</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Mail className="text-green-600" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm">urbandec.in@gmail.com</p>
              <p className="text-gray-500 text-xs mt-1">24-48 hour response</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-purple-600" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm">Chat with our team</p>
              <p className="text-gray-500 text-xs mt-1">Available 24/7</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/returns" className="text-blue-600 hover:underline">Return Policy</Link>
            <Link href="/warranty" className="text-blue-600 hover:underline">Warranty Info</Link>
            <Link href="/shipping" className="text-blue-600 hover:underline">Shipping Info</Link>
            <Link href="/orders" className="text-blue-600 hover:underline">Track Order</Link>
            <Link href="/contact" className="text-blue-600 hover:underline">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}