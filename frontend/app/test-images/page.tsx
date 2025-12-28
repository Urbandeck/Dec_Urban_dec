export default function TestImagesPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Testing Image Display</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold mb-2">Using img tag:</h2>
          <img 
            src="/images/products/frame-10inch-black.jpg" 
            alt="Test Image" 
            className="w-full h-64 object-cover rounded"
          />
        </div>
        
        <div>
          <h2 className="font-semibold mb-2">List of available images:</h2>
          <ul className="text-sm">
            <li>/images/products/frame-10inch-black.jpg</li>
            <li>/images/products/frame-10inch-white.jpg</li>
            <li>/images/products/frame-15inch-premium.jpg</li>
            <li>/images/products/frame-12inch-wood.jpg</li>
            <li>/images/products/frame-8inch-compact.jpg</li>
            <li>/images/products/frame-10inch-slim.jpg</li>
            <li>/images/products/frame-15inch-ultra.jpg</li>
            <li>/images/products/frame-7inch-portable.jpg</li>
            <li>/images/products/frame-13inch-smart.jpg</li>
            <li>/images/products/frame-11inch-classic.jpg</li>
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-semibold mb-2">Test Direct Links:</h2>
        <a 
          href="/images/products/frame-10inch-black.jpg" 
          target="_blank" 
          className="text-emerald-600 underline"
        >
          Open frame-10inch-black.jpg directly
        </a>
      </div>
    </div>
  );
}