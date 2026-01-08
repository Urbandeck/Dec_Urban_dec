import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartProvider from '@/components/CartProvider'
import AuthProvider from '@/components/AuthProvider'
import GoogleAuthProvider from '@/components/GoogleAuthProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://digitalframes.com'),
  title: {
    default: 'Digital Frames Shop - Premium Digital Photo Frames',
    template: '%s | Digital Frames Shop',
  },
  description: 'Shop premium digital photo frames in various sizes and styles. Free shipping, 2-year warranty, and easy returns. Transform your memories into stunning displays.',
  keywords: ['digital photo frames', 'smart frames', 'wifi photo frames', 'digital display', 'photo gallery'],
  authors: [{ name: 'Digital Frames Shop' }],
  creator: 'Digital Frames Shop',
  publisher: 'Digital Frames Shop',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Digital Frames Shop',
    title: 'Digital Frames Shop - Premium Digital Photo Frames',
    description: 'Shop premium digital photo frames in various sizes and styles.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Digital Frames Shop',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Frames Shop',
    description: 'Shop premium digital photo frames',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://urbandec.in'} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Urbandec',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://urbandec.in',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://urbandec.in'}/logo.png`,
              sameAs: [
                'https://facebook.com/urbandec.in',
                'https://twitter.com/urbandec_in',
                'https://instagram.com/urbandec.in',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-800-FRAMES',
                contactType: 'customer service',
                availableLanguage: 'English',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <GoogleAuthProvider>
          <AuthProvider>
            <CartProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#fff',
                    color: '#363636',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </CartProvider>
          </AuthProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  )
}
