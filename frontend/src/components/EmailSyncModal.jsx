import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  Zap, 
  Copy, 
  Check, 
  Send, 
  Key, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Lock,
  Globe
} from 'lucide-react';
import { api } from '../services/api';

export default function EmailSyncModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  trackerItems = [], 
  onTriggerEmailEvent, 
  onShowToast 
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('direct-gmail'); // 'direct-gmail' | 'forwarding-real' | 'simulator'
  const [copied, setCopied] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(trackerItems[0]?.id || trackerItems[0]?._id || '');
  const [testSender, setTestSender] = useState('notifications@unstop.com');
  const [testSubject, setTestSubject] = useState('Round 1 Shortlist Results Announced! Check Problem Submission.');

  // Direct Gmail IMAP Sync State
  const [gmailAppPass, setGmailAppPass] = useState('');
  const [isSyncingGmail, setIsSyncingGmail] = useState(false);
  const [gmailSyncResult, setGmailSyncResult] = useState(null);

  const userEmail = currentUser?.email || 'shivamkeshari990@gmail.com';
  const webhookUrl = `https://career-644s.onrender.com/api/webhook/email-inbound`;

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast?.('Copied to clipboard!');
  };

  const handleSendTestPayload = (e) => {
    e.preventDefault();
    if (!selectedItemId) return;

    onTriggerEmailEvent({
      itemId: selectedItemId,
      hackathonId: selectedItemId,
      sender: testSender,
      subject: testSubject
    });

    onClose();
  };

  const handleSyncGmail = async (e) => {
    e.preventDefault();
    if (!gmailAppPass.trim()) {
      onShowToast?.('⚠️ Please enter your 16-character Google App Password.');
      return;
    }
    setIsSyncingGmail(true);
    setGmailSyncResult(null);

    try {
      const res = await api.syncGmail({
        userEmail: userEmail,
        appPassword: gmailAppPass.trim(),
        trackerItems: trackerItems
      });
      setGmailSyncResult(res);
      onShowToast?.(`🎉 ${res.message || 'Gmail Sync Successful!'}`);

      if (res.alerts && res.alerts.length > 0) {
        res.alerts.forEach(alert => {
          onTriggerEmailEvent?.({
            itemId: alert.id || alert.itemId,
            hackathonId: alert.id || alert.itemId,
            name: alert.name,
            sender: alert.sender,
            subject: alert.subject
          });
        });
      }
    } catch (err) {
      onShowToast?.(`❌ ${err.message}`);
      setGmailSyncResult({ error: err.message });
    } finally {
      setIsSyncingGmail(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-dark-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 flex-shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Email Integration Hub</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Connect your Gmail account (<span className="text-cyan-300 font-mono">{userEmail}</span>) to automatically detect updates for Hackathons, Jobs & Internships.
            </p>
          </div>
        </div>

        {/* DNS / MX Bounce Warning Callout */}
        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block mb-0.5">Kyun aaya "DNS Error / NXDOMAIN (Address not found)"?</span>
            Gmail internet par kisi bhi email ko bhejte waqt us domain ka <strong>MX (Mail Server) Record</strong> check karta hai. Dummy domain jaise <code className="text-amber-100 font-mono">inbound.devradar.app</code> ka real MX record na hone ke karan Gmail ne use reject kar diya.
            Neeche diye gaye <strong>Direct Gmail Sync</strong> ya <strong>Live Simulator</strong> se ye 100% bina bounce ke chalta hai!
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-dark-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('direct-gmail')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'direct-gmail'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>1. Direct Gmail Sync (Recommended)</span>
          </button>
          <button
            onClick={() => setActiveTab('forwarding-real')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'forwarding-real'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>2. Real Email Forwarder</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>3. Instant Simulator</span>
          </button>
        </div>

        {/* TAB 1: Direct Gmail IMAP Sync */}
        {activeTab === 'direct-gmail' && (
          <div className="space-y-4 text-xs text-slate-300 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-dark-950 flex items-center justify-center font-bold text-xs">1</span>
                  <span>Google App Password se Direct Gmail Link Karein:</span>
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  No Bounce • No Domain Needed
                </span>
              </div>

              <div className="space-y-2 text-slate-400 pl-7 text-[11.5px] leading-relaxed">
                <p>
                  1. Apne Google Account ke App Passwords page par jaayein:{' '}
                  <a 
                    href="https://myaccount.google.com/apppasswords" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-cyan-400 underline font-medium hover:text-cyan-300 inline-flex items-center gap-1"
                  >
                    myaccount.google.com/apppasswords <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                <p>2. App name mein <strong>DevRadar</strong> likhein aur <strong>Create</strong> dabayein.</p>
                <p>3. Google aapko 16-character ka App Password dega (e.g. <code className="text-cyan-300 font-mono">abcd efgh ijkl mnop</code>). Use neeche paste karein:</p>
              </div>

              <form onSubmit={handleSyncGmail} className="space-y-3 pl-7 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Your Gmail Address</label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">16-Character Google App Password *</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="e.g. abcd efgh ijkl mnop"
                      value={gmailAppPass}
                      onChange={(e) => setGmailAppPass(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-200 font-mono tracking-widest focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={isSyncingGmail}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-bold text-xs text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-60 transition-all flex-shrink-0"
                    >
                      {isSyncingGmail ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Sync Inbox Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Result Callout */}
              {gmailSyncResult && (
                <div className={`mt-3 p-3 rounded-xl border text-xs ${
                  gmailSyncResult.error 
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-300' 
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                }`}>
                  {gmailSyncResult.error ? (
                    <div>❌ {gmailSyncResult.error}</div>
                  ) : (
                    <div>
                      ✅ {gmailSyncResult.message} 
                      {gmailSyncResult.matchedCount > 0 && (
                        <span className="block mt-1 font-bold text-white">
                          🎉 {gmailSyncResult.matchedCount} opportunities matched and marked as UnRead!
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Real Forwarding via Free Webhook Services */}
        {activeTab === 'forwarding-real' && (
          <div className="space-y-4 text-xs text-slate-300 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800/80 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-dark-950 flex items-center justify-center font-bold text-xs">2</span>
                <span>Real Email Forwarder Setup (With Active MX Records):</span>
              </h4>
              <p className="text-slate-400 leading-relaxed pl-7">
                Gmail se auto-forwarding karne ke liye aise service ka email address chahiye hota hai jiska global MX record ho:
              </p>

              <div className="space-y-2.5 pl-7">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <span>Option A: Webhook.site (Instant & Free Email-to-Webhook)</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    1. <a href="https://webhook.site" target="_blank" rel="noreferrer" className="text-cyan-400 underline">webhook.site</a> par jaayein. Wahan aapko ek free email milta hai (e.g. <code className="text-cyan-300 font-mono">abc@email.webhook.site</code>).
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    2. Gmail us email ko 100% accept karta hai kyunki uska MX DNS record verified hai!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-purple-300 flex items-center gap-1.5">
                    <span>Option B: Direct Webhook Endpoint</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Agar aap Zapier, Make.com, n8n ya Python script use karte hain, toh HTTP POST payload yahan send karein:
                  </p>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-dark-950 border border-slate-800 font-mono text-[11px] text-purple-300 mt-1">
                    <span className="truncate">{webhookUrl}</span>
                    <button
                      onClick={() => handleCopy(webhookUrl)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-sans text-[11px] flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Instant Live Test Simulator */}
        {activeTab === 'simulator' && (
          <div className="space-y-4 text-xs text-slate-300 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Instant 1-Click Test (No Setup Required):</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  Instant Feedback
                </span>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed">
                Kisi bhi setup ke bina check karein ki jab email aata hai toh kaise Hackathon, Job ya Internship row turant <strong className="text-amber-400">UnRead (✔)</strong> tick ho jati hai:
              </p>

              <form onSubmit={handleSendTestPayload} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Target Opportunity *</label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedItemId(id);
                        const item = trackerItems.find(i => i.id === id || i._id === id);
                        if (item) {
                          const cleanDomain = (item.company || 'company').toLowerCase().replace(/[^a-z0-9]/g, '');
                          if (item.type === 'job') {
                            setTestSender(`careers@${cleanDomain || 'tech'}.com`);
                            setTestSubject(`Invitation to Online Assessment (OA) for ${item.name}`);
                          } else if (item.type === 'internship') {
                            setTestSender(`university-hiring@${cleanDomain || 'tech'}.com`);
                            setTestSubject(`Application Status: Shortlisted for ${item.name}`);
                          } else {
                            setTestSender('notifications@unstop.com');
                            setTestSubject(`Important Update: Problem Statement Submission Open for ${item.name}`);
                          }
                        }
                      }}
                      className="w-full bg-dark-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      {trackerItems.map((item) => (
                        <option key={item._id || item.id} value={item._id || item.id}>
                          {item.type === 'job' ? '💼 [JOB]' : item.type === 'internship' ? '🎓 [INTERNSHIP]' : '🚀 [HACKATHON]'} {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Sender Email *</label>
                    <input
                      type="email"
                      value={testSender}
                      onChange={(e) => setTestSender(e.target.value)}
                      className="w-full bg-dark-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Incoming Email Subject *</label>
                  <input
                    type="text"
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-bold text-xs text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all mt-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email Alert (Activate UnRead Tick)</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>DevRadar Email Parser v2.0 • TLS 1.3 Encrypted</span>
          <button 
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
