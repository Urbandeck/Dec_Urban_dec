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
          <p className="text-sm opacity-70 mt-2">Last updated: January 2025</p>
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
              UPI, net banking, and other supported payment methods. Cash on Delivery (COD) is also available for eligible orders.
              Additional charges may apply for COD orders. Prepaid orders are processed faster and may have priority in dispatch.
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
              <strong>Delivery Coverage:</strong> We currently ship across all serviceable locations within India only.
              Remote or non-serviceable pin codes may take longer or may not be deliverable. Serviceability is verified at checkout.
            </p>
            <p>
              <strong>Order Processing:</strong> Orders are processed and dispatched within 1–3 business days after order
              confirmation and payment verification.
            </p>
            <p>
              <strong>Delivery Time:</strong> Orders are usually delivered within 5–10 business days after dispatch, depending on
              the delivery location. Metro cities typically receive orders faster than remote areas.
            </p>
            <p>
              <strong>Shipping Charges:</strong> Shipping charges are calculated at checkout based on delivery location and package weight.
              Typically, shipping charges range between ₹150 and ₹300 depending on the destination and courier availability.
            </p>
            <p>
              <strong>Courier Partners:</strong> We ship orders using reliable courier partners such as Shiprocket and its associated
              logistics providers. The courier partner is automatically selected based on your location and fastest available route.
            </p>
            <p>
              <strong>Delivery Delays:</strong> Delivery timelines are estimates and may be affected by factors beyond our control
              such as weather conditions, holidays, courier delays, or other unforeseen circumstances.
            </p>
            <p>
              <strong>Failed Delivery (RTO):</strong> In case of unsuccessful delivery due to customer unavailability, incorrect address,
              or refusal to accept the package, the return shipping cost may be deducted from any applicable refund amount.
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
              returned in their original condition with all packaging, accessories, manuals, and packaging materials.
            </p>
            <p>
              <strong>Free Returns:</strong> We provide prepaid return shipping labels for eligible returns. Return shipping
              is free for manufacturing defects or wrong items received.
            </p>
            <p>
              <strong>Eligibility:</strong> To be eligible for a return, the product must be unused, unopened (where applicable),
              undamaged, and in its original packaging with all accessories included. Products damaged due to misuse or negligence
              are not eligible for returns.
            </p>
            <p>
              <strong>Refund Process:</strong> Once we receive and inspect the returned product at our warehouse (1-2 days),
              refunds will be initiated within 2-3 days and credited to your account within 5-7 business days depending on
              the payment method (Credit/Debit Card: 5-7 days, UPI: 2-3 days, Net Banking: 5-7 days).
            </p>
            <p>
              <strong>Non-Returnable Items:</strong> Customized or personalized products, used or damaged items by customer,
              items without original packaging, items past the 7-day return window, and items with missing accessories are not
              eligible for returns.
            </p>
            <p>
              <strong>Exchange Policy:</strong> Free exchanges are available for items that are defective or if you received
              the wrong product, subject to product availability. Exchanges must be initiated within 7 days of delivery.
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
              <strong>Standard Manufacturer Warranty:</strong> All Urbandec digital photo frames come with a 2-year (24 months)
              manufacturer warranty covering defects in materials and workmanship under normal use. The warranty period starts
              from the date of delivery.
            </p>
            <p>
              <strong>Warranty Coverage:</strong> The warranty covers manufacturing defects, hardware component failures,
              display issues (dead pixels, backlight problems, color distortion), software problems, power supply issues,
              connectivity issues, and defective buttons, ports, or speakers.
            </p>
            <p>
              <strong>Free Warranty Service:</strong> We provide free repairs for all warranty-covered issues, including
              free shipping both ways. Most warranty repairs are completed within 7-10 business days. Only genuine manufacturer
              parts are used in all repairs.
            </p>
            <p>
              <strong>Warranty Exclusions:</strong> The warranty does not cover physical damage (drops, impacts, screen cracks,
              water damage), misuse or neglect (improper installation, voltage surges, unauthorized modifications), normal wear
              and tear (cosmetic damage, minor scratches), unauthorized third-party repairs, or lost accessories.
            </p>
            <p>
              <strong>Extended Warranty:</strong> Extended warranty plans are available to extend coverage up to 5 years total,
              with additional benefits including accidental damage coverage and priority repair services.
            </p>
            <p>
              <strong>Warranty Registration:</strong> Register your product within 15 days of purchase for hassle-free warranty claims.
              Keep your original invoice/receipt safe as it is required for all warranty claims.
            </p>
            <p>
              For warranty claims and complete warranty information, please visit our{' '}
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
          <div className="flex justify-center">
            <Link href="/contact" className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
