'use client';

import { useState, useEffect } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  Hourglass,
  Eye,
  FileText,
  Image as ImageIcon,
  Truck,
  RefreshCw,
  Search,
  Building,
  Layers,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Stats computation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status !== 'COMPLETED').length;
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;

  const pendingTaskCount = orders.filter(o => o.status === 'PENDING_TASK').length;
  const pendingInvoiceCount = orders.filter(o => o.status === 'PENDING_INVOICE').length;
  const pendingCourierCount = orders.filter(o => o.status === 'PENDING_COURIER').length;

  const filteredOrders = orders.filter(order =>
    order.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm) ||
    order.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_TASK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 border border-orange-200 text-orange-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse" />
            Phase 1: Task Completion
          </span>
        );
      case 'PENDING_INVOICE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Phase 2: Invoice Creation
          </span>
        );
      case 'PENDING_COURIER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 border border-sky-200 text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            Phase 3: Courier Dispatch
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 border border-green-200 text-brand-green">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Order Completed
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Format date and time explicitly for Pakistan/Karachi timezone
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      let parsedDate;
      if (dateStr.includes('T')) {
        parsedDate = new Date(dateStr);
      } else {
        parsedDate = new Date(dateStr.replace(' ', 'T'));
      }

      const day = String(parsedDate.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[parsedDate.getMonth()];

      let hours = parsedDate.getHours();
      const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

      return `${day}-${month} ${timeStr}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-5 lg:space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-brand-black tracking-tight font-sans">System Dashboard</h1>
          <p className="text-zinc-500 text-xs lg:text-sm mt-1">Real-time status overview of active client demands and staff workflows.</p>
        </div>
      </div>

      {/* Analytics Cards — inline strip */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-zinc-200">
          {/* Total Active */}
          <div className="flex flex-col items-center justify-center gap-2 py-5 px-3 text-center">
            <div className="h-10 w-10 rounded-xl bg-zinc-950 flex items-center justify-center text-white shadow-md shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase text-zinc-400 tracking-widest leading-snug">Total<br className="sm:hidden" /> Orders</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-0.5">{totalOrders}</p>
            </div>
          </div>
          {/* Pending */}
          <div className="flex flex-col items-center justify-center gap-2 py-5 px-3 text-center">
            <div className="h-10 w-10 rounded-xl bg-brand-orange flex items-center justify-center text-white shadow-md shrink-0">
              <Hourglass className="h-5 w-5 animate-pulse-orange" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase text-zinc-400 tracking-widest leading-snug">Pending<br className="sm:hidden" /> Phases</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-0.5">{pendingOrders}</p>
            </div>
          </div>
          {/* Completed */}
          <div className="flex flex-col items-center justify-center gap-2 py-5 px-3 text-center">
            <div className="h-10 w-10 rounded-xl bg-brand-green flex items-center justify-center text-white shadow-md shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase text-zinc-400 tracking-widest leading-snug">Completed<br className="sm:hidden" /> Orders</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-0.5">{completedOrders}</p>
            </div>
          </div>
        </div>
      </div>


      {/* Sub-status Progress Counters */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-zinc-200">
          <div className="flex flex-col items-center justify-center py-4 px-2 text-center">
            <div className="flex items-center justify-center min-h-[2.5rem]">
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-500 leading-snug">
                Pending Task<span className="hidden sm:inline"> (Phase 1)</span>
              </p>
            </div>
            <p className="text-2xl font-extrabold text-orange-600 mt-1">{pendingTaskCount}</p>
          </div>
          <div className="flex flex-col items-center justify-center py-4 px-2 text-center">
            <div className="flex items-center justify-center min-h-[2.5rem]">
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-500 leading-snug">
                Pending Invoice<span className="hidden sm:inline"> (Phase 2)</span>
              </p>
            </div>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingInvoiceCount}</p>
          </div>
          <div className="flex flex-col items-center justify-center py-4 px-2 text-center">
            <div className="flex items-center justify-center min-h-[2.5rem]">
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-500 leading-snug">
                Pending Courier<span className="hidden sm:inline"> (Phase 3)</span>
              </p>
            </div>
            <p className="text-2xl font-extrabold text-sky-600 mt-1">{pendingCourierCount}</p>
          </div>
        </div>
      </div>

      {/* Orders Filter & Table */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 lg:p-6 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-zinc-50/50">
          <h2 className="text-base lg:text-lg font-bold text-brand-black">Client Orders Registry</h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search orders or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-10 text-center text-zinc-500">
            <RefreshCw className="h-7 w-7 animate-spin mx-auto text-brand-orange mb-3" />
            <p className="text-sm">Loading orders list...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">
            <p className="text-sm font-semibold">No orders found.</p>
            <p className="text-xs text-zinc-400 mt-1">Create a new order to begin the workflow.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-zinc-100">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">#{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="font-bold text-zinc-950 mt-1.5">{order.client_name}</p>
                      <p className="text-xs text-zinc-400">{order.client_phone}</p>
                    </div>
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Track</span>
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2">{order.details}</p>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className="bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded font-medium">Task: {order.staff_1_name}</span>
                    <span className="bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded font-medium">Invoice: {order.staff_2_name}</span>
                    <span className="bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded font-medium">Courier: {order.staff_3_name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Order Details</th>
                    <th className="px-6 py-4">Current Status</th>
                    <th className="px-6 py-4">Assigned Team</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-zinc-950">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-950">{order.client_name}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{order.client_phone}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-zinc-600">{order.details}</td>
                      <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 text-xs text-zinc-500 space-y-0.5">
                        <div><span className="font-medium text-zinc-800">Task:</span> {order.staff_1_name}</div>
                        <div><span className="font-medium text-zinc-800">Invoice:</span> {order.staff_2_name}</div>
                        <div><span className="font-medium text-zinc-800">Courier:</span> {order.staff_3_name}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Track Flow</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Progress Timeline Tracking Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-t-2xl sm:rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="bg-zinc-950 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Order Live Pipeline</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Tracking Order #{selectedOrder.id} for {selectedOrder.client_name}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">

              {/* Order Details Header Panel */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <span className="font-semibold text-zinc-900">Demand Details:</span>
                  <div className="flex gap-4 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 px-3 py-1 rounded shadow-sm">
                    <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5 text-brand-orange" /> Qty: {selectedOrder.qty || '0'}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-brand-green" /> Deadline: {formatDate(selectedOrder.deadline_date)}</span>
                  </div>
                </div>
                <p className="text-zinc-650 bg-white border border-zinc-150 p-2.5 rounded-lg">{selectedOrder.details}</p>
                <div className="mt-3 grid grid-cols-2 gap-4 text-xs text-zinc-500">
                  <div>
                    <span className="font-semibold text-zinc-700">Client Address:</span>
                    <p className="mt-0.5 text-zinc-600">{selectedOrder.client_address}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-700">Client Contact:</span>
                    <p className="mt-0.5 text-zinc-600">{selectedOrder.client_phone} | {selectedOrder.client_email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Landscape Horizontal Grid Workflow Pipeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 font-sans">
                  Workflow Pipeline Progress
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">

                  {/* Stage 1 Card */}
                  <div className={`p-4 rounded-xl border transition-all ${selectedOrder.dc_image_path
                    ? 'bg-green-50/20 border-green-200'
                    : selectedOrder.status === 'PENDING_TASK'
                      ? 'bg-orange-50/20 border-brand-orange ring-1 ring-brand-orange'
                      : 'bg-zinc-50/50 border-zinc-200 opacity-60'
                    }`}>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Stage 1</div>
                      {selectedOrder.dc_image_path ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-green-50 border border-green-200 text-brand-green rounded">Done</span>
                      ) : selectedOrder.status === 'PENDING_TASK' ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-orange-50 border border-brand-orange/30 text-brand-orange rounded animate-pulse">Active</span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-400 rounded">Locked</span>
                      )}
                    </div>

                    <h5 className="font-extrabold text-sm text-zinc-950 flex items-center gap-1.5 flex-wrap">
                      <span>Production</span>
                      {selectedOrder.stage1_completed_at && (
                        <span className="text-[10px] font-medium text-zinc-550 bg-zinc-100 px-1.5 py-0.5 rounded shrink-0">
                          {formatDateTime(selectedOrder.stage1_completed_at)}
                        </span>
                      )}
                    </h5>

                    <div className="mt-3 pt-3 border-t border-zinc-100 text-xs text-zinc-500 space-y-2">
                      <div>Assigned: <span className="font-semibold text-zinc-800">{selectedOrder.staff_1_name}</span></div>
                      {selectedOrder.received_by && (
                        <div className="text-[11px] font-semibold text-zinc-650">
                          Received By: <span className="font-extrabold text-zinc-850">{selectedOrder.received_by}</span>
                        </div>
                      )}

                      {selectedOrder.dc_image_path && (
                        <div className="space-y-1 mt-1">
                          {selectedOrder.dc_image_path.split(',').map((path, idx) => (
                            <a
                              key={idx}
                              href={path}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                if (!/\.pdf$/i.test(path)) {
                                  e.preventDefault();
                                  setPreviewImageUrl(path);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 text-xs text-brand-orange hover:underline font-semibold block"
                            >
                              <ImageIcon className="h-3.5 w-3.5" />
                              <span>View Delivery Challan {idx + 1}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stage 2 Card */}
                  <div className={`p-4 rounded-xl border transition-all ${selectedOrder.invoice_image_path
                    ? 'bg-green-50/20 border-green-200'
                    : selectedOrder.status === 'PENDING_INVOICE'
                      ? 'bg-orange-50/20 border-brand-orange ring-1 ring-brand-orange'
                      : 'bg-zinc-50/50 border-zinc-200 opacity-60'
                    }`}>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Stage 2</div>
                      {selectedOrder.invoice_image_path ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-green-50 border border-green-200 text-brand-green rounded">Done</span>
                      ) : selectedOrder.status === 'PENDING_INVOICE' ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-orange-50 border border-brand-orange/30 text-brand-orange rounded animate-pulse">Active</span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-400 rounded">Waiting</span>
                      )}
                    </div>

                    <h5 className="font-extrabold text-sm text-zinc-950 flex items-center gap-1.5 flex-wrap">
                      <span>Accounts Invoice</span>
                      {selectedOrder.stage2_completed_at && (
                        <span className="text-[10px] font-medium text-zinc-550 bg-zinc-100 px-1.5 py-0.5 rounded shrink-0">
                          {formatDateTime(selectedOrder.stage2_completed_at)}
                        </span>
                      )}
                    </h5>

                    <div className="mt-3 pt-3 border-t border-zinc-100 text-xs text-zinc-500 space-y-2">
                      <div>Assigned: <span className="font-semibold text-zinc-800">{selectedOrder.staff_2_name}</span></div>

                      {selectedOrder.invoice_image_path && (
                        <div className="space-y-1 mt-1">
                          {selectedOrder.invoice_image_path.split(',').map((path, idx) => (
                            <a
                              key={idx}
                              href={path}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                if (!/\.pdf$/i.test(path)) {
                                  e.preventDefault();
                                  setPreviewImageUrl(path);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 text-xs text-brand-orange hover:underline font-semibold block"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>View Invoice {idx + 1}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stage 3 Card */}
                  <div className={`p-4 rounded-xl border transition-all ${selectedOrder.tracking_id
                    ? 'bg-green-50/20 border-green-200'
                    : selectedOrder.status === 'PENDING_COURIER'
                      ? 'bg-orange-50/20 border-brand-orange ring-1 ring-brand-orange'
                      : 'bg-zinc-50/50 border-zinc-200 opacity-60'
                    }`}>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Stage 3</div>
                      {selectedOrder.tracking_id ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-green-50 border border-green-200 text-brand-green rounded">Done</span>
                      ) : selectedOrder.status === 'PENDING_COURIER' ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-orange-50 border border-brand-orange/30 text-brand-orange rounded animate-pulse">Active</span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-400 rounded">Waiting</span>
                      )}
                    </div>

                    <h5 className="font-extrabold text-sm text-zinc-950 flex items-center gap-1.5 flex-wrap">
                      <span>Logistics Dispatch</span>
                      {selectedOrder.stage3_completed_at && (
                        <span className="text-[10px] font-medium text-zinc-550 bg-zinc-100 px-1.5 py-0.5 rounded shrink-0">
                          {formatDateTime(selectedOrder.stage3_completed_at)}
                        </span>
                      )}
                    </h5>

                    <div className="mt-3 pt-3 border-t border-zinc-100 text-xs text-zinc-500 space-y-2">
                      <div>Assigned: <span className="font-semibold text-zinc-800">{selectedOrder.staff_3_name}</span></div>

                      {selectedOrder.tracking_id && (
                        <div className="mt-1 bg-zinc-100 border border-zinc-200 px-2 py-1 rounded text-[10px] text-zinc-850 inline-flex items-center gap-1.5 font-bold font-mono">
                          <Truck className="h-3.5 w-3.5 text-brand-orange" />
                          <span>Trk: {selectedOrder.tracking_id}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all duration-300 animate-fade-in"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); setPreviewImageUrl(null); }}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center text-lg font-bold shadow-lg transition-colors cursor-pointer"
              title="Close Preview"
            >
              ✕
            </button>
            <img 
              src={previewImageUrl} 
              alt="Preview" 
              onClick={(e) => e.stopPropagation()} 
              className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl border border-white/10 animate-scale-up" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
