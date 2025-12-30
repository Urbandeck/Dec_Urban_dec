'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
          <p className="text-xl opacity-90">Please read these terms carefully before using our services</p>
          <p className="text-sm opacity-70 mt-2">Last updated: December 2024</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            Welcome to Urbandec ("we," "our," or "us"). These Terms and Conditions govern your use of our website
            located at urbandec.in and any related services provided by Urbandec.
          </p>
          <p className="text-gray-700 mb-4">
            By accessing or using our website and services, you agree to be bound by these Terms and Conditions.
            If you disagree with any part of these terms, you may not access our website or use our services.
          </p>
          <p className="text-gray-700">
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon
            posting on the website. Your continued use of the website after any changes indicates your acceptance
            of the modified terms.
          </p>
        </div>

        {/* Definitions */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Definitions</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>"Website"</strong> refers to urbandec.in and all its subdomains</li>
            <li><strong>"Products"</strong> refers to digital photo frames and related items sold through our website</li>
            <li><strong>"User"</strong> or <strong>"Customer"</strong> refers to any individual who accesses or uses our website</li>
            <li><strong>"Order"</strong> refers to a request to purchase products from our website</li>
            <li><strong>"Services"</strong> refers to all services provided by Urbandec, including but not limited to product sales, custom frame requests, and customer support</li>
          </ul>
        </div>

        {/* Account Registration */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Account Registration</h2>
          <p className="text-gray-700 mb-4">
            To access certain features of our website, you may need to create an account. When creating an account, you agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information to keep it accurate</li>
            <li>Keep your account credentials confidential</li>
            <li>Be responsible for all activities under your account</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>
          <p className="text-gray-700">
            We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
          </p>
        </div>

        {/* Products and Pricing */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Products and Pricing</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Product Information:</strong> We strive to provide accurate product descriptions, images, and
              specifications. However, we do not warrant that product descriptions or other content is accurate,
              complete, or error-free.
            </p>
            <p>
              <strong>Pricing:</strong> All prices are displayed in Indian Rupees (INR) and include applicable taxes
              unless otherwise stated. We reserve the right to change prices at any time without prior notice.
              Prices at the time of order placement will be honored.
            </p>
            <p>
              <strong>Availability:</strong> All products are subject to availability. We reserve the right to limit
              quantities or refuse orders at our discretion.
            </p>
            <p>
              <strong>Custom Products:</strong> Custom frame orders are subject to additional terms. Custom orders
              are non-refundable once production has begun.
            </p>
          </div>
        </div>

        {/* Orders and Payment */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Orders and Payment</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Order Acceptance:</strong> Your order constitutes an offer to purchase. We reserve the right to
              accept or decline any order. An order is confirmed only when you receive a confirmation email from us.
            </p>
            <p>
              <strong>Payment Methods:</strong> We accept payments through Razorpay, including credit cards, debit cards,
              UPI, net banking, and other supported payment methods. All payments must be made in full before order processing.
            </p>
            <p>
              <strong>Payment Security:</strong> All payment transactions are processed through secure, encrypted channels.
              We do not store your complete payment card information on our servers.
            </p>
            <p>
              <strong>Order Cancellation:</strong> You may request order cancellation within 2 hours of placing the order,
              provided the order has not been shipped. Cancellation requests can be made through your account or by
              contacting customer support.
            </p>
          </div>
        </div>

        {/* Shipping and Delivery */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Shipping and Delivery</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Delivery Areas:</strong> We currently ship to all serviceable pin codes across India. International
              shipping is available to select countries.
            </p>
            <p>
              <strong>Delivery Time:</strong> Estimated delivery times are provided at checkout. Standard delivery takes
              5-7 business days for most locations. Express delivery options are available for select areas.
            </p>
            <p>
              <strong>Shipping Charges:</strong> Shipping charges are calculated based on delivery location and order weight.
              Free shipping is available on orders above the specified minimum order value.
            </p>
            <p>
              <strong>Risk of Loss:</strong> Risk of loss and title for products pass to you upon delivery to the carrier.
            </p>
            <p>
              For complete shipping information, please visit our{' '}
              <Link href="/shipping" className="text-blue-600 hover:underline">Shipping Policy</Link> page.
            </p>
          </div>
        </div>

        {/* Returns and Refunds */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Returns and Refunds</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Return Period:</strong> We offer a 7-day return policy from the date of delivery. Products must be
              returned in their original condition with all packaging and accessories.
            </p>
            <p>
              <strong>Eligibility:</strong> To be eligible for a return, the product must be unused, undamaged, and in
              its original packaging. Products damaged due to misuse or negligence are not eligible for returns.
            </p>
            <p>
              <strong>Refund Process:</strong> Once we receive and inspect the returned product, refunds will be processed
              within 7-10 business days to the original payment method.
            </p>
            <p>
              <strong>Non-Returnable Items:</strong> Custom-made products, products with personalized images, and products
              marked as non-returnable are not eligible for returns.
            </p>
            <p>
              For complete details, please visit our{' '}
              <Link href="/returns" className="text-blue-600 hover:underline">Returns & Exchange Policy</Link> page.
            </p>
          </div>
        </div>

        {/* Warranty */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Warranty</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Manufacturer Warranty:</strong> All digital photo frames come with a 1-year manufacturer warranty
              covering defects in materials and workmanship under normal use.
            </p>
            <p>
              <strong>Warranty Coverage:</strong> The warranty covers hardware defects, display issues, and component
              failures that occur during normal use.
            </p>
            <p>
              <strong>Warranty Exclusions:</strong> The warranty does not cover damage caused by accidents, misuse,
              unauthorized modifications, power surges, or normal wear and tear.
            </p>
            <p>
              For warranty claims, please visit our{' '}
              <Link href="/warranty" className="text-blue-600 hover:underline">Warranty Information</Link> page.
            </p>
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Intellectual Property</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              All content on this website, including text, graphics, logos, images, and software, is the property of
              Urbandec or its content suppliers and is protected by Indian and international intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, or create derivative works from any content on this website
              without our express written permission.
            </p>
            <p>
              <strong>User Content:</strong> By uploading images or content to our website (for custom products), you grant
              us a non-exclusive license to use such content solely for fulfilling your order.
            </p>
          </div>
        </div>

        {/* User Conduct */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">10. User Conduct</h2>
          <p className="text-gray-700 mb-4">When using our website, you agree not to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Upload malicious software or harmful content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with the proper functioning of the website</li>
            <li>Use automated systems to access the website without permission</li>
            <li>Provide false or misleading information</li>
            <li>Engage in fraudulent activities</li>
          </ul>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">11. Limitation of Liability</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              To the fullest extent permitted by law, Urbandec shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use of our website or products.
            </p>
            <p>
              Our total liability for any claim arising from these terms or your use of our services shall not
              exceed the amount paid by you for the specific product or service giving rise to the claim.
            </p>
            <p>
              We do not warrant that our website will be uninterrupted, error-free, or free from viruses or other
              harmful components.
            </p>
          </div>
        </div>

        {/* Indemnification */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">12. Indemnification</h2>
          <p className="text-gray-700">
            You agree to indemnify, defend, and hold harmless Urbandec, its officers, directors, employees, and
            agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from
            your use of our website, violation of these terms, or infringement of any rights of third parties.
          </p>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">13. Privacy</h2>
          <p className="text-gray-700">
            Your privacy is important to us. Our collection and use of personal information is governed by our
            Privacy Policy, which is incorporated into these Terms and Conditions by reference. Please review our{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> to understand
            how we collect, use, and protect your information.
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">14. Governing Law and Jurisdiction</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India,
              without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising from these terms or your use of our website shall be subject to the exclusive
              jurisdiction of the courts in Pune, Maharashtra, India.
            </p>
          </div>
        </div>

        {/* Severability */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">15. Severability</h2>
          <p className="text-gray-700">
            If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining
            provisions shall continue in full force and effect. The invalid or unenforceable provision shall be
            modified to the minimum extent necessary to make it valid and enforceable.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">16. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 mb-2"><strong>Urbandec</strong></p>
            <p className="text-gray-700 mb-2">Xrbia Hinjewadi Township, Marunji, Pune, Maharashtra, 411057</p>
            <p className="text-gray-700 mb-2">Email: urbandec.in@gmail.com</p>
            <p className="text-gray-700">Phone: +91 8105663269</p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
          <p className="mb-6 opacity-90">
            Our team is here to help you understand our terms and policies
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/contact" className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold">
              Contact Us
            </Link>
            <Link href="/help" className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white/10 transition">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
