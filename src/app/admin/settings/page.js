'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, AlertCircle, CheckCircle2, Upload, Trash2, HelpCircle } from 'lucide-react';

export default function AppSettings() {
  const [activeTab, setActiveTab] = useState('branding'); // 'branding' | 'workflow'
  const [appName, setAppName] = useState('');
  const [appLogo, setAppLogo] = useState(null); // base64 string
  const [favicon, setFavicon] = useState(null); // base64 string
  const [logoWidth, setLogoWidth] = useState(150);
  const [reuploadBufferTime, setReuploadBufferTime] = useState(20);
  const [maxReuploadCount, setMaxReuploadCount] = useState(3);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setAppName(data.app_name || 'ISS PORTAL');
        setAppLogo(data.app_logo);
        setFavicon(data.favicon);
        setLogoWidth(data.logo_width || 150);
        setReuploadBufferTime(data.reupload_buffer_time || 20);
        setMaxReuploadCount(data.max_reupload_count !== undefined ? parseInt(data.max_reupload_count) : 3);
      }
    } catch (e) {
      console.error('Failed to load application settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select an image file for the app logo', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAppLogo(reader.result);
      window.dispatchEvent(new CustomEvent('logo-image-change', { detail: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'image/x-icon' && file.type !== 'image/png' && !file.name.endsWith('.ico')) {
      setMessage({ text: 'Favicon must be an .ico or .png image file', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFavicon(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_name: appName,
          app_logo: appLogo,
          favicon: favicon,
          logo_width: logoWidth,
          reupload_buffer_time: reuploadBufferTime,
          max_reupload_count: maxReuploadCount
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setMessage({ text: 'Application settings saved successfully! Reloading...', type: 'success' });
      
      // Reload page after a delay to reflect changes in layouts, headers, tabs
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-500">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-brand-orange mb-3" />
        <p className="text-sm">Loading application settings configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-brand-black tracking-tight font-sans">App Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Configure global application branding assets, logos, and workflow rules.</p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'branding'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          General Branding
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('workflow')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'workflow'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Workflow Settings
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-2.5 text-sm border ${
            message.type === 'success' ? 'bg-green-50 border-green-200 text-brand-green' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-zinc-100">
            {/* App Name Section */}
            <div className="p-6 space-y-4">
              <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <Settings className="h-5 w-5 text-brand-orange" />
                General Branding
              </h2>
              <div className="max-w-md">
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">Application Name</label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => {
                    setAppName(e.target.value);
                    window.dispatchEvent(new CustomEvent('logo-name-change', { detail: e.target.value }));
                  }}
                  placeholder="e.g. ISS PORTAL"
                  className="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
                <p className="text-[10px] text-zinc-400 mt-1">This text appears in sidebar headers, page titles, and tab banners.</p>
              </div>
            </div>

            {/* App Logo Section */}
            <div className="p-6 space-y-4">
              <h2 className="text-base font-bold text-zinc-950">Application Logo & Sizing</h2>
              <p className="text-xs text-zinc-500">Upload a custom company logo and adjust its rendering width live to preview how it fits inside the sidebar header container.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left Column: Controls */}
                <div className="space-y-5">
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-200 hover:border-brand-orange text-zinc-700 hover:text-brand-orange rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer bg-white">
                      <Upload className="h-4 w-4" />
                      <span>Choose Logo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="block text-[10px] text-zinc-400 mt-1.5">Recommended format: PNG, JPG, or SVG. Transparent backgrounds are preferred.</span>
                  </div>

                  {appLogo && (
                    <div className="space-y-2 pt-3 border-t border-zinc-100">
                      <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                        <span>LOGO WIDTH</span>
                        <span className="bg-zinc-100 px-2 py-0.5 border border-zinc-200 rounded text-zinc-800 text-[10px] font-bold">{logoWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={logoWidth}
                        onChange={(e) => {
                          const w = parseInt(e.target.value);
                          setLogoWidth(w);
                          window.dispatchEvent(new CustomEvent('logo-width-change', { detail: w }));
                        }}
                        className="w-full accent-brand-orange h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[8px] text-zinc-400 font-medium">
                        <span>50px</span>
                        <span>125px</span>
                        <span>200px</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Live Sidebar Preview */}
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Live Sidebar Header Preview</span>
                  <div className="h-16 w-[240px] rounded-xl border border-zinc-200 bg-white flex items-center px-6 shadow-inner shrink-0 relative group overflow-hidden">
                    {appLogo ? (
                      <>
                        <div className="flex items-center justify-center w-full animate-fade-in">
                          <img 
                            src={appLogo} 
                            alt="App Logo Preview" 
                            style={{ width: `${logoWidth}px`, height: 'auto' }}
                            className="object-contain max-h-12" 
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAppLogo(null);
                            window.dispatchEvent(new CustomEvent('logo-image-change', { detail: null }));
                          }}
                          className="absolute top-1 right-1 h-6 w-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="text-zinc-400 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-brand-orange flex items-center justify-center shadow-md shadow-orange-500/20">
                          <span className="text-white font-bold text-xs">P</span>
                        </div>
                        <span className="text-xs font-bold text-zinc-800 truncate">{appName || 'ISS PORTAL'}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-zinc-400 mt-1">If a logo is set, only the logo is shown. App name & workspace subtitle are hidden.</p>
                </div>
              </div>
            </div>

            {/* Favicon Section */}
            <div className="p-6 space-y-4">
              <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <span>Favicon Icon</span>
              </h2>
              <p className="text-xs text-zinc-500">Customize the browser tab icon. Favicons appear next to the application title on browser tabs and bookmark shortcuts.</p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Preview Box */}
                <div className="h-14 w-14 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden shadow-inner shrink-0 relative group">
                  {favicon ? (
                    <>
                      <img src={favicon} alt="Favicon Preview" className="h-8 w-8 object-contain" />
                      <button
                        type="button"
                        onClick={() => setFavicon(null)}
                        className="absolute top-0.5 right-0.5 h-4.5 w-4.5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-zinc-400 p-1">
                      <span className="text-[8px] font-bold block uppercase">Default</span>
                    </div>
                  )}
                </div>

                {/* Upload Input */}
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-200 hover:border-brand-orange text-zinc-700 hover:text-brand-orange rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer bg-white">
                    <Upload className="h-4 w-4" />
                    <span>Choose Favicon File</span>
                    <input
                      type="file"
                      accept="image/png, image/x-icon, .ico"
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="block text-[10px] text-zinc-400 mt-1.5">Recommended format: 32x32px or 16x16px .ico or .png file.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <Settings className="h-5 w-5 text-brand-orange" />
                Order Workflow Rules
              </h2>
              <p className="text-xs text-zinc-550 mt-1">Configure task validation rules and safety buffer windows for order processing staff members.</p>
            </div>
            
              <div className="max-w-md space-y-4">
              
                {/* Re-upload Buffer Window */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    <span>Re-upload Buffer Window</span>
                    <span className="bg-orange-50 border border-orange-100 px-2.5 py-1 rounded text-brand-orange font-mono text-xs">{reuploadBufferTime} Minutes</span>
                  </div>
                  
                  <input
                    type="range"
                    min="1"
                    max="120"
                    value={reuploadBufferTime}
                    onChange={(e) => setReuploadBufferTime(parseInt(e.target.value))}
                    className="w-full accent-brand-orange h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                  />
                  
                  <div className="flex justify-between text-[9px] text-zinc-450 font-bold font-mono">
                    <span>1 MIN</span>
                    <span>30 MIN</span>
                    <span>60 MIN</span>
                    <span>90 MIN</span>
                    <span>120 MIN</span>
                  </div>
                </div>

                {/* Max Re-upload Count */}
                <div className="space-y-2 pt-4 border-t border-zinc-100">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    <span>Max Re-uploads Per Stage</span>
                    <span className={`px-2.5 py-1 rounded font-mono text-xs border font-bold ${
                      maxReuploadCount === 0
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-orange-50 border-orange-100 text-brand-orange'
                    }`}>
                      {maxReuploadCount === 0 ? 'NO EDITS' : `${maxReuploadCount} ${maxReuploadCount === 1 ? 'EDIT' : 'EDITS'}`}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={maxReuploadCount}
                    onChange={(e) => setMaxReuploadCount(parseInt(e.target.value))}
                    className="w-full accent-brand-orange h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                  />

                  <div className="flex justify-between text-[9px] text-zinc-450 font-bold font-mono">
                    <span>0 (LOCK)</span>
                    <span>2</span>
                    <span>5</span>
                    <span>7</span>
                    <span>10</span>
                  </div>

                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] text-zinc-600 space-y-1 leading-relaxed">
                    <p><b className="text-zinc-800">0 (Lock):</b> No edits allowed after first upload — buffer window won&apos;t appear.</p>
                    <p><b className="text-zinc-800">1–10:</b> Staff can re-upload this many times within the buffer window. Once the limit is reached, the edit button disappears permanently for that order stage.</p>
                  </div>
                </div>
              
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-zinc-800">How this buffer window works:</h4>
                  <ul className="list-disc pl-4 text-[10px] text-zinc-650 space-y-1.5 leading-relaxed">
                    <li>When a staff member uploads a file (Delivery Challan, Invoice, Tracking ID), they have this buffer time to re-upload or correct any mistakes.</li>
                    <li>During this countdown window, the order remains hidden/locked for the next stage&apos;s staff member to ensure data integrity.</li>
                    <li>Once the timer expires, the submission is frozen for the sender and unlocked for the next person in line.</li>
                  </ul>
                </div>
              </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50 cursor-pointer animate-fade-in"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
