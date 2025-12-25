/**
 * Utility functions for handling product images
 */

interface ProductImage {
  id: number;
  productId: number;
  fileName: string;
  mimeType: string;
  fileSize: number;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
  imageUrl: string;
  base64Data?: string;
}

/**
 * Get the primary image for a product
 */
export function getPrimaryImage(images: ProductImage[]): ProductImage | null {
  if (!images || images.length === 0) return null;
  return images.find(img => img.isPrimary) || images[0];
}

/**
 * Get image URL - either from base64 data or API endpoint
 */
export function getImageUrl(image: ProductImage | null, fallbackUrl?: string): string {
  if (!image) {
    return fallbackUrl || '/placeholder-image.svg';
  }
  
  // If base64 data is available, use it directly
  if (image.base64Data) {
    return image.base64Data;
  }
  
  // Otherwise, use the API endpoint
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${image.imageUrl}`;
}

/**
 * Convert file to base64 for preview
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Upload image to backend
 */
export async function uploadProductImage(
  productId: number,
  file: File,
  isPrimary: boolean = false,
  altText?: string
): Promise<ProductImage> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('isPrimary', isPrimary.toString());
  if (altText) {
    formData.append('altText', altText);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/${productId}/images`,
    {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  return response.json();
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  productId: number,
  files: FileList | File[]
): Promise<ProductImage[]> {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/${productId}/images/multiple`,
    {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload images');
  }

  return response.json();
}

/**
 * Delete product image
 */
export async function deleteProductImage(imageId: number): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/images/${imageId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete image');
  }
}

/**
 * Get all images for a product
 */
export async function getProductImages(productId: number): Promise<ProductImage[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/${productId}/images`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch product images');
  }

  return response.json();
}