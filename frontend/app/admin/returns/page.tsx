'use client';

import { useState, useEffect } from 'react';
import { ENV_CONFIG } from '@/lib/env-config';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';

interface ReturnRequest {
  id: number;
  returnId: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  status: string;
  reason: string;
  reasonDescription: string;
  reasonDetails: string;
  productId: number;
  productName: string;
  quantity: number;
  refundAmount: number;
  adminNotes: string;
  pickupAddress: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string;
}

interface ReturnStats {
  pending: number;
  approved: number;
  inProgress: number;
  completed: number;
  rejected: number;
  total: number;
}

const statusColors: { [key: string]: { bg: string; text: string } } = {
  REQUESTED: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  APPROVED: { bg: 'bg-blue-100', text: 'text-blue-800' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800' },
  PICKUP_SCHEDULED: { bg: 'bg-purple-100', text: 'text-purple-800' },
  PICKED_UP: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  RECEIVED: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  REFUND_INITIATED: { bg: 'bg-amber-100', text: 'text-amber-800' },
  REFUNDED: { bg: 'bg-green-100', text: 'text-green-800' },
  CLOSED: { bg: 'bg-slate-100', text: 'text-slate-800' },
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [stats, setStats] = useState<ReturnStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionNotes, setActionNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchReturns();
    fetchStats();
  }, [filterStatus]);

  const fetchReturns = async () => {
    try {
      const endpoint = filterStatus === 'all'
        ? `${ENV_CONFIG.API_URL}/api/returns/admin/all`
        : `${ENV_CONFIG.API_URL}/api/returns/admin/status/${filterStatus}`;

      const response = await fetch(endpoint, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setReturns(data);
      }
    } catch (error) {
      toast.error('Failed to fetch return requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/returns/admin/stats`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string, notes?: string) => {
    setProcessingAction(true);
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/returns/admin/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, notes: notes || actionNotes }),
      });

      if (response.ok) {
        toast.success(`Return request ${newStatus.toLowerCase().replace('_', ' ')}`);
        fetchReturns();
        fetchStats();
        setShowModal(false);
        setSelectedReturn(null);
        setActionNotes('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleApprove = async (id: number) => {
    await handleStatusUpdate(id, 'APPROVED', 'Return approved by admin');
  };

  const handleReject = async (id: number) => {
    if (!actionNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    await handleStatusUpdate(id, 'REJECTED', actionNotes);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-400">Loading returns...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Return Requests</h1>
        <p className="text-sm text-slate-500 mt-1">Manage customer return requests</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-slate-500">Filter by status:</span>
          {['all', 'REQUESTED', 'APPROVED', 'REJECTED', 'REFUNDED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-slate-800 text-white'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Returns List */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {returns.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No return requests found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Return ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {returns.map((returnReq) => (
                  <tr key={returnReq.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{returnReq.returnId}</div>
                      <div className="text-xs text-slate-400">Order: {returnReq.orderId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800">{returnReq.customerName}</div>
                      <div className="text-xs text-slate-400">{returnReq.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800 max-w-xs truncate">{returnReq.productName}</div>
                      <div className="text-xs text-slate-400">Qty: {returnReq.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800">{returnReq.reasonDescription || returnReq.reason}</div>
                      {returnReq.reasonDetails && (
                        <div className="text-xs text-slate-400 max-w-xs truncate">{returnReq.reasonDetails}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">
                        {formatPrice(returnReq.refundAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[returnReq.status]?.bg || 'bg-stone-100'
                      } ${statusColors[returnReq.status]?.text || 'text-slate-800'}`}>
                        {returnReq.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(returnReq.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedReturn(returnReq);
                          setShowModal(true);
                        }}
                        className="text-amber-600 hover:text-amber-800 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Detail Modal */}
      {showModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Return Request Details</h2>
                  <p className="text-sm text-slate-500">{selectedReturn.returnId}</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedReturn(null);
                    setActionNotes('');
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  statusColors[selectedReturn.status]?.bg || 'bg-stone-100'
                } ${statusColors[selectedReturn.status]?.text || 'text-slate-800'}`}>
                  {selectedReturn.status.replace('_', ' ')}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Order ID</p>
                  <p className="text-sm font-medium text-slate-800">{selectedReturn.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Created</p>
                  <p className="text-sm text-slate-800">{formatDate(selectedReturn.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Customer</p>
                  <p className="text-sm font-medium text-slate-800">{selectedReturn.customerName}</p>
                  <p className="text-xs text-slate-500">{selectedReturn.customerEmail}</p>
                  <p className="text-xs text-slate-500">{selectedReturn.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Refund Amount</p>
                  <p className="text-lg font-bold text-slate-800">{formatPrice(selectedReturn.refundAmount)}</p>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-stone-50 rounded-lg p-4 mb-6">
                <p className="text-xs text-slate-500 uppercase mb-2">Product</p>
                <p className="text-sm font-medium text-slate-800">{selectedReturn.productName}</p>
                <p className="text-xs text-slate-500">Quantity: {selectedReturn.quantity}</p>
              </div>

              {/* Return Reason */}
              <div className="mb-6">
                <p className="text-xs text-slate-500 uppercase mb-2">Reason for Return</p>
                <p className="text-sm font-medium text-slate-800">{selectedReturn.reasonDescription || selectedReturn.reason}</p>
                {selectedReturn.reasonDetails && (
                  <p className="text-sm text-slate-600 mt-1">{selectedReturn.reasonDetails}</p>
                )}
              </div>

              {/* Pickup Address */}
              {selectedReturn.pickupAddress && (
                <div className="mb-6">
                  <p className="text-xs text-slate-500 uppercase mb-2">Pickup Address</p>
                  <pre className="text-sm text-slate-800 whitespace-pre-wrap font-sans">{selectedReturn.pickupAddress}</pre>
                </div>
              )}

              {/* Admin Notes */}
              {selectedReturn.adminNotes && (
                <div className="mb-6">
                  <p className="text-xs text-slate-500 uppercase mb-2">Admin Notes</p>
                  <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans bg-stone-50 p-3 rounded">{selectedReturn.adminNotes}</pre>
                </div>
              )}

              {/* Action Section */}
              {selectedReturn.status === 'REQUESTED' && (
                <div className="border-t pt-6">
                  <p className="text-sm font-medium text-slate-800 mb-3">Take Action</p>

                  <div className="mb-4">
                    <label className="block text-sm text-slate-600 mb-2">
                      Notes (required for rejection)
                    </label>
                    <textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Add notes about this return request..."
                      rows={3}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedReturn.id)}
                      disabled={processingAction}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {processingAction ? 'Processing...' : 'Approve Return'}
                    </button>
                    <button
                      onClick={() => handleReject(selectedReturn.id)}
                      disabled={processingAction}
                      className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {processingAction ? 'Processing...' : 'Reject Return'}
                    </button>
                  </div>
                </div>
              )}

              {/* Status Update for non-REQUESTED */}
              {selectedReturn.status !== 'REQUESTED' && selectedReturn.status !== 'REFUNDED' && selectedReturn.status !== 'REJECTED' && selectedReturn.status !== 'CLOSED' && (
                <div className="border-t pt-6">
                  <p className="text-sm font-medium text-slate-800 mb-3">Update Status</p>

                  <div className="mb-4">
                    <textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Add notes..."
                      rows={2}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {selectedReturn.status === 'APPROVED' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedReturn.id, 'PICKUP_SCHEDULED')}
                        disabled={processingAction}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Schedule Pickup
                      </button>
                    )}
                    {selectedReturn.status === 'PICKUP_SCHEDULED' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedReturn.id, 'PICKED_UP')}
                        disabled={processingAction}
                        className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Mark Picked Up
                      </button>
                    )}
                    {selectedReturn.status === 'PICKED_UP' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedReturn.id, 'RECEIVED')}
                        disabled={processingAction}
                        className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Mark Received
                      </button>
                    )}
                    {selectedReturn.status === 'RECEIVED' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedReturn.id, 'REFUND_INITIATED')}
                        disabled={processingAction}
                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Initiate Refund
                      </button>
                    )}
                    {selectedReturn.status === 'REFUND_INITIATED' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedReturn.id, 'REFUNDED')}
                        disabled={processingAction}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Mark Refunded
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
