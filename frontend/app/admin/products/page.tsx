'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api, Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import ProductImage from '@/components/ProductImage';
import { ENV_CONFIG } from '@/lib/env-config';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Digital Frames',
    brand: 'Urbandec',
    basePrice: '',
    stock: '50',
    imageUrl: '',
    isLive: false,
    specs: {
      height: '',
      length: '',
      features: '',
    },
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch with admin=true to see all products including drafts
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/products?admin=true`, {
        credentials: 'include',
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description,
      category: formData.category,
      brand: formData.brand,
      basePrice: parseFloat(formData.basePrice),
      imageUrl: formData.imageUrl || '/images/placeholder.jpg',
      active: true,
      isLive: formData.isLive,
      specsJson: JSON.stringify(formData.specs),
      skus: [],
      rating: editingProduct?.rating || 0,
      reviewCount: editingProduct?.reviewCount || 0,
    };

    try {
      let productId: number;

      if (editingProduct) {
        const updatedProduct = await api.updateProduct(editingProduct.id, productData);
        if (updatedProduct) {
          productId = editingProduct.id;
          // Upload images if selected
          if (selectedImages.length > 0) {
            await uploadImages(productId);
          }
          await fetchProducts(); // Refresh the list
          toast.success('Product updated successfully!');
        } else {
          toast.error('Failed to update product. Please try again.');
          return;
        }
      } else {
        const createdProduct = await api.createProduct(productData);
        if (createdProduct) {
          productId = createdProduct.id;
          // Upload images if selected
          if (selectedImages.length > 0) {
            await uploadImages(productId);
          }
          await fetchProducts(); // Refresh the list
          toast.success('Product added successfully!');
        } else {
          toast.error('Failed to add product. Please try again.');
          return;
        }
      }

      resetForm();
      setShowAddModal(false);
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const uploadImages = async (productId: number) => {
    if (selectedImages.length === 0) return;

    try {
      // Upload each image
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];

        // Convert image to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove data URL prefix to get pure base64
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
          };
        });

        reader.readAsDataURL(image);
        const base64Data = await base64Promise;

        // Upload to backend
        const response = await fetch(`${ENV_CONFIG.API_URL}/api/products/${productId}/images/base64`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            base64Data,
            fileName: image.name,
            altText: `${formData.name} - Image ${i + 1}`,
            isPrimary: i === 0, // First image is primary
          }),
        });

        if (!response.ok) {
        }
      }
    } catch (error) {
      // Don't throw - product was created successfully, just image upload failed
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Digital Frames',
      brand: 'Urbandec',
      basePrice: '',
      stock: '50',
      imageUrl: '',
      isLive: false,
      specs: {
        height: '',
        length: '',
        features: '',
      },
    });
    setEditingProduct(null);
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const specs = product.specsJson ? JSON.parse(product.specsJson) : {};
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category || 'Digital Frames',
      brand: product.brand || 'Urbandec',
      basePrice: product.basePrice.toString(),
      stock: '50',
      imageUrl: product.imageUrl || '',
      isLive: product.isLive || false,
      specs: {
        height: specs.height || '',
        length: specs.length || '',
        features: specs.features || '',
      },
    });
    setShowAddModal(true);
  };

  const handleDelete = async (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const success = await api.deleteProduct(productId);
        if (success) {
          await fetchProducts(); // Refresh the list
          toast.success('Product deleted successfully!');
        } else {
          toast.error('Failed to delete product. Please try again.');
        }
      } catch (error) {
        toast.error('An error occurred. Please try again.');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Product Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your product inventory</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search products by name, category, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <p className="text-sm text-slate-500">Total Products</p>
          <p className="text-2xl font-bold text-slate-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <p className="text-sm text-slate-500">In Stock</p>
          <p className="text-2xl font-bold text-green-600">{products.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <p className="text-sm text-slate-500">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">0</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <p className="text-sm text-slate-500">Categories</p>
          <p className="text-2xl font-bold text-amber-600">3</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-400">No products found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
            >
              Add your first product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 relative">
                          <div className="h-10 w-10 rounded-lg bg-stone-100 overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <>
                                <img
                                  src={product.images.find((img: any) => img.isPrimary)?.base64Data ||
                                       product.images[0].base64Data ||
                                       '/images/placeholder.jpg'}
                                  alt={product.name}
                                  className="h-10 w-10 object-cover"
                                />
                                {product.images.length > 1 && (
                                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {product.images.length}
                                  </div>
                                )}
                              </>
                            ) : (
                              <ProductImage
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-10 w-10 object-cover"
                                style={{ maxWidth: '40px', maxHeight: '40px' }}
                              />
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-800">{product.name}</div>
                          <div className="text-sm text-slate-400">
                            {product.brand}
                            {product.images && product.images.length > 0 && (
                              <span className="ml-2 text-xs text-slate-400">
                                ({product.images.length} image{product.images.length !== 1 ? 's' : ''})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{formatPrice(product.basePrice)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800">50 units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.isLive ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Live
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-amber-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-4 border w-full max-w-lg shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Premium 10-inch Frame"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Urbandec"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product description..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Digital Frames">Digital Frames</option>
                    <option value="Professional">Professional</option>
                    <option value="Smart Frames">Smart Frames</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Product Image
                </label>
                
                {/* Compact Image Upload */}
                <div className="border border-stone-200 rounded-lg p-3 text-center bg-stone-100">
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        setSelectedImages(files);
                        const urls = files.map(file => URL.createObjectURL(file));
                        setImagePreviews(urls);
                      }
                    }}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Click to upload images
                  </label>
                  <span className="text-xs text-slate-400 ml-2">(Multiple JPG, PNG up to 5MB each)</span>
                </div>

                {/* URL Input */}
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="Or enter image URL"
                  className="w-full mt-2 px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Compact Specs */}
                <p className="text-xs text-slate-400 mt-1">
                  Recommended: 800x800px, white background
                </p>

                {/* Preview */}
                {imagePreviews.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-2 flex-wrap">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <div className="w-16 h-16 bg-stone-100 rounded border overflow-hidden">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                              }}
                            />
                          </div>
                          {index === 0 && (
                            <span className="absolute -top-1 -right-1 text-xs bg-amber-500 text-white px-1 rounded">Primary</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
                {!imagePreviews.length && formData.imageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-16 h-16 bg-stone-100 rounded border overflow-hidden">
                      <img
                        src={formData.imageUrl}
                        alt="Current image"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">Current image</span>
                  </div>
                )}
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Product Specifications
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Height (e.g., 25 cm)"
                      value={formData.specs.height}
                      onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, height: e.target.value } })}
                      className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Length (e.g., 30 cm)"
                      value={formData.specs.length}
                      onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, length: e.target.value } })}
                      className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Key Features */}
                <div className="mt-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Key Features
                  </label>
                  <textarea
                    placeholder="Enter key features, one per line (e.g., High-resolution display)"
                    value={formData.specs.features}
                    onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, features: e.target.value } })}
                    className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <p className="text-xs text-slate-400 mt-1">Enter each feature on a new line</p>
                </div>
              </div>

              {/* Live Status Toggle */}
              <div className="border-t pt-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isLive}
                    onChange={(e) => setFormData({ ...formData, isLive: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-600">
                      Make product live
                    </span>
                    <p className="text-xs text-slate-400">
                      {formData.isLive ? 'Product will be visible to customers' : 'Product will be saved as draft'}
                    </p>
                  </div>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-1.5 text-sm border border-stone-200 rounded-lg text-slate-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  {editingProduct ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}