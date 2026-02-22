'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import HoverImageSwap from '@/components/HoverImageSwap';
import CustomProductCheckout from '@/components/CustomProductCheckout';
import CTAVideoSection from '@/components/CTAVideoSection';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useProductStore } from '@/store/products';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

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

export default function Home() {
  const { products, fetchProducts } = useProductStore();
  const featuredProducts = products.slice(0, 3);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-stone-50 overflow-x-hidden">
      {/* Hero Section with Starfield Background */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden">
        {/* Deep space background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#020617_50%,_#000000_100%)]" />

        {/* Nebula glows */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[40%] rounded-full bg-amber-500/15 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-[10%] left-[70%] w-[40%] h-[30%] rounded-full bg-blue-500/10 blur-[80px]"
        />
        <motion.div
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute bottom-[20%] left-[20%] w-[35%] h-[25%] rounded-full bg-purple-500/8 blur-[100px]"
        />

        {/* Twinkling stars across the full background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(80)].map((_, i) => {
            const size = i < 8 ? 'w-1.5 h-1.5' : i < 20 ? 'w-1 h-1' : 'w-[3px] h-[3px]';
            const brightness = i < 8 ? 'bg-white' : i < 20 ? 'bg-white/80' : 'bg-white/40';
            const top = ((i * 17 + 13) % 100);
            const left = ((i * 23 + 7) % 100);
            const delay = (i * 0.37) % 5;
            const duration = 2 + (i % 4);
            return (
              <motion.div
                key={i}
                className={`absolute ${size} ${brightness} rounded-full`}
                style={{ top: `${top}%`, left: `${left}%` }}
                animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
              />
            );
          })}

          {/* Brighter accent stars with glow */}
          {[
            { top: '12%', left: '80%', color: 'bg-amber-300' },
            { top: '45%', left: '90%', color: 'bg-amber-400' },
            { top: '25%', left: '55%', color: 'bg-blue-200' },
            { top: '70%', left: '75%', color: 'bg-amber-200' },
            { top: '8%', left: '35%', color: 'bg-white' },
            { top: '85%', left: '45%', color: 'bg-amber-300' },
            { top: '55%', left: '15%', color: 'bg-blue-100' },
          ].map((star, i) => (
            <motion.div
              key={`accent-${i}`}
              className={`absolute w-2 h-2 ${star.color} rounded-full`}
              style={{ top: star.top, left: star.left }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
                boxShadow: [
                  '0 0 4px 1px rgba(255,255,255,0.2)',
                  '0 0 14px 4px rgba(255,255,255,0.4)',
                  '0 0 4px 1px rgba(255,255,255,0.2)',
                ],
              }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
            />
          ))}

          {/* Shooting stars */}
          <motion.div
            className="absolute w-[2px] h-[2px] bg-white rounded-full"
            style={{ top: '15%', left: '0%' }}
            animate={{ top: ['15%', '45%'], left: ['5%', '70%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 8, ease: 'easeIn', delay: 3 }}
          >
            <div className="absolute top-0 right-0 w-20 h-[1px] bg-gradient-to-l from-transparent to-white/60 -rotate-[25deg] origin-right" />
          </motion.div>
          <motion.div
            className="absolute w-[2px] h-[2px] bg-amber-200 rounded-full"
            style={{ top: '8%', left: '60%' }}
            animate={{ top: ['8%', '35%'], left: ['60%', '95%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 12, ease: 'easeIn', delay: 7 }}
          >
            <div className="absolute top-0 right-0 w-14 h-[1px] bg-gradient-to-l from-transparent to-amber-200/60 -rotate-[38deg] origin-right" />
          </motion.div>
        </div>

        {/* Hero content - centered over starfield */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10">
          <div className="container mx-auto px-4 pt-16 md:pt-20">
            <div className="flex items-center justify-center min-h-[85vh] lg:min-h-[90vh]">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center max-w-3xl mx-auto"
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-500/20 text-amber-400 text-xs sm:text-sm font-medium mb-4 md:mb-6 border border-amber-500/30"
                >
                  Premium Handcrafted Frames
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight"
                >
                  Frame Your
                  <span className="block text-amber-500">Precious Moments</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-base md:text-xl text-slate-300 mb-8 md:mb-10 max-w-xl mx-auto"
                >
                  Transform your cherished memories into stunning displays with our premium digital photo frames.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex flex-wrap gap-3 sm:gap-4 justify-center"
                >
                  <Link
                    href="/products"
                    className="group inline-flex items-center gap-2 bg-amber-500 text-slate-900 px-5 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base hover:bg-amber-400 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
                  >
                    Shop Collection
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 bg-transparent text-white px-5 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base border border-slate-600 hover:border-slate-400 transition-all duration-300"
                  >
                    Learn More
                  </Link>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="flex items-center justify-center gap-8 sm:gap-12 mt-10 md:mt-14 pt-6 md:pt-8 border-t border-slate-700/50"
                >
                  {[
                    { value: '100+', label: 'Happy Customers' },
                    { value: '4.9', label: 'Rating' },
                    { value: 'Free', label: 'Shipping' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-amber-500">{stat.value}</div>
                      <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator - hidden on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="hidden md:block absolute bottom-24 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-slate-400"
          >
            <span className="text-sm">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Wave divider - Hero to Features */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  ),
                  title: 'Free Shipping',
                  description: 'Complimentary delivery on all orders across India',
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: 'Quality Guaranteed',
                  description: 'Premium walnut wood and expert craftsmanship',
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ),
                  title: 'Made with Love',
                  description: 'Each frame is carefully handcrafted for you',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="flex items-start gap-5 p-6 rounded-2xl bg-stone-50 border border-stone-100 hover:border-amber-200 transition-colors"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-amber-500">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg mb-1">{feature.title}</h3>
                    <p className="text-slate-500">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <motion.span
              variants={fadeInUp}
              className="inline-block px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4"
            >
              Our Collection
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Featured Products
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-500 max-w-xl mx-auto text-lg">
              Handpicked selection of our finest digital frames
            </motion.p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div key={product.id} variants={scaleIn}>
                  <Link href={`/products/${product.slug}`} className="group block h-full">
                    <motion.div
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl sm:rounded-2xl h-full overflow-hidden border border-stone-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="aspect-square relative bg-stone-100 overflow-hidden">
                        <HoverImageSwap
                          images={product.images || []}
                          productName={product.name}
                          priority={index === 0}
                        />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-amber-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold">
                            BESTSELLER
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4 md:p-6">
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base md:text-lg mb-1 sm:mb-2 group-hover:text-amber-600 transition-colors truncate">
                          {product.name}
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm mb-2 sm:mb-4 hidden sm:block" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] sm:text-xs text-slate-400 block">Starting at</span>
                            <span className="text-base sm:text-xl md:text-2xl font-bold text-slate-800">{formatPrice(product.basePrice)}</span>
                          </div>
                          {product.rating > 0 && (
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <svg className="w-3 h-3 sm:w-5 sm:h-5 text-amber-500 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-medium text-slate-600 text-xs sm:text-base">{product.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}

              {/* Custom Product Card */}
              <motion.div variants={scaleIn}>
                <CustomProductCheckout />
              </motion.div>
            </div>
          </AnimatedSection>

          <AnimatedSection className="text-center mt-12">
            <motion.div variants={fadeInUp}>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-slate-800 text-white px-8 py-4 rounded-full font-semibold hover:bg-slate-700 transition-all duration-300"
              >
                View All Products
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pt-32 pb-24 bg-slate-800 relative overflow-hidden">
        {/* Wave divider - Top (from stone-50) */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 0L60 15C120 30 240 60 360 67.5C480 75 600 60 720 52.5C840 45 960 45 1080 52.5C1200 60 1320 75 1380 82.5L1440 90V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0Z" fill="#fafaf9"/>
          </svg>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by Thousands
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-300 max-w-xl mx-auto">
              Join our community of happy customers who've transformed their spaces
            </motion.p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {[
                { value: '100+', label: 'Happy Customers' },
                { value: '50+', label: 'Frame Designs' },
                { value: '4.9/5', label: 'Customer Rating' },
                { value: '24/7', label: 'Support' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-slate-700/50 border border-slate-600"
                >
                  <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-amber-500 mb-1 sm:mb-2">{stat.value}</div>
                  <div className="text-slate-300 text-xs sm:text-sm md:text-base">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section with Video */}
      <CTAVideoSection />

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <motion.span
              variants={fadeInUp}
              className="inline-block px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4"
            >
              Testimonials
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-slate-800">
              Customer Love
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: 'Priya Sharma',
                  location: 'Mumbai',
                  text: 'The quality exceeded my expectations. The walnut finish is gorgeous and it perfectly displays our wedding photos.',
                },
                {
                  name: 'Rahul Verma',
                  location: 'Delhi',
                  text: 'Ordered a custom frame for my parents. They absolutely loved it! The attention to detail is remarkable.',
                },
                {
                  name: 'Anjali Patel',
                  location: 'Bangalore',
                  text: 'Fast shipping and excellent packaging. The frame looks even better in person. Highly recommended!',
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  className="bg-stone-50 p-8 rounded-2xl border border-stone-100"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-amber-500 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.location}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <motion.div
              variants={scaleIn}
              className="max-w-4xl mx-auto text-center bg-slate-800 rounded-3xl p-12 md:p-16 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Frame Your Memories?
                </h2>
                <p className="text-slate-300 mb-8 text-lg">
                  Start your journey with Urbandec today
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-amber-500 text-slate-900 px-8 py-4 rounded-full font-semibold hover:bg-amber-400 transition-all duration-300"
                >
                  Start Shopping
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
