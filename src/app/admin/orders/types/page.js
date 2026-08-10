'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Layers, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function OrderTypesPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [typeIdToDelete, setTypeIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [typeName, setTypeName] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchOrderTypes = async () => {
    setLoading(true);
    try {
      const [sessionRes, typesRes] = await Promise.all([
        fetch('/api/auth/session'),
        fetch('/api/admin/order-types')
      ]);

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setUser(sessionData.user);
      }
      if (typesRes.ok) {
        const data = await typesRes.json();
        setTypes(data);
      }
    } catch (e) {
      console.error('Error fetching order types:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderTypes();
  }, []);

  const handleOpenAddModal = () => {
    setTypeName('');
    setFormError('');
    setFormSuccess(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (type) => {
    setSelectedType(type);
    setTypeName(type.name);
    setFormError('');
    setFormSuccess(false);
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);

    try {
      const res = await fetch('/api/admin/order-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: typeName })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order type');
      }

      setFormSuccess(true);
      fetchOrderTypes();

      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess(false);
      }, 1200);

    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);

    try {
      const res = await fetch(`/api/admin/order-types/${selectedType.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: typeName })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order type');
      }

      setFormSuccess(true);
      fetchOrderTypes();

      setTimeout(() => {
        setShowEditModal(false);
        setFormSuccess(false);
      }, 1200);

    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (typeId) => {
    setTypeIdToDelete(typeId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/order-types/${typeIdToDelete}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setShowDeleteModal(false);
        setTypeIdToDelete(null);
        fetchOrderTypes();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete order type');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const canCreate = isAdmin || !!user?.permissions?.order_types?.create;
  const canEdit = isAdmin || !!user?.permissions?.order_types?.edit;
  const canDelete = isAdmin || !!user?.permissions?.order_types?.delete;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-black tracking-tight font-sans">Order Types</h1>
          <p className="text-zinc-500 text-sm mt-1">Configure and manage various categories of orders used in client dispatches.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchOrderTypes}
            className="flex items-center gap-2 px-3.5 py-2 border border-zinc-200 bg-white text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="h-4.5 w-4.5" />
            <span>Reload</span>
          </button>
          {canCreate && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors shadow-md cursor-pointer"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              <span>Add Order Type</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Small Cards */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 bg-white border border-zinc-200 rounded-xl shadow-sm">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-brand-orange mb-3" />
          <p className="text-sm">Loading order types...</p>
        </div>
      ) : types.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 bg-white border border-zinc-200 rounded-xl shadow-sm">
          <Layers className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
          <p className="text-sm font-semibold">No order types created yet.</p>
          <p className="text-xs text-zinc-405 mt-1">Create one using the "Add Order Type" button.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {types.map((type) => (
            <div 
              key={type.id} 
              className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="h-10 w-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-orange shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-zinc-950 truncate text-sm leading-tight">{type.name}</h3>
                  <span className="text-[10px] text-zinc-400 font-mono">TYPE ID: #{type.id}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {(canEdit || canDelete) && (
                <div className="flex gap-2.5 pt-3 border-t border-zinc-100">
                  {canEdit && (
                    <button
                      onClick={() => handleOpenEditModal(type)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-650 hover:text-zinc-900 rounded-md text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteClick(type.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-red-100 hover:border-red-200 bg-red-50/50 hover:bg-red-50 text-red-650 hover:text-red-755 rounded-md text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up">
            
            <div className="bg-zinc-950 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">Add Order Type</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Specify a name for the new order category</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-xs">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="bg-green-50 border border-green-200 text-brand-green p-3 rounded-lg flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  <span>Order Type added successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-705 mb-1.5">Order Type Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemical Delivery"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                />
              </div>

              <div className="border-t border-zinc-100 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Adding...' : 'Add Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up">
            
            <div className="bg-zinc-950 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">Edit Order Type</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Modify the name of the order category</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-xs">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="bg-green-50 border border-green-200 text-brand-green p-3 rounded-lg flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  <span>Order Type updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-705 mb-1.5">Order Type Name</label>
                <input
                  type="text"
                  required
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                />
              </div>

              <div className="border-t border-zinc-100 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTypeIdToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Order Category Type"
        message="Are you sure you want to delete this order type? Existing orders referencing it will remain active."
        confirmText="Confirm & Delete"
        loading={deleteLoading}
      />

    </div>
  );
}
