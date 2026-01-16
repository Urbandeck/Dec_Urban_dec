import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { api, Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import ProductActions from '@/components/ProductActions';
import ImageSlideshow from '@/components/ImageSlideshow';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await api.getProductBySlug(params.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: 'website',
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

async function getProduct(slug: string): Promise<Product | null> {
  const product = await api.getProductBySlug(slug);


  return product;
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  // Parse specifications JSON
  let specs: any = {};
  let features: string[] = [];

  try {
    if (product.specsJson) {
      const parsedSpecs = JSON.parse(product.specsJson);

      // Extract features if present
      if (parsedSpecs.features) {
        features = Array.isArray(parsedSpecs.features)
          ? parsedSpecs.features
          : parsedSpecs.features.split(',').map((f: string) => f.trim()).filter((f: string) => f);
        delete parsedSpecs.features;
      }

      // Remove empty specifications
      Object.keys(parsedSpecs).forEach(key => {
        if (parsedSpecs[key] && parsedSpecs[key].toString().trim()) {
          specs[key] = parsedSpecs[key];
        }
      });
    }
  } catch (error) {
  }

  // Format specification labels
  const formatSpecLabel = (key: string): string => {
    // Handle common abbreviations and formatting
    const labelMap: { [key: string]: string } = {
      'display': 'Display',
      'resolution': 'Resolution',
      'storage': 'Storage',
      'wifi': 'WiFi',
      'connectivity': 'Connectivity',
      'formats': 'Supported Formats',
      'ram': 'RAM',
      'cpu': 'Processor',
      'battery': 'Battery Life',
      'dimensions': 'Dimensions',
      'weight': 'Weight',
      'warranty': 'Warranty',
    };

    return labelMap[key.toLowerCase()] ||
           key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images Slideshow */}
          <div>
            <ImageSlideshow
              images={product.images || []}
              autoPlay={true}
              interval={5000}
              showThumbnails={true}
              className=""
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.brand && (
                <p className="text-sm text-slate-500 mb-2">{product.brand}</p>
              )}
              <h1 className="text-3xl font-bold text-slate-800 mb-4">{product.name}</h1>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-slate-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-slate-500">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}

              <p className="text-slate-600 mb-6">{product.description}</p>
            </div>

            {/* Price and Add to Cart */}
            <div className="border-t border-b py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-slate-800">
                  {formatPrice(product.basePrice)}
                </span>
                {product.category && (
                  <span className="bg-stone-100 text-slate-600 px-3 py-1 rounded-full text-sm">
                    {product.category}
                  </span>
                )}
              </div>

              <ProductActions product={product} />
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span>7-Day Return</span>
              </div>
            </div>

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Specifications</h2>
                <dl className="space-y-3">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex">
                      <dt className="w-1/3 text-slate-500">
                        {formatSpecLabel(key)}:
                      </dt>
                      <dd className="w-2/3 text-slate-800">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Features - Dynamic from database or default */}
            {(features.length > 0 || Object.keys(specs).length === 0) && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Key Features</h2>
                <ul className="space-y-2">
                  {features.length > 0 ? (
                    features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      {specs.display && (
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-slate-600">{specs.display}</span>
                        </li>
                      )}
                      {specs.wifi && (
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-slate-600">{specs.wifi} connectivity</span>
                        </li>
                      )}
                      {specs.storage && (
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-slate-600">{specs.storage} storage capacity</span>
                        </li>
                      )}
                      {specs.formats && (
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-slate-600">Supports {specs.formats}</span>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            )}

            {/* Additional Information */}
            {Object.keys(specs).length === 0 && features.length === 0 && (
              <div className="bg-stone-50 p-4 rounded-lg">
                <p className="text-slate-500 text-sm">
                  Product specifications and features will be updated soon.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Product Details Section - Full Width */}
        {params.slug === 'sods' && (
          <div className="mt-16 space-y-12">
            {/* Perfect For Section */}
            <div className="bg-gradient-to-r from-amber-50 to-stone-100 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Perfect For:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Anime enthusiasts and Naruto fans</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Gaming room or bedroom décor</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Office desk display</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Gift for manga/anime collectors</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Creating an immersive otaku atmosphere</span>
                </div>
              </div>
            </div>

            {/* Detailed Specifications */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Frame Specifications</h2>
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Display Size</span>
                      <span className="text-slate-800 font-semibold">24cm x 19cm (9.4" x 7.5")</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Frame Material</span>
                      <span className="text-slate-800 font-semibold">Premium engineered wood</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Finish</span>
                      <span className="text-slate-800 font-semibold">Oak finish</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Display Type</span>
                      <span className="text-slate-800 font-semibold">LED backlit</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Power Source</span>
                      <span className="text-slate-800 font-semibold">USB powered</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Power Consumption</span>
                      <span className="text-slate-800 font-semibold">5W</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">LED Temperature</span>
                      <span className="text-slate-800 font-semibold">Warm White</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Brightness</span>
                      <span className="text-slate-800 font-semibold">Adjustable</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Weight</span>
                      <span className="text-slate-800 font-semibold">600g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Mounting</span>
                      <span className="text-slate-800 font-semibold">Wall-mountable</span>
                    </div>
                  </div>
                </div>
                <div className="bg-stone-50 px-6 py-4 border-t border-stone-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Cable Length</span>
                    <span className="text-slate-800 font-semibold">1.5m USB cable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Features */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">✨ Premium Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">High-Quality Print</h3>
                      <p className="text-sm text-slate-500">Fade-resistant coating ensures lasting vibrant colors</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Energy Efficient LED</h3>
                      <p className="text-sm text-slate-500">Consumes less than 5W power</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Plug & Play</h3>
                      <p className="text-sm text-slate-500">Ready to use straight out of the box</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Soft Glow</h3>
                      <p className="text-sm text-slate-500">Perfect ambient lighting for any room</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Easy Maintenance</h3>
                      <p className="text-sm text-slate-500">Dust-resistant glass front panel</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Handcrafted Frame</h3>
                      <p className="text-sm text-slate-500">Each piece individually finished</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What's in the Box */}
            <div className="bg-stone-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">📦 Package Contents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600">1x Kakashi Hatake LED Digital Frame</span>
                </div>
                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600">1x USB Cable (1.5m)</span>
                </div>
              </div>
            </div>

            {/* Why Choose This Frame */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Why Choose This Frame?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🎨</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Exceptional Artwork Quality</h3>
                      <p className="text-slate-500">Museum-grade printing ensures every detail of Kakashi's iconic look is captured perfectly</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">💡</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Ambient LED Lighting</h3>
                      <p className="text-slate-500">Soft backlighting creates a stunning visual effect without being harsh on the eyes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🌟</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Premium Build Quality</h3>
                      <p className="text-slate-500">Solid wood frame construction ensures durability and a premium feel</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🔌</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Energy Efficient</h3>
                      <p className="text-slate-500">Uses minimal power - can run 24/7 for less than ₹10/month</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🎁</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Perfect Gift</h3>
                      <p className="text-slate-500">Comes in premium packaging, ideal for birthdays, anniversaries, or special occasions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🛡️</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Built to Last</h3>
                      <p className="text-slate-500">High-quality materials and construction for years of enjoyment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Product Details Section - Samurai */}
        {params.slug === 'wer' && (
          <div className="mt-16 space-y-12">
            {/* Perfect For Section */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Perfect For:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Japanese culture enthusiasts and samurai fans</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Gaming room or home office décor</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Meditation and zen spaces</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Gift for history buffs and warriors at heart</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Creating an authentic Japanese aesthetic atmosphere</span>
                </div>
              </div>
            </div>

            {/* Detailed Specifications */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Frame Specifications</h2>
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Display Size</span>
                      <span className="text-slate-800 font-semibold">23cm x 18cm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Frame Material</span>
                      <span className="text-slate-800 font-semibold">Premium engineered wood</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Finish</span>
                      <span className="text-slate-800 font-semibold">Walnut finish</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Display Type</span>
                      <span className="text-slate-800 font-semibold">LED backlit</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Power Source</span>
                      <span className="text-slate-800 font-semibold">USB powered</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Power Consumption</span>
                      <span className="text-slate-800 font-semibold">5W</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">LED Temperature</span>
                      <span className="text-slate-800 font-semibold">Warm White</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Brightness</span>
                      <span className="text-slate-800 font-semibold">Adjustable</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Weight</span>
                      <span className="text-slate-800 font-semibold">650 to 700g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Mounting</span>
                      <span className="text-slate-800 font-semibold">Wall-mountable</span>
                    </div>
                  </div>
                </div>
                <div className="bg-stone-50 px-6 py-4 border-t border-stone-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Cable Length</span>
                    <span className="text-slate-800 font-semibold">1.5m USB cable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Features */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">✨ Premium Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">High-Quality Print</h3>
                      <p className="text-sm text-slate-500">Fade-resistant, weather-resistant coating</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Energy Efficient LED</h3>
                      <p className="text-sm text-slate-500">Consumes less than 5W power</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Plug & Play</h3>
                      <p className="text-sm text-slate-500">Ready to use out of the box</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Dramatic Glow</h3>
                      <p className="text-sm text-slate-500">Perfect ambient lighting with warrior spirit</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Easy Maintenance</h3>
                      <p className="text-sm text-slate-500">Dust-resistant glass front panel</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Handcrafted Frame</h3>
                      <p className="text-sm text-slate-500">Each piece individually finished</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What's in the Box */}
            <div className="bg-stone-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">📦 Package Contents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600">1x Samurai LED Digital Frame</span>
                </div>
                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600">1x USB Cable (1.5m)</span>
                </div>
              </div>
            </div>

            {/* Why Choose This Frame */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Why Choose This Frame?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🎨</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Authentic Samurai Artwork</h3>
                      <p className="text-slate-500">Traditional Japanese warrior design with intricate details captured in museum-quality printing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">💡</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Dramatic LED Backlighting</h3>
                      <p className="text-slate-500">Soft warm glow enhances the powerful samurai presence and creates an immersive atmosphere</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🌟</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Premium Walnut Frame</h3>
                      <p className="text-slate-500">Handcrafted wood frame with rich walnut finish complements the traditional Japanese aesthetic</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🔌</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Energy Efficient</h3>
                      <p className="text-slate-500">Uses minimal power - can run 24/7 for less than ₹10/month while maintaining warrior vigil</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🎁</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Meaningful Gift</h3>
                      <p className="text-slate-500">Symbolizes strength, honor, and discipline - perfect for warriors, martial artists, and history lovers</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🛡️</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Built to Last</h3>
                      <p className="text-slate-500">High-quality materials honor the samurai legacy with construction built for generations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Product Details Section - Your Name */}
        {params.slug === 'dsfds' && (
          <div className="mt-16 space-y-12">
            {/* Perfect For Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Perfect For:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Anime enthusiasts and Your Name (Kimi no Na wa) fans</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Romantic bedroom or couple's space décor</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Gift for anime lovers and significant others</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Living room or entertainment area display</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Creating a dreamy, nostalgic atmosphere</span>
                </div>
              </div>
            </div>

            {/* Detailed Specifications */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Frame Specifications</h2>
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Display Size</span>
                      <span className="text-slate-800 font-semibold">23cm x 18cm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Frame Material</span>
                      <span className="text-slate-800 font-semibold">Premium engineered wood</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Finish</span>
                      <span className="text-slate-800 font-semibold">Natural finish</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Display Type</span>
                      <span className="text-slate-800 font-semibold">LED backlit</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Power Source</span>
                      <span className="text-slate-800 font-semibold">USB powered</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Power Consumption</span>
                      <span className="text-slate-800 font-semibold">5W</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">LED Temperature</span>
                      <span className="text-slate-800 font-semibold">Warm White</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Brightness</span>
                      <span className="text-slate-800 font-semibold">Adjustable</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Weight</span>
                      <span className="text-slate-800 font-semibold">650 to 700g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Mounting</span>
                      <span className="text-slate-800 font-semibold">Wall-mountable</span>
                    </div>
                  </div>
                </div>
                <div className="bg-stone-50 px-6 py-4 border-t border-stone-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Cable Length</span>
                    <span className="text-slate-800 font-semibold">1.5m USB cable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Features */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">✨ Premium Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">High-Quality Print</h3>
                      <p className="text-sm text-slate-500">Fade-resistant, vibrant color reproduction</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Energy Efficient LED</h3>
                      <p className="text-sm text-slate-500">Consumes less than 5W power</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Plug & Play</h3>
                      <p className="text-sm text-slate-500">Ready to use out of the box</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Romantic Glow</h3>
                      <p className="text-sm text-slate-500">Perfect ambient lighting for intimate spaces</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Easy Maintenance</h3>
                      <p className="text-sm text-slate-500">Dust-resistant glass front panel</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Handcrafted Frame</h3>
                      <p className="text-sm text-slate-500">Each piece individually finished</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What's in the Box */}
            <div className="bg-stone-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">📦 Package Contents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600">1x Your Name LED Digital Frame</span>
                </div>
                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600">1x USB Cable (1.5m)</span>
                </div>
              </div>
            </div>

            {/* Why Choose This Frame */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Why Choose This Frame?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🎨</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Iconic Movie Artwork</h3>
                      <p className="text-slate-500">Captures the breathtaking scenery and emotional moments from the beloved anime film in stunning detail</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">💡</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Dreamy LED Backlighting</h3>
                      <p className="text-slate-500">Soft warm glow creates a romantic and nostalgic atmosphere reminiscent of the film's twilight scenes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🌟</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Premium Natural Frame</h3>
                      <p className="text-slate-500">Handcrafted wood frame with natural finish complements the organic beauty of the artwork</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🔌</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Energy Efficient</h3>
                      <p className="text-slate-500">Uses minimal power - can run 24/7 for less than ₹10/month while keeping memories alive</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🎁</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Perfect Romantic Gift</h3>
                      <p className="text-slate-500">Symbolizes connection and destiny - ideal for couples, anniversaries, and anime fans</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🛡️</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Built to Last</h3>
                      <p className="text-slate-500">High-quality materials preserve the magic of Your Name for years to come</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Product Details Section - Lofi Study Girl */}
        {params.slug === 'lofi-study-girl-led-frame' && (
          <div className="mt-16 space-y-12">
            {/* Perfect For Section */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Perfect For:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Students and scholars seeking study motivation</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Home office or study room décor</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Gift for college students or book lovers</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Bedroom ambiance for peaceful nights</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Creating a calm, focused atmosphere</span>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">Lofi aesthetic and minimalist room setups</span>
                </div>
              </div>
            </div>

            {/* Detailed Specifications */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Frame Specifications</h2>
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Display Size</span>
                      <span className="text-slate-800 font-semibold">23cm x 18cm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Frame Material</span>
                      <span className="text-slate-800 font-semibold">Premium engineered wood</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Finish</span>
                      <span className="text-slate-800 font-semibold">Dark walnut finish</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Display Type</span>
                      <span className="text-slate-800 font-semibold">LED backlit silhouette</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Power Source</span>
                      <span className="text-slate-800 font-semibold">USB powered</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Power Consumption</span>
                      <span className="text-slate-800 font-semibold">5W</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">LED Temperature</span>
                      <span className="text-slate-800 font-semibold">Warm White</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Brightness</span>
                      <span className="text-slate-800 font-semibold">Adjustable</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Weight</span>
                      <span className="text-slate-800 font-semibold">650 to 700g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Mounting</span>
                      <span className="text-slate-800 font-semibold">Wall-mountable</span>
                    </div>
                  </div>
                </div>
                <div className="bg-stone-50 px-6 py-4 border-t border-stone-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Cable Length</span>
                    <span className="text-slate-800 font-semibold">1.5m USB cable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Features */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">✨ Premium Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Silhouette Art Design</h3>
                      <p className="text-sm text-slate-500">Elegant minimalist aesthetic</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Warm LED Glow</h3>
                      <p className="text-sm text-slate-500">Creates perfect study ambiance</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Energy Efficient LED</h3>
                      <p className="text-sm text-slate-500">Consumes less than 5W power</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Plug & Play</h3>
                      <p className="text-sm text-slate-500">Ready to use out of the box</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Easy Maintenance</h3>
                      <p className="text-sm text-slate-500">Dust-resistant glass front panel</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Handcrafted Frame</h3>
                      <p className="text-sm text-slate-500">Premium dark walnut finish</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What's in the Box */}
            <div className="bg-stone-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">📦 Package Contents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600">1x Lofi Study Girl LED Frame</span>
                </div>
                <div className="flex items-center space-x-3 bg-white p-4 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-600">1x USB Cable (1.5m)</span>
                </div>
              </div>
            </div>

            {/* Why Choose This Frame */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Why Choose This Frame?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">📚</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Study Motivation</h3>
                      <p className="text-slate-500">Inspiring silhouette of dedication and focus - perfect reminder during long study sessions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">💡</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Perfect Study Lighting</h3>
                      <p className="text-slate-500">Warm LED backlighting provides gentle illumination ideal for late-night reading without eye strain</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🎨</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Minimalist Aesthetic</h3>
                      <p className="text-slate-500">Clean silhouette design fits any room style from modern to traditional, dorm to home office</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🔌</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Energy Efficient</h3>
                      <p className="text-slate-500">Uses minimal power - can run all night during study sessions for less than ₹10/month</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🎁</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Meaningful Gift</h3>
                      <p className="text-slate-500">Perfect for students, graduates, teachers, or anyone pursuing their dreams and goals</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">🌙</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Calming Atmosphere</h3>
                      <p className="text-slate-500">Creates a peaceful, focused environment that enhances concentration and productivity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}