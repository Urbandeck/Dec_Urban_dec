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
                <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

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
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}

              <p className="text-gray-700 mb-6">{product.description}</p>
            </div>

            {/* Price and Add to Cart */}
            <div className="border-t border-b py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.basePrice)}
                </span>
                {product.category && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {product.category}
                  </span>
                )}
              </div>

              <ProductActions product={product} />
            </div>

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
                <dl className="space-y-3">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex">
                      <dt className="w-1/3 text-gray-600">
                        {formatSpecLabel(key)}:
                      </dt>
                      <dd className="w-2/3 text-gray-900">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Features - Dynamic from database or default */}
            {(features.length > 0 || Object.keys(specs).length === 0) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h2>
                <ul className="space-y-2">
                  {features.length > 0 ? (
                    features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      {specs.display && (
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{specs.display}</span>
                        </li>
                      )}
                      {specs.wifi && (
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{specs.wifi} connectivity</span>
                        </li>
                      )}
                      {specs.storage && (
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{specs.storage} storage capacity</span>
                        </li>
                      )}
                      {specs.formats && (
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Supports {specs.formats}</span>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            )}

            {/* Additional Information */}
            {Object.keys(specs).length === 0 && features.length === 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">
                  Product specifications and features will be updated soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}