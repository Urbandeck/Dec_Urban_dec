'use client';

import { useState, useRef } from 'react';
import { ENV_CONFIG } from '@/lib/env-config';
import { motion, useInView } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const companyInfo = {
  email: 'urbandec.in@gmail.com',
  phone: '+91 8105663269',
  address: 'Xrbia Hinjewadi Township, Marunji',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '411057',
  businessHours: {
    'Monday - Friday': '10:00 AM - 5:00 PM IST'
  }
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus({ type: 'success', message: data.message || 'Your message has been sent successfully!' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus({ type: 'error', message: data.message || 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Failed to send message. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative bg-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium mb-4 border border-amber-500/30"
            >
              Get In Touch
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              Contact Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-300 max-w-xl mx-auto"
            >
              We're here to help! Reach out to us through any of the channels below
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl border border-stone-200 hover:border-amber-300 transition-colors">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Get in Touch</h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-slate-800">Email</h3>
                    <p className="text-slate-500">Support: <a href={`mailto:${companyInfo.email}`} className="text-amber-600 hover:text-amber-700 hover:underline">{companyInfo.email}</a></p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-slate-800">Phone</h3>
                    <p className="text-slate-500">{companyInfo.phone}</p>
                    <p className="text-sm text-slate-400">Mon-Fri 10:00 AM - 5:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-slate-800">Office Address</h3>
                    <p className="text-slate-500">
                      {companyInfo.address}<br />
                      {companyInfo.city}, {companyInfo.state}<br />
                      {companyInfo.pincode}, India
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl border border-stone-200 hover:border-amber-300 transition-colors">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Business Hours</h2>

              <div className="space-y-3">
                {Object.entries(companyInfo.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between py-3 border-b border-stone-100">
                    <span className="font-medium text-slate-700 capitalize">{day}</span>
                    <span className="text-slate-500">{hours}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="font-semibold text-slate-800 mb-2">Quick Response</h3>
                <p className="text-slate-600 text-sm">
                  We typically respond to all inquiries within 24 business hours
                </p>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl border border-stone-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Send us a Message</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
                  required
                ></textarea>
              </div>

              {submitStatus && (
                <div className={`p-4 rounded-xl ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {submitStatus.message}
                </div>
              )}

              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 py-3 bg-amber-500 text-white font-semibold rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </AnimatedSection>
      </div>
    </div>
  );
}
