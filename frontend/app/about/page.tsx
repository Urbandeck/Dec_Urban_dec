import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Urbandec - Your trusted source for premium digital photo frames.',
  openGraph: {
    title: 'About Urbandec',
    description: 'Learn about our mission to bring memories to life through premium digital frames',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About Urbandec</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              Welcome to Urbandec, your premier destination for high-quality digital photo frames. 
              We believe that memories should be celebrated and displayed, not hidden away in digital devices.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              Our mission is to bring your cherished memories to life through cutting-edge digital display technology. 
              We carefully curate a collection of premium digital frames that combine aesthetic appeal with 
              technological innovation, ensuring your photos are displayed in their best light.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-700">
                  We partner with leading manufacturers to bring you frames with superior display quality, 
                  ensuring your photos look stunning.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Support</h3>
                <p className="text-gray-700">
                  Our dedicated support team is here to help you choose the perfect frame and assist 
                  with any questions you may have.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Shopping</h3>
                <p className="text-gray-700">
                  Shop with confidence knowing your transactions are protected by industry-leading 
                  security measures.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-700">
                  We ensure quick and safe delivery of your digital frames, so you can start 
                  displaying your memories sooner.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Commitment</h2>
            <p className="text-gray-700 mb-6">
              We are committed to providing simple, reliable solutions for displaying your digital memories.
              Our USB-powered LED digital frames are designed for easy use—just plug in a USB drive and enjoy
              your photos instantly. With a clean, modern design and hassle-free setup, our frames offer a
              straightforward way to showcase your favorite moments.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-8">
              <p className="text-gray-800 italic">
                "Every photo tells a story, and every frame should honor that story. That's our promise to you."
              </p>
              <p className="text-gray-600 mt-2">- The Urbandec Team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}