'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, FileText, Truck, Receipt } from 'lucide-react';
import { getSafeFileUrl } from '@/lib/fileUtils';

export default function OrderDocumentDropdown({ order, onPreviewImage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [positionClass, setPositionClass] = useState('bottom-full mb-1.5 right-0');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 220px below button, pop UPWARDS so it never clips under table card
      if (spaceBelow < 220) {
        setPositionClass('bottom-full mb-1.5 right-0');
      } else {
        setPositionClass('top-full mt-1.5 right-0');
      }
    }
    setIsOpen(!isOpen);
  };

  const poPaths = order?.po_file_path ? order.po_file_path.split(',').filter(Boolean) : [];
  const dcPaths = order?.dc_image_path ? order.dc_image_path.split(',').filter(Boolean) : [];
  const invoicePaths = order?.invoice_image_path ? order.invoice_image_path.split(',').filter(Boolean) : [];

  const hasPo = poPaths.length > 0;
  const hasDc = dcPaths.length > 0;
  const hasInvoice = invoicePaths.length > 0;

  const handleOpenDoc = (path) => {
    const safeUrl = getSafeFileUrl(path);
    if (!/\.pdf$/i.test(path) && onPreviewImage) {
      onPreviewImage(safeUrl);
    } else {
      window.open(safeUrl, '_blank');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        title="Download Order Documents"
        className={`p-1.5 border rounded-lg transition-all cursor-pointer inline-flex items-center justify-center ${
          isOpen
            ? 'border-brand-orange bg-orange-50 text-brand-orange shadow-xs'
            : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-brand-orange hover:border-brand-orange'
        }`}
      >
        <Download className="h-3.5 w-3.5 shrink-0" />
      </button>

      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`absolute ${positionClass} w-60 rounded-xl bg-white border border-zinc-200 shadow-2xl z-[100] p-2 text-xs font-sans animate-fade-in`}
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 mb-1.5">
            Download Order Files
          </div>

          {/* PO (Purchase Order) Section */}
          <div className="space-y-1">
            {hasPo ? (
              poPaths.map((path, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOpenDoc(path)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-800 hover:bg-orange-50 hover:text-brand-orange font-semibold transition-colors cursor-pointer border border-transparent hover:border-orange-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-3.5 w-3.5 text-brand-orange shrink-0" />
                    <span className="truncate">PO File {poPaths.length > 1 ? `#${idx + 1}` : ''}</span>
                  </div>
                  <Download className="h-3 w-3 text-zinc-400 shrink-0 ml-1" />
                </button>
              ))
            ) : (
              <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-400 opacity-60 cursor-not-allowed select-none">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>PO File (Not Uploaded)</span>
                </div>
              </div>
            )}
          </div>

          {/* DC (Delivery Challan) Section */}
          <div className="space-y-1 pt-1">
            {hasDc ? (
              dcPaths.map((path, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOpenDoc(path)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-800 hover:bg-orange-50 hover:text-brand-orange font-semibold transition-colors cursor-pointer border border-transparent hover:border-orange-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Truck className="h-3.5 w-3.5 text-brand-orange shrink-0" />
                    <span className="truncate">DC File {dcPaths.length > 1 ? `#${idx + 1}` : ''}</span>
                  </div>
                  <Download className="h-3 w-3 text-zinc-400 shrink-0 ml-1" />
                </button>
              ))
            ) : (
              <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-400 opacity-60 cursor-not-allowed select-none">
                <div className="flex items-center gap-2 truncate">
                  <Truck className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>DC File (Not Uploaded)</span>
                </div>
              </div>
            )}
          </div>

          {/* Invoice Section */}
          <div className="space-y-1 pt-1">
            {hasInvoice ? (
              invoicePaths.map((path, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOpenDoc(path)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-800 hover:bg-orange-50 hover:text-brand-orange font-semibold transition-colors cursor-pointer border border-transparent hover:border-orange-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Receipt className="h-3.5 w-3.5 text-brand-orange shrink-0" />
                    <span className="truncate">Invoice {invoicePaths.length > 1 ? `#${idx + 1}` : ''}</span>
                  </div>
                  <Download className="h-3 w-3 text-zinc-400 shrink-0 ml-1" />
                </button>
              ))
            ) : (
              <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-400 opacity-60 cursor-not-allowed select-none">
                <div className="flex items-center gap-2 truncate">
                  <Receipt className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>Invoice (Not Uploaded)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
