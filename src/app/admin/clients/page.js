'use client';

import { useState, useEffect } from 'react';
import { UserSquare2, UserPlus, Phone, Mail, MapPin, CheckCircle2, AlertCircle, RefreshCw, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Form modal toggles & state
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null); // { id, name }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchClientsAndSession = async () => {
    setLoading(true);
    try {
      const [sessionRes, clientsRes] = await Promise.all([
        fetch('/api/auth/session'),
        fetch('/api/admin/clients')
      ]);

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setUser(sessionData.user);
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      }
    } catch (e) {
      console.error('Error fetching clients and session:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsAndSession();
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const canView = isAdmin || !!user?.permissions?.client_management?.view;
  const canCreate = isAdmin || !!user?.permissions?.client_management?.create;
  const canEdit = isAdmin || !!user?.permissions?.client_management?.edit;
  const canDelete = isAdmin || !!user?.permissions?.client_management?.delete;

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setMessage({ text: '', type: '' });
    setShowFormModal(true);
  };

  const openEditModal = (client) => {
    setIsEditMode(true);
    setEditingId(client.id);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone);
    setAddress(client.address);
    setMessage({ text: '', type: '' });
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const url = isEditMode ? `/api/admin/clients/${editingId}` : '/api/admin/clients';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, address })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save client');
      }

      setMessage({ 
        text: isEditMode ? 'Client profile updated successfully!' : 'Client profile successfully added!', 
        type: 'success' 
      });
      
      fetchClientsAndSession();
      
      setTimeout(() => {
        setShowFormModal(false);
        setMessage({ text: '', type: '' });
      }, 1500);

    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClient = (id, clientName) => {
    setClientToDelete({ id, name: clientName });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete client');
      }

      setShowDeleteModal(false);
      setClientToDelete(null);
      fetchClientsAndSession();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!loading && !canView) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500 bg-white border border-zinc-200 rounded-xl shadow-sm max-w-xl mx-auto my-12 animate-fade-in">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4 animate-bounce-subtle" />
        <h2 className="text-lg font-bold text-zinc-800">Access Denied</h2>
        <p className="text-sm text-zinc-450 mt-1 max-w-sm">
          You do not have the required permissions to view or manage corporate clients. Contact your administrator to request access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-black tracking-tight font-sans">Client Registry</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage corporate client databases to quick-select during order creations.</p>
        </div>
        {canCreate && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors shadow-md cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New Client</span>
          </button>
        )}
      </div>

      {/* Clients Listing Grid */}
      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500 shadow-sm">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-brand-orange mb-3" />
          <p className="text-sm">Loading clients directory...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-400 shadow-sm">
          <UserSquare2 className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold">No clients registered yet.</p>
          <p className="text-xs mt-1">Add clients to begin dispatching orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="bg-white border border-zinc-200 hover:border-brand-orange/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-zinc-950 flex items-center justify-center text-white">
                    <UserSquare2 className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-50 border border-zinc-150 px-2 py-0.5 rounded">
                    ID: #{client.id}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-zinc-950 truncate">{client.name}</h3>
                </div>

                <div className="space-y-2 text-xs text-zinc-600 border-t border-zinc-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-brand-orange shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-brand-orange shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{client.address}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Card */}
              {(canEdit || canDelete) && (
                <div className="border-t border-zinc-100 pt-3.5 mt-4 flex gap-3 text-xs">
                  {canEdit && (
                    <button
                      onClick={() => openEditModal(client)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 border border-zinc-200 hover:border-brand-orange bg-white text-zinc-700 hover:text-brand-orange rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 border border-red-100 hover:border-red-650 bg-red-50/50 hover:bg-red-55 text-red-650 hover:text-red-750 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}


      {/* Add/Edit Client Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="bg-zinc-950 text-white p-5 flex justify-between items-center">
              <h3 className="text-base font-bold">
                {isEditMode ? `Edit Client Profile: ${name}` : 'Register Client Profile'}
              </h3>
              <button 
                onClick={() => setShowFormModal(false)} 
                className="text-zinc-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              
              {/* Feedback messages */}
              {message.text && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm border ${
                  message.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-brand-green' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">Company / Client Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Siddique Industries"
                  className="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@client.com"
                  className="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0300-1234567"
                  className="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">Delivery / Billing Address</label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete physical street address..."
                  className="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors shadow shadow-zinc-800 disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Submitting...' : isEditMode ? 'Save Changes' : 'Add Client'}
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
          setClientToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Corporate Client"
        message={clientToDelete ? `Are you sure you want to delete client "${clientToDelete.name}"? \n\nWarning: This will permanently delete this client profile and also cascade delete ALL orders associated with them.` : ''}
        confirmText="Confirm & Delete"
        loading={deleteLoading}
      />

    </div>
  );
}
