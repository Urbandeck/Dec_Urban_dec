'use client';
import { ENV_CONFIG } from '@/lib/env-config';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface CustomProductImage {
  id: number;
  fileName: string;
  mimeType: string;
  fileSize: number;
  displayOrder: number;
  imageData: string;
}

interface CustomProductRequest {
  id: number;
  frameSize: string;
  frameColor: string;
  quantity: number;
  specialInstructions: string;
  status: string;
  adminNotes?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
  images: CustomProductImage[];
}

export default function CustomProductsPage() {
  const [requests, setRequests] = useState<CustomProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CustomProductRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCustomRequests();
  }, []);

  const fetchCustomRequests = async () => {
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/custom-products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Convert image data to base64 format
        const requestsWithImages = data.map((request: any) => ({
          ...request,
          images: request.images?.map((img: any) => ({
            ...img,
            imageData: img.imageData ? `data:${img.mimeType};base64,${img.imageData}` : null
          })) || []
        }));
        setRequests(requestsWithImages);
      } else {
        toast.error('Failed to fetch custom product requests');
      }
    } catch (error) {
      toast.error('Error loading custom product requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: number) => {
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/custom-products/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: new URLSearchParams({
          status: statusUpdate.status,
          notes: statusUpdate.notes
        })
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        fetchCustomRequests();
        setShowModal(false);
        setSelectedRequest(null);
        setStatusUpdate({ status: '', notes: '' });
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const openRequestDetails = (request: CustomProductRequest) => {
    setSelectedRequest(request);
    setStatusUpdate({ status: request.status, notes: request.adminNotes || '' });
    setShowModal(true);
  };

  const handleDeleteRequest = async (requestId: number) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${ENV_CONFIG.API_URL}/api/custom-products/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();

      if (response.ok) {
        toast.success('Custom request deleted successfully');
        setRequests(requests.filter(req => req.id !== requestId));
        setShowDeleteConfirm(false);
        setRequestToDelete(null);
        if (showModal && selectedRequest?.id === requestId) {
          setShowModal(false);
          setSelectedRequest(null);
        }
      } else {
        let errorMessage = 'Failed to delete custom request';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use the text itself if it's not empty
          if (responseText) {
            errorMessage = `Failed to delete: ${responseText}`;
          }
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error(`Error deleting custom request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (requestId: number) => {
    setRequestToDelete(requestId);
    setShowDeleteConfirm(true);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading custom product requests...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Custom Product Requests</h1>
        <p className="text-sm text-gray-600 mt-1">Manage customer-submitted custom frame requests</p>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frame Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Images
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No custom product requests yet
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{request.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {request.customerEmail || 'Guest'}
                      {request.customerPhone && (
                        <div className="text-xs text-gray-500">{request.customerPhone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>Size: {request.frameSize}</div>
                      <div>Color: {request.frameColor}</div>
                      <div>Qty: {request.quantity}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex -space-x-2">
                      {request.images.slice(0, 3).map((image, index) => (
                        <div key={image.id} className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                          {image.imageData ? (
                            <img
                              src={`data:${image.mimeType};base64,${image.imageData}`}
                              alt={image.fileName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                              No img
                            </div>
                          )}
                        </div>
                      ))}
                      {request.images.length > 3 && (
                        <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                          +{request.images.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openRequestDetails(request)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => confirmDelete(request.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Custom Request #{selectedRequest.id}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Request Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>{' '}
                      <span className="font-medium">{selectedRequest.customerEmail || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>{' '}
                      <span className="font-medium">{selectedRequest.customerPhone || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Submitted:</span>{' '}
                      <span className="font-medium">
                        {new Date(selectedRequest.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Frame Specifications</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Size:</span>{' '}
                      <span className="font-medium">{selectedRequest.frameSize}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Color:</span>{' '}
                      <span className="font-medium">{selectedRequest.frameColor}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Quantity:</span>{' '}
                      <span className="font-medium">{selectedRequest.quantity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedRequest.specialInstructions && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Special Instructions</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedRequest.specialInstructions}
                  </p>
                </div>
              )}

              {/* Uploaded Images */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Uploaded Images ({selectedRequest.images.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedRequest.images.map((image) => (
                    <div key={image.id} className="relative group">
                      {image.imageData ? (
                        <>
                          <img
                            src={`data:${image.mimeType};base64,${image.imageData}`}
                            alt={image.fileName}
                            className="w-full h-48 object-cover rounded-lg shadow-sm cursor-pointer"
                            onClick={() => window.open(`data:${image.mimeType};base64,${image.imageData}`, '_blank')}
                          />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Download the image
                                fetch(`${ENV_CONFIG.API_URL}/api/custom-products/image/${image.id}/download`)
                                  .then(response => response.blob())
                                  .then(blob => {
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.style.display = 'none';
                                    a.href = url;
                                    a.download = image.fileName;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                  })
                              }}
                              className="bg-white text-gray-700 p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                              title="Download Original"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">No image data</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs truncate font-medium">{image.fileName}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs">{(image.fileSize / 1024).toFixed(2)} KB</p>
                          <p className="text-xs text-green-400">Click to view full size</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Update Status</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={statusUpdate.notes}
                      onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Add notes about this request..."
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => confirmDelete(selectedRequest.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete Request
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedRequest(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Custom Request</h3>
                <p className="text-sm text-gray-500">Request #{requestToDelete}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this custom product request? This action cannot be undone and will permanently remove all associated images and data.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRequestToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => requestToDelete && handleDeleteRequest(requestToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Delete Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}