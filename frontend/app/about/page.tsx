'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';

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

export default function AboutPage() {
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
              Our Story
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              About Urbandec
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-300 max-w-xl mx-auto"
            >
              Your premier destination for high-quality digital photo frames
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.p variants={fadeInUp} className="text-slate-600 text-lg mb-8 leading-relaxed">
              Welcome to Urbandec, your premier destination for high-quality digital photo frames.
              We believe that memories should be celebrated and displayed, not hidden away in digital devices.
            </motion.p>

            <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-stone-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed">
                Our mission is to bring your cherished memories to life through cutting-edge digital display technology.
                We carefully curate a collection of premium digital frames that combine aesthetic appeal with
                technological innovation, ensuring your photos are displayed in their best light.
              </p>
            </motion.div>

            <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-slate-800 mb-6">Why Choose Us?</motion.h2>
            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                {
                  title: 'Premium Quality',
                  description: 'We partner with leading manufacturers to bring you frames with superior display quality, ensuring your photos look stunning.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  title: 'Expert Support',
                  description: 'Our dedicated support team is here to help you choose the perfect frame and assist with any questions you may have.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                },
                {
                  title: 'Secure Shopping',
                  description: 'Shop with confidence knowing your transactions are protected by industry-leading security measures.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ),
                },
                {
                  title: 'Fast Delivery',
                  description: 'We ensure quick and safe delivery of your digital frames, so you can start displaying your memories sooner.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  ),
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-amber-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-amber-500 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-500">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-stone-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Commitment</h2>
              <p className="text-slate-600 leading-relaxed">
                We are committed to providing simple, reliable solutions for displaying your digital memories.
                Our USB-powered LED digital frames are designed for easy use—just plug in a USB drive and enjoy
                your photos instantly. With a clean, modern design and hassle-free setup, our frames offer a
                straightforward way to showcase your favorite moments.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-slate-800 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full filter blur-2xl" />
              <div className="relative">
                <p className="text-white text-lg italic mb-4">
                  "Every photo tells a story, and every frame should honor that story. That's our promise to you."
                </p>
                <p className="text-amber-400 font-medium">- The Urbandec Team</p>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
