import Image from 'next/image';

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function ProductImage({ src, alt, className = "", priority = false }: ProductImageProps) {
  // If we have an image URL or base64 data, use it
  if (src) {
    // Check if it's base64 data
    const isBase64 = src.startsWith('data:image');

    // For base64 images, use a regular img tag
    if (isBase64) {
      return (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${className}`}
        />
      );
    }

    // For regular URLs, use Next.js Image component
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        unoptimized={true} // Disable optimization for local development
      />
    );
  }

  // Fallback placeholder when no image
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <svg
        className="w-24 h-24 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}