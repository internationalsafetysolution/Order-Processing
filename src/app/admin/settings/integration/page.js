'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, Server, Shield, Lock, RefreshCw, AlertCircle, 
  CheckCircle2, Send, Eye, EyeOff, Play, Save, Settings, Info
} from 'lucide-react';

export default function IntegrationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('smtp'); // 'smtp' | 'templates'
  
  // SMTP Config Form States
  const [host, setHost] = useState('');
  const [port, setPort] = useState(587);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [secure, setSecure] = useState('tls'); // 'none' | 'ssl' | 'tls'
  const [senderName, setSenderName] = useState('ISS PORTAL');
  const [senderEmail, setSenderEmail] = useState('');
  
  // Mail Templates States
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [notifyAdmin, setNotifyAdmin] = useState(true);
  const [notifyStaff1, setNotifyStaff1] = useState(true);
  const [notifyStaff2, setNotifyStaff2] = useState(true);
  const [notifyStaff3, setNotifyStaff3] = useState(true);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Test Email State
  const [testEmail, setTestEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Global message banner
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // SMTP Test Progress States
  const [testRun, setTestRun] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState(-1);
  const [testStages, setTestStages] = useState([
    { name: "TCP Connection", status: "pending", detail: "Waiting to connect..." },
    { name: "SMTP Handshake (EHLO)", status: "pending", detail: "Waiting for greeting..." },
    { name: "Secure Upgrade (TLS)", status: "pending", detail: "Waiting for TLS handshake..." },
    { name: "Authentication & Mail Send", status: "pending", detail: "Waiting to authenticate..." }
  ]);

  const fetchSmtpSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings/smtp');
      if (res.ok) {
        const data = await res.json();
        setHost(data.smtp_host || '');
        setPort(data.smtp_port || 587);
        setUser(data.smtp_user || '');
        setPass(data.smtp_pass || '');
        setSecure(data.smtp_secure || 'tls');
        setSenderName(data.smtp_sender_name || 'ISS PORTAL');
        setSenderEmail(data.smtp_sender_email || '');
      }
    } catch (e) {
      console.error('Failed to load SMTP settings:', e);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/settings/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplateKey(data[0].template_key);
          setTemplateSubject(data[0].subject);
          setTemplateBody(data[0].body);
          setNotifyAdmin(data[0].notify_admin === 1);
          setNotifyStaff1(data[0].notify_staff_1 === 1);
          setNotifyStaff2(data[0].notify_staff_2 === 1);
          setNotifyStaff3(data[0].notify_staff_3 === 1);
        }
      }
    } catch (e) {
      console.error('Failed to load email templates:', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchSmtpSettings(), fetchTemplates()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/admin/settings/smtp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp_host: host,
          smtp_port: parseInt(port),
          smtp_user: user,
          smtp_pass: pass,
          smtp_secure: secure,
          smtp_sender_name: senderName,
          smtp_sender_email: senderEmail
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update SMTP configurations');
      }

      setMessage({ text: 'SMTP configurations saved successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateChange = (key) => {
    setSelectedTemplateKey(key);
    const tmpl = templates.find(t => t.template_key === key);
    if (tmpl) {
      setTemplateSubject(tmpl.subject);
      setTemplateBody(tmpl.body);
      setNotifyAdmin(tmpl.notify_admin === 1);
      setNotifyStaff1(tmpl.notify_staff_1 === 1);
      setNotifyStaff2(tmpl.notify_staff_2 === 1);
      setNotifyStaff3(tmpl.notify_staff_3 === 1);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setSavingTemplate(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/admin/settings/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_key: selectedTemplateKey,
          subject: templateSubject,
          body: templateBody,
          notify_admin: notifyAdmin,
          notify_staff_1: notifyStaff1,
          notify_staff_2: notifyStaff2,
          notify_staff_3: notifyStaff3
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update email template');
      }

      setTemplates(prev => prev.map(t => {
        if (t.template_key === selectedTemplateKey) {
          return { 
            ...t, 
            subject: templateSubject, 
            body: templateBody,
            notify_admin: notifyAdmin ? 1 : 0,
            notify_staff_1: notifyStaff1 ? 1 : 0,
            notify_staff_2: notifyStaff2 ? 1 : 0,
            notify_staff_3: notifyStaff3 ? 1 : 0
          };
        }
        return t;
      }));

      setMessage({ text: 'Email template saved successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSavingTemplate(false);
    }
  };

  const runSmtpTest = async (e) => {
    e.preventDefault();
    if (!testEmail) {
      alert('Please specify a destination email address to run the connection test.');
      return;
    }

    setTesting(true);
    setTestRun(true);
    setActiveStageIdx(0);
    setMessage({ text: '', type: '' });
    
    setTestStages([
      { name: "TCP Connection", status: "loading", detail: "Resolving host and establishing socket connection..." },
      { name: "SMTP Handshake (EHLO)", status: "pending", detail: "Awaiting SMTP greeting response..." },
      { name: "Secure Upgrade (TLS)", status: "pending", detail: "Waiting to establish secure TLS channel..." },
      { name: "Authentication & Mail Send", status: "pending", detail: "Awaiting authentication and test transmission..." }
    ]);

    try {
      const response = await fetch('/api/admin/settings/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp_host: host,
          smtp_port: parseInt(port),
          smtp_user: user,
          smtp_pass: pass,
          smtp_secure: secure,
          smtp_sender_name: senderName,
          smtp_sender_email: senderEmail,
          test_email: testEmail
        })
      });

      const result = await response.json();
      
      await new Promise(r => setTimeout(r, 1200));
      if (result.stages[0].status === 'failed') {
        updateStageUI(0, 'failed', result.stages[0].detail);
        throw new Error('Connection failed on Stage 1');
      }
      updateStageUI(0, 'success', result.stages[0].detail);
      
      setActiveStageIdx(1);
      updateStageStatus(1, 'loading', 'Sending EHLO handshake command...');
      await new Promise(r => setTimeout(r, 1200));
      if (result.stages[1].status === 'failed') {
        updateStageUI(1, 'failed', result.stages[1].detail);
        throw new Error('Handshake failed on Stage 2');
      }
      updateStageUI(1, 'success', result.stages[1].detail);

      setActiveStageIdx(2);
      updateStageStatus(2, 'loading', 'Upgrading socket to secure TLS channel...');
      await new Promise(r => setTimeout(r, 1200));
      if (result.stages[2].status === 'failed') {
        updateStageUI(2, 'failed', result.stages[2].detail);
        throw new Error('Security negotiation failed on Stage 3');
      }
      updateStageUI(2, 'success', result.stages[2].detail);

      setActiveStageIdx(3);
      updateStageStatus(3, 'loading', 'Logging in and transmitting test payload...');
      await new Promise(r => setTimeout(r, 1200));
      if (result.stages[3].status === 'failed') {
        updateStageUI(3, 'failed', result.stages[3].detail);
        throw new Error('Authentication/Transmission failed on Stage 4');
      }
      updateStageUI(3, 'success', result.stages[3].detail);
      setActiveStageIdx(4);
      setMessage({ text: 'All connection checks passed! Test mail sent successfully.', type: 'success' });
      
    } catch (err) {
      setMessage({ text: `SMTP Test failed: ${err.message}`, type: 'error' });
    } finally {
      setTesting(false);
    }
  };

  const updateStageStatus = (idx, status, detail) => {
    setTestStages(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], status, detail };
      return copy;
    });
  };

  const updateStageUI = (idx, status, detail) => {
    setTestStages(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], status, detail };
      if (status === 'failed') {
        for (let i = idx + 1; i < copy.length; i++) {
          copy[i] = { ...copy[i], status: 'skipped', detail: 'Skipped due to previous error' };
        }
      }
      return copy;
    });
  };

  const renderPreview = (txt) => {
    if (!txt) return '';
    return txt
      .replace(/\[order_id\]/g, '5')
      .replace(/\[client_name\]/g, 'Ali Hassan')
      .replace(/\[order_type\]/g, 'Refilling Service')
      .replace(/\[qty\]/g, '250')
      .replace(/\[po_no\]/g, 'PO-99281')
      .replace(/\[deadline_date\]/g, '17-Jul-2026')
      .replace(/\[receiver_name\]/g, 'Zeeshan Khan')
      .replace(/\[courier_id\]/g, 'TRK-4819028')
      .replace(/\[stage_number\]/g, '2')
      .replace(/\[buffer_time\]/g, '20 mins')
      .replace(/\[completion_time\]/g, new Date().toLocaleTimeString())
      .replace(/\[user_name\]/g, 'Badar Munir')
      .replace(/\[user_email\]/g, 'badar@company.com')
      .replace(/\[temp_password\]/g, '12345678')
      .replace(/\[portal_url\]/g, 'https://portal.company.com');
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-500">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-brand-orange mb-3" />
        <p className="text-sm">Loading integration configuration details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-brand-black tracking-tight font-sans">Integration Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Configure external email notifications, SMTP servers, and communication bridges.</p>
      </div>

      {/* Integration Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('smtp')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'smtp'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          SMTP Outbound Mailer
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('templates');
            setMessage({ text: '', type: '' });
          }}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'templates'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          MAIL Temp
        </button>
      </div>

      {/* Status Messages */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-2.5 text-sm border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-brand-green' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* SMTP CONFIGURATION TAB */}
      {activeTab === 'smtp' && (
        <div className="w-full space-y-6">
          {/* Top: SMTP Config Form */}
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-5">
              <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
                <Server className="h-5 w-5 text-brand-orange" />
                SMTP Connection Parameters
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {/* Host */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">SMTP Host / Server</label>
                  <div className="relative">
                    <Server className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="e.g. smtp.gmail.com"
                      className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                    />
                  </div>
                </div>

                {/* Port */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Port</label>
                  <input
                    type="number"
                    required
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value))}
                    placeholder="e.g. 587"
                    className="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Encryption */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Security / Encryption</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
                    <select
                      value={secure}
                      onChange={(e) => setSecure(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                    >
                      <option value="tls">STARTTLS (Port 587)</option>
                      <option value="ssl">SSL/TLS (Port 465)</option>
                      <option value="none">None / Unencrypted (Port 25)</option>
                    </select>
                  </div>
                </div>

                {/* Sender Name */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Sender Display Name</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. ISS Notification"
                    className="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>
              </div>

              {/* Sender Email */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Sender From Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="e.g. alerts@company.com"
                    className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-150 pt-4 space-y-4">
                <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Authentication Credentials</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Username / Login ID</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
                      <input
                        type="text"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        placeholder="e.g. billing@company.com"
                        className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Password / App Passcode</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        placeholder="••••••••••••"
                        className="block w-full pl-10 pr-10 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 flex items-start gap-1.5 bg-zinc-50 p-2.5 rounded-lg border border-zinc-150">
                  <Info className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
                  <span>If using Gmail or Outlook, create an "App Password" under your Account Security panel instead of your primary login passcode to allow external routing.</span>
                </p>
              </div>

              <div className="border-t border-zinc-150 pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving || testing}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4.5 w-4.5" />}
                  <span>Save Mail Settings</span>
                </button>
              </div>
            </div>
          </form>

          {/* Middle: Connection Audit Tool form (Landscape) */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
            <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Send className="h-5 w-5 text-brand-orange animate-pulse" />
              Connection Audit Tool
            </h2>

            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Test Destination Email</label>
                <div className="relative">
                  <Send className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="e.g. test@gmail.com"
                    className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>
              </div>

              <button
                onClick={runSmtpTest}
                disabled={testing || saving || !host}
                className="w-full md:w-auto px-6 py-2 bg-brand-orange hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-orange-500/10 h-[38px] flex items-center justify-center gap-2 shrink-0"
              >
                {testing ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <Play className="h-4.5 w-4.5" />}
                <span>Test & Connect Outbound</span>
              </button>
            </div>
          </div>

          {/* Dynamic Horizontal Progress Timeline (Landscape) */}
          {testRun && (
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 space-y-6 animate-fade-in">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 pb-3">
                <Settings className={`h-4 w-4 ${testing ? 'animate-spin text-brand-orange' : 'text-zinc-400'}`} />
                Outbound Verification Pipeline (Landscape Auditing)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                {testStages.map((stage, idx) => {
                  const isColored = idx <= activeStageIdx;
                  
                  // Define statuses colors
                  let borderClass = 'border-zinc-200 bg-zinc-50/50';
                  let iconColor = 'text-zinc-400';
                  let titleColor = 'text-zinc-500';
                  let detailColor = 'text-zinc-400';
                  
                  if (isColored) {
                    if (stage.status === 'success') {
                      borderClass = 'border-green-200 bg-green-50/20';
                      iconColor = 'text-brand-green';
                      titleColor = 'text-zinc-950';
                      detailColor = 'text-zinc-600';
                    } else if (stage.status === 'failed') {
                      borderClass = 'border-red-200 bg-red-50/20';
                      iconColor = 'text-red-600';
                      titleColor = 'text-red-700';
                      detailColor = 'text-red-600 font-medium';
                    } else if (stage.status === 'loading') {
                      borderClass = 'border-brand-orange bg-orange-50/10 ring-1 ring-brand-orange';
                      iconColor = 'text-brand-orange';
                      titleColor = 'text-zinc-950';
                      detailColor = 'text-zinc-700';
                    }
                  }

                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col items-center text-center p-5 border rounded-2xl relative transition-all duration-300 ${borderClass} ${
                        !isColored ? 'opacity-40 grayscale' : 'opacity-100'
                      }`}
                    >
                      {/* Step Connector Line (only between steps in desktop) */}
                      {idx < 3 && (
                        <div className="hidden md:block absolute top-10 left-[calc(50%+24px)] w-[calc(100%-36px)] h-0.5 bg-zinc-150 z-0">
                          <div className={`h-full bg-brand-orange transition-all duration-700 ${
                            idx < activeStageIdx ? 'w-full' : 'w-0'
                          }`} />
                        </div>
                      )}

                      {/* Icon Circle */}
                      <div className="h-10 w-10 rounded-full flex items-center justify-center border bg-white shadow-sm z-10 mb-3.5 shrink-0">
                        {stage.status === 'success' && (
                          <CheckCircle2 className="h-5 w-5 text-brand-green" />
                        )}
                        {stage.status === 'failed' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        {stage.status === 'loading' && (
                          <RefreshCw className="h-4.5 w-4.5 text-brand-orange animate-spin" />
                        )}
                        {stage.status === 'pending' && (
                          <span className="font-bold text-zinc-400 text-xs">{idx + 1}</span>
                        )}
                        {stage.status === 'skipped' && (
                          <span className="font-bold text-zinc-300 text-xs">✕</span>
                        )}
                      </div>

                      {/* Text Details */}
                      <div className="space-y-1">
                        <h4 className={`text-xs font-extrabold ${titleColor}`}>{stage.name}</h4>
                        <p className={`text-[10px] leading-relaxed ${detailColor}`}>
                          {stage.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EMAIL TEMPLATES TAB */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Customizer Panel Title Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-brand-orange" />
                  Email Notification Templates Customizer
                </h2>
                <p className="text-zinc-500 text-xs mt-1">Configure layout markup and custom fields sent out automatically during order updates.</p>
              </div>

              {/* Template Selector Dropdown */}
              <div className="w-full md:w-80 shrink-0">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Select Template to Customize</label>
                <select
                  value={selectedTemplateKey}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange font-bold text-zinc-800"
                >
                  {templates.map(t => (
                    <option key={t.template_key} value={t.template_key}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Editor and Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left side: Subject & Body Markup Form */}
            <form onSubmit={handleSaveTemplate} className="space-y-6">
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 space-y-5">
                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-2.5">
                  Template Content Editor
                </h3>

                {/* Subject Line */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Email Subject Line</label>
                  <input
                    type="text"
                    required
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>

                {/* Allowed Notification Recipients */}
                <div className="bg-zinc-50/50 border border-zinc-200/80 rounded-xl p-4 space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Allowed Notification Recipients
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Toggle which roles/people will receive this email notification.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Admin */}
                    <label className="flex items-center gap-2.5 px-3 py-2 bg-white border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-all select-none">
                      <input 
                        type="checkbox" 
                        checked={notifyAdmin} 
                        onChange={(e) => setNotifyAdmin(e.target.checked)}
                        className="rounded border-zinc-300 text-brand-orange focus:ring-brand-orange h-4 w-4 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-semibold text-zinc-800">Admin</span>
                        <span className="block text-[9px] text-zinc-400 leading-tight">Master notification alerts</span>
                      </div>
                    </label>

                    {/* Stage 1 Staff */}
                    <label className="flex items-center gap-2.5 px-3 py-2 bg-white border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-all select-none">
                      <input 
                        type="checkbox" 
                        checked={notifyStaff1} 
                        onChange={(e) => setNotifyStaff1(e.target.checked)}
                        className="rounded border-zinc-300 text-brand-orange focus:ring-brand-orange h-4 w-4 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-semibold text-zinc-800">Stage 1 Staff</span>
                        <span className="block text-[9px] text-zinc-400 leading-tight">Production & Delivery (DC)</span>
                      </div>
                    </label>

                    {/* Stage 2 Staff */}
                    <label className="flex items-center gap-2.5 px-3 py-2 bg-white border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-all select-none">
                      <input 
                        type="checkbox" 
                        checked={notifyStaff2} 
                        onChange={(e) => setNotifyStaff2(e.target.checked)}
                        className="rounded border-zinc-300 text-brand-orange focus:ring-brand-orange h-4 w-4 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-semibold text-zinc-800">Stage 2 Staff</span>
                        <span className="block text-[9px] text-zinc-400 leading-tight">Accounts & Invoicing</span>
                      </div>
                    </label>

                    {/* Stage 3 Staff */}
                    <label className="flex items-center gap-2.5 px-3 py-2 bg-white border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-all select-none">
                      <input 
                        type="checkbox" 
                        checked={notifyStaff3} 
                        onChange={(e) => setNotifyStaff3(e.target.checked)}
                        className="rounded border-zinc-300 text-brand-orange focus:ring-brand-orange h-4 w-4 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-semibold text-zinc-800">Stage 3 Staff</span>
                        <span className="block text-[9px] text-zinc-400 leading-tight">Logistics & Courier</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* HTML Body Markup Editor */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Email HTML Markup Body</label>
                  <textarea
                    required
                    rows={12}
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    placeholder="Enter template body (HTML/CSS supported)"
                    className="block w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange font-mono text-xs leading-relaxed"
                  />
                </div>

                {/* Variable Tokens Badges Helper */}
                <div className="space-y-2.5 bg-zinc-50 p-4 rounded-xl border border-zinc-150">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Available Variables (Click to Insert)</span>
                  <div className="flex flex-wrap gap-2">
                    {templates.find(t => t.template_key === selectedTemplateKey)?.variables.split(',').map(v => {
                      const varToken = `[${v.trim()}]`;
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            setTemplateBody(prev => prev + ' ' + varToken);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-zinc-200 hover:border-orange-200 text-zinc-700 hover:text-brand-orange text-[10px] font-bold rounded-lg shadow-sm transition-all"
                        >
                          {varToken}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-zinc-400">Clicking any badge will append the placeholder tag directly to your email body markup.</p>
                </div>

                {/* Save button */}
                <div className="border-t border-zinc-100 pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingTemplate}
                    className="flex items-center justify-center gap-2 px-5 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {savingTemplate ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>Save Template Changes</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Right side: Simulated Mailbox HTML Preview */}
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-2.5">
                Real-time Sandbox Preview
              </h3>

              <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                {/* Simulated Webmail Top Bar */}
                <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 space-y-1 shrink-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium">
                    <span className="font-bold text-zinc-800">From:</span> {senderName} &lt;{senderEmail || 'alerts@company.com'}&gt;
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium truncate">
                    <span className="font-bold text-zinc-800">Subject:</span> {renderPreview(templateSubject)}
                  </div>
                </div>

                {/* Sandbox Email Body */}
                <div className="p-6 bg-white min-h-[320px] overflow-y-auto">
                  <div 
                    className="prose prose-sm font-sans"
                    dangerouslySetInnerHTML={{
                      __html: renderPreview(templateBody)
                    }}
                  />
                </div>
              </div>
              <p className="text-[9px] text-zinc-400 text-center font-medium">
                Live sandbox renders mock parameters ([order_id] → 5, etc.) to inspect final markup styling.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
