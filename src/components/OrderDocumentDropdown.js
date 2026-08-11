'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Download, FileText, Truck, Receipt } from 'lucide-react';
import { getSafeFileUrl } from '@/lib/fileUtils';

export default function OrderDocumentDropdown({ order, onPreviewImage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, openUpwards: false });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate portal position based on trigger button bounding rect
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < 220;

      const dropdownWidth = 128; // 128px (w-32) width
      let calculatedLeft = rect.right + window.scrollX - dropdownWidth;
      if (calculatedLeft < 10) calculatedLeft = 10;

      setCoords({
        top: openUpwards ? rect.top + window.scrollY - 8 : rect.bottom + window.scrollY + 6,
        left: calculatedLeft,
        openUpwards
      });
    }
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown on outside click or scroll/resize
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (isOpen) {
        updatePosition();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const poPaths = order?.po_file_path ? order.po_file_path.split(',').filter(Boolean) : [];
  const dcPaths = order?.dc_image_path ? order.dc_image_path.split(',').filter(Boolean) : [];
  const invoicePaths = order?.invoice_image_path ? order.invoice_image_path.split(',').filter(Boolean) : [];

  const hasPo = poPaths.length > 0;
  const hasDc = dcPaths.length > 0;
  const hasInvoice = invoicePaths.length > 0;

  const handleOpenDoc = (path) => {
    const safeUrl = getSafeFileUrl(path);
    const link = document.createElement('a');
    link.href = safeUrl;
    const fileName = path.split('/').pop() || 'file';
    link.setAttribute('download', fileName);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const dropdownMenu = (
    <div
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: coords.openUpwards ? undefined : `${coords.top}px`,
        bottom: coords.openUpwards ? `${window.innerHeight - (coords.top - window.scrollY)}px` : undefined,
        left: `${coords.left}px`,
      }}
      className="w-32 rounded-xl bg-white border border-zinc-200 shadow-2xl z-[9999] p-1 text-xs font-sans animate-fade-in space-y-0.5"
    >
      {/* PO (Purchase Order) Section */}
      <div>
        {hasPo ? (
          poPaths.map((path, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleOpenDoc(path)}
              className="w-full flex items-center gap-1 px-2 py-1 rounded-md text-zinc-800 hover:bg-orange-50 hover:text-brand-orange font-semibold transition-colors cursor-pointer border border-transparent hover:border-orange-200"
            >
              <FileText className="h-3.5 w-3.5 text-brand-orange shrink-0" />
              <span className="truncate">PO File {poPaths.length > 1 ? `#${idx + 1}` : ''}</span>
            </button>
          ))
        ) : (
          <div className="w-full flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-50 border border-zinc-100 text-zinc-400 opacity-60 cursor-not-allowed select-none">
            <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span>PO File</span>
          </div>
        )}
      </div>

      {/* DC (Delivery Challan) Section */}
      <div>
        {hasDc ? (
          dcPaths.map((path, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleOpenDoc(path)}
              className="w-full flex items-center gap-1 px-2 py-1 rounded-md text-zinc-800 hover:bg-orange-50 hover:text-brand-orange font-semibold transition-colors cursor-pointer border border-transparent hover:border-orange-200"
            >
              <Truck className="h-3.5 w-3.5 text-brand-orange shrink-0" />
              <span className="truncate">DC File {dcPaths.length > 1 ? `#${idx + 1}` : ''}</span>
            </button>
          ))
        ) : (
          <div className="w-full flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-50 border border-zinc-100 text-zinc-400 opacity-60 cursor-not-allowed select-none">
            <Truck className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span>DC File</span>
          </div>
        )}
      </div>

      {/* Invoice Section */}
      <div>
        {hasInvoice ? (
          invoicePaths.map((path, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleOpenDoc(path)}
              className="w-full flex items-center gap-1 px-2 py-1 rounded-md text-zinc-800 hover:bg-orange-50 hover:text-brand-orange font-semibold transition-colors cursor-pointer border border-transparent hover:border-orange-200"
            >
              <Receipt className="h-3.5 w-3.5 text-brand-orange shrink-0" />
              <span className="truncate">Invoice {invoicePaths.length > 1 ? `#${idx + 1}` : ''}</span>
            </button>
          ))
        ) : (
          <div className="w-full flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-50 border border-zinc-100 text-zinc-400 opacity-60 cursor-not-allowed select-none">
            <Receipt className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span>Invoice</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="inline-block text-left" ref={buttonRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        title="Download Order Documents"
        className={`p-1.5 border rounded-lg transition-all cursor-pointer inline-flex items-center justify-center ${isOpen
            ? 'border-brand-orange bg-orange-50 text-brand-orange shadow-xs'
            : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-brand-orange hover:border-brand-orange'
          }`}
      >
        <Download className="h-3.5 w-3.5 shrink-0" />
      </button>

      {isOpen && mounted && createPortal(dropdownMenu, document.body)}
    </div>
  );
}
