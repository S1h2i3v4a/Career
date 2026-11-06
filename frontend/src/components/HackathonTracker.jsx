import React, { useState } from 'react';
import { 
  ExternalLink, 
  Trash2, 
  Check, 
  Mail, 
  Calendar, 
  Clock, 
  Plus, 
  BellRing, 
  AlertCircle,
  Sparkles,
  CheckCheck
} from 'lucide-react';

export default function HackathonTracker({ 
  trackerItems, 
  setTrackerItems, 
  onShowToast 
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newHackathon, setNewHackathon] = useState({
    name: '',
    link: '',
    lastDateApply: '',
    lastDateSubmission: ''
  });

  // Reference date: today (normalized to start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if dates have expired
  const isExpired = (item) => {
    const targetDateStr = item.lastDateSubmission || item.lastDateApply;
    if (!targetDateStr) return false;
    const targetDate = new Date(targetDateStr);
    targetDate.setHours(23, 59, 59, 999);
    return targetDate < today;
  };

  // Mark item as READ
  const handleMarkRead = (id) => {
    setTrackerItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'read',
          hasNewEmail: false,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));
    onShowToast?.('✓ Marked as Read (Notification cleared)');
  };

  // Mark item as UNREAD
  const handleMarkUnread = (id) => {
    setTrackerItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'unread',
          hasNewEmail: true,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));
    onShowToast?.('🔔 Marked as UnRead (Highlighted with Tick)');
  };

  // Delete item from tracker
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from your tracker?`)) {
      setTrackerItems(prev => prev.filter(item => item.id !== id));
      onShowToast?.(`Deleted "${name}" from tracker`);
    }
  };

  // Add new Hackathon submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newHackathon.name.trim() || !newHackathon.link.trim()) return;

    const newItem = {
      id: `tracker-${Date.now()}`,
      name: newHackathon.name.trim(),
      link: newHackathon.link.trim().startsWith('http') ? newHackathon.link.trim() : `https://${newHackathon.link.trim()}`,
      lastDateApply: newHackathon.lastDateApply || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      lastDateSubmission: newHackathon.lastDateSubmission || new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
      status: 'unread',
      hasNewEmail: true,
      emailNotification: 'New hackathon added to your todo tracker. Updates will appear here!',
      updatedAt: new Date().toISOString()
    };

    setTrackerItems(prev => [newItem, ...prev]);
    setNewHackathon({ name: '', link: '', lastDateApply: '', lastDateSubmission: '' });
    setIsAddOpen(false);
    onShowToast?.('🎉 New Hackathon added to Tracker!');
  };

  // Simulate an incoming email notification for a random active hackathon
  const handleSimulateEmail = () => {
    const activeItems = trackerItems.filter(i => !isExpired(i));
    if (activeItems.length === 0) {
      onShowToast?.('No active hackathons to receive email!');
      return;
    }

    const randomItem = activeItems[Math.floor(Math.random() * activeItems.length)];
    const mockSubjects = [
      'Round 1 Shortlist Results Announced! Check your dashboard.',
      'New Problem Statement Released for Team Review.',
      'Mentor Evaluation Schedule updated. Confirm your slot.',
      'Submission Portal is now LIVE for project upload.'
    ];
    const randomSubject = mockSubjects[Math.floor(Math.random() * mockSubjects.length)];

    setTrackerItems(prev => prev.map(item => {
      if (item.id === randomItem.id) {
        return {
          ...item,
          status: 'unread',
          hasNewEmail: true,
          emailNotification: randomSubject,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    onShowToast?.(`📧 New Email received for "${randomItem.name}"! UnRead highlighted with Tick.`);
  };

  return (
    <div className="bg-dark-900/95 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md mb-8">
      {/* Tracker Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Hackathon Todo & Email Tracker
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track deadlines, email notifications, Read/UnRead status & auto-cut expired hackathons.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Email Simulator Button */}
          <button
            onClick={handleSimulateEmail}
            title="Simulate incoming email from hackathon organizer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-dark-950 hover:bg-slate-800 border border-slate-800 text-amber-300 hover:text-amber-200 transition-all hover:border-amber-500/30 shadow-sm"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Simulate Incoming Email</span>
          </button>

          {/* Add Hackathon Button */}
          <button
            onClick={() => setIsAddOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-dark-950 transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddOpen ? 'Close Form' : 'Add Hackathon'}</span>
          </button>
        </div>
      </div>

      {/* Add New Hackathon Form Drawer */}
      {isAddOpen && (
        <form onSubmit={handleAddSubmit} className="mt-5 p-4 rounded-2xl bg-dark-950 border border-cyan-500/30 space-y-3 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Add Hackathon to Todo Tracker</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Hackathon Name *</label>
              <input
                type="text"
                required
                value={newHackathon.name}
                onChange={e => setNewHackathon(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Smart India Hackathon 2026"
                className="w-full bg-dark-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Official Link *</label>
              <input
                type="text"
                required
                value={newHackathon.link}
                onChange={e => setNewHackathon(p => ({ ...p, link: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-dark-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Last Date to Apply *</label>
              <input
                type="date"
                required
                value={newHackathon.lastDateApply}
                onChange={e => setNewHackathon(p => ({ ...p, lastDateApply: e.target.value }))}
                className="w-full bg-dark-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Last Date Submission Problem *</label>
              <input
                type="date"
                required
                value={newHackathon.lastDateSubmission}
                onChange={e => setNewHackathon(p => ({ ...p, lastDateSubmission: e.target.value }))}
                className="w-full bg-dark-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 text-dark-950 hover:bg-cyan-400"
            >
              Save to List
            </button>
          </div>
        </form>
      )}

      {/* Todo Tracker List Table */}
      <div className="mt-5 space-y-3">
        {/* Table Header Row */}
        <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-2.5 rounded-xl bg-dark-950/60 border border-slate-800/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
          <div className="col-span-4 font-bold">Hackathon Name</div>
          <div className="col-span-1 font-bold text-center">Link</div>
          <div className="col-span-2 font-bold">Last Date to Apply</div>
          <div className="col-span-2 font-bold">Last Date Problem Submission</div>
          <div className="col-span-1 font-bold text-center">Read</div>
          <div className="col-span-1 font-bold text-center">UnRead</div>
          <div className="col-span-1 font-bold text-center">Delete</div>
        </div>

        {/* Rows List */}
        <div className="space-y-3">
          {trackerItems.map((item) => {
            const expired = isExpired(item);
            const isRead = item.status === 'read';
            const isUnread = item.status === 'unread';

            return (
              <div
                key={item.id}
                className={`relative rounded-2xl border p-4 transition-all duration-200 overflow-hidden ${
                  expired
                    ? 'bg-rose-950/15 border-rose-900/30 text-slate-500'
                    : 'bg-dark-950/40 hover:bg-slate-800/20 border-slate-800/70 text-slate-200'
                }`}
              >
                {/* MIDDLE CUT-LINE OVERLAY FOR EXPIRED HACKATHONS */}
                {expired && (
                  <div 
                    title="Deadline has passed - Hackathon expired"
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2.5px] bg-gradient-to-r from-rose-500/80 via-rose-500 to-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.9)] pointer-events-none z-30" 
                  />
                )}

                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-3 items-center ${
                  expired ? 'opacity-60 line-through' : ''
                }`}>
                  
                  {/* 1. Hackathon Name */}
                  <div className="lg:col-span-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm tracking-tight ${
                        expired ? 'text-slate-500 line-through' : 'text-white'
                      }`}>
                        {item.name}
                      </span>
                      {expired && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 whitespace-nowrap not-sr-only no-underline">
                          EXPIRED (Date Passed)
                        </span>
                      )}
                    </div>

                    {/* Email Notification Preview */}
                    {item.emailNotification && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                        <Mail className={`w-3.5 h-3.5 flex-shrink-0 ${isUnread ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                        <span className="truncate">{item.emailNotification}</span>
                      </div>
                    )}
                  </div>

                  {/* 2. Link */}
                  <div className="lg:col-span-1 flex lg:justify-center">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        expired
                          ? 'border-slate-800 text-slate-600 pointer-events-none'
                          : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-dark-950 shadow-sm'
                      }`}
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* 3. Last Date to Apply */}
                  <div className="lg:col-span-2 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.lastDateApply}</span>
                    </div>
                  </div>

                  {/* 4. Last Date to Submission Problem */}
                  <div className="lg:col-span-2 text-xs font-mono">
                    <div className={`flex items-center gap-1.5 ${expired ? 'text-slate-500' : 'text-emerald-400 font-semibold'}`}>
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.lastDateSubmission}</span>
                    </div>
                  </div>

                  {/* 5. Read Column (Highlight & Tick) */}
                  <div className="lg:col-span-1 flex lg:justify-center">
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      title="Mark as Read"
                      className={`w-full lg:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        isRead
                          ? 'bg-emerald-500 text-dark-950 shadow-lg shadow-emerald-500/25 scale-105 border-2 border-emerald-300'
                          : 'bg-dark-950 border border-slate-800 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/40'
                      }`}
                    >
                      {isRead && <Check className="w-4 h-4 stroke-[3]" />}
                      <span>Read</span>
                    </button>
                  </div>

                  {/* 6. UnRead Column (Highlight, Notification alert & Tick) */}
                  <div className="lg:col-span-1 flex lg:justify-center">
                    <button
                      onClick={() => handleMarkUnread(item.id)}
                      title="Mark as UnRead"
                      className={`w-full lg:w-auto relative inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        isUnread
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-dark-950 shadow-lg shadow-amber-500/30 scale-105 border-2 border-amber-300'
                          : 'bg-dark-950 border border-slate-800 text-slate-500 hover:text-amber-400 hover:border-amber-500/40'
                      }`}
                    >
                      {isUnread && (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span className="w-2 h-2 rounded-full bg-white absolute -top-1 -right-1 shadow-md shadow-rose-500 animate-ping" />
                        </>
                      )}
                      <span>UnRead</span>
                    </button>
                  </div>

                  {/* 7. Delete Column */}
                  <div className="lg:col-span-1 flex lg:justify-center">
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      title="Delete from list"
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}

          {trackerItems.length === 0 && (
            <div className="py-10 text-center text-slate-500 italic bg-dark-950/40 border border-slate-800/80 rounded-2xl">
              Aapke tracker mein koi hackathon nahi hai. "Add Hackathon" button se naya add karein!
            </div>
          )}
        </div>
      </div>

      {/* Tracker Footer Tips */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Email notification aane par <strong>UnRead</strong> highlight aur tick ho jata hai. Read karne par <strong>Read</strong> tick ho jata hai.
          </span>
        </div>
        <div className="text-slate-500 font-mono">
          Expired hackathons automatically middle line cut ho jaate hain.
        </div>
      </div>
    </div>
  );
}
