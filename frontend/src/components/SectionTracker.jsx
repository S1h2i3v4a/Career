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
  CheckCheck,
  Zap,
  Building2,
  DollarSign,
  Edit3,
  X
} from 'lucide-react';
import { parseOpportunityFromUrl } from '../utils/linkParser';
import { api } from '../services/api';

export default function SectionTracker({ 
  type = 'hackathon', // 'hackathon' | 'job' | 'internship'
  trackerItems, 
  setTrackerItems, 
  onShowToast,
  onAddOpportunityToMainList,
  onDeleteItem,
  onUpdateItem
}) {
  const [pasteUrl, setPasteUrl] = useState('');
  const [isAutoParsing, setIsAutoParsing] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  
  // Inline row editing state
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    company: '',
    link: '',
    lastDateApply: '',
    secondDate: ''
  });

  const handleStartEdit = (item) => {
    const itemId = item._id || item.id;
    setEditingRowId(itemId);
    setEditFormData({
      name: item.name || '',
      company: item.company || '',
      link: item.link || '',
      lastDateApply: item.lastDateApply || '',
      secondDate: item.secondDate || item.lastDateSubmission || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
  };

  const handleSaveEdit = async (itemId) => {
    if (!editFormData.name.trim()) return;

    setTrackerItems(prev => prev.map(item => {
      if (item.id === itemId || item._id === itemId) {
        return {
          ...item,
          name: editFormData.name.trim(),
          company: editFormData.company.trim(),
          link: editFormData.link.trim() || item.link,
          lastDateApply: editFormData.lastDateApply,
          lastDateSubmission: editFormData.secondDate,
          secondDate: editFormData.secondDate,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    if (onUpdateItem) {
      onUpdateItem(itemId, editFormData);
    }

    try {
      const token = localStorage.getItem('devradar_auth_token');
      if (token && itemId.length === 24) {
        await api.updateTracker(itemId, {
          name: editFormData.name.trim(),
          company: editFormData.company.trim(),
          link: editFormData.link.trim(),
          lastDateApply: editFormData.lastDateApply,
          secondDate: editFormData.secondDate
        });
      }
    } catch (err) {
      console.warn('MongoDB update notice:', err.message);
    }

    setEditingRowId(null);
    onShowToast?.(`✓ Updated "${editFormData.name}" successfully!`);
  };
  
  const [manualItem, setManualItem] = useState({
    name: '',
    company: '',
    link: '',
    lastDateApply: '',
    secondDate: ''
  });

  const isHackathon = type === 'hackathon';
  const isJob = type === 'job';
  const isInternship = type === 'internship';

  // Section config based on type
  const config = {
    hackathon: {
      title: 'Hackathon Todo & Email Tracker',
      subtitle: 'Track hackathon deadlines, problem submissions, email updates, and auto-cut expired events.',
      col1: 'Hackathon Name',
      col2: 'Link',
      col3: 'Last Date to Apply',
      col4: 'Last Date Problem Submission',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      accentColor: 'text-cyan-400',
      btnColor: 'bg-cyan-500 hover:bg-cyan-400 text-dark-950',
      sampleUrl: 'https://sih.gov.in or https://devfolio.co/hackathons/ethindia'
    },
    job: {
      title: 'Tech Jobs Application & OA Tracker',
      subtitle: 'Track software engineering jobs, online assessments, interviews, and recruiter emails.',
      col1: 'Job Role & Company',
      col2: 'Apply Link',
      col3: 'Last Date to Apply',
      col4: 'Interview / OA Round Date',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      accentColor: 'text-purple-400',
      btnColor: 'bg-purple-500 hover:bg-purple-400 text-white',
      sampleUrl: 'https://careers.google.com/jobs/sde or https://bytes.swiggy.com'
    },
    internship: {
      title: 'Tech Internships Todo Tracker',
      subtitle: 'Track college internships, stipends, duration, offer letters, and deadline status.',
      col1: 'Internship Role & Company',
      col2: 'Apply Link',
      col3: 'Last Date to Apply',
      col4: 'Stipend & Duration',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      accentColor: 'text-emerald-400',
      btnColor: 'bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold',
      sampleUrl: 'https://careers.microsoft.com/intern or https://internshala.com'
    }
  }[type];

  // Compare deadline with today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isExpired = (item) => {
    const targetDateStr = item.lastDateApply || item.lastDateSubmission || item.secondDate;
    if (!targetDateStr) return false;
    const targetDate = new Date(targetDateStr);
    targetDate.setHours(23, 59, 59, 999);
    return targetDate < today;
  };

  // 1. SMART AUTO-FILL FROM LINK (LIVE REAL-TIME SCRAPING + EXACT TITLES & DATES)
  const handleAutoFillFromUrl = async (e) => {
    e.preventDefault();
    const urlToScrape = pasteUrl.trim();
    if (!urlToScrape) return;

    setIsAutoParsing(true);

    try {
      let scrapedResult = null;

      // 1. First attempt: Live real-time scrape from backend API (Cheerio + Meta + JSON-LD)
      try {
        const response = await api.scrapeLink(urlToScrape, type);
        if (response && response.success && response.data) {
          scrapedResult = response.data;
        }
      } catch (backendErr) {
        console.warn('Backend live scraper notice (using client heuristic fallback):', backendErr.message);
      }

      // 2. Second attempt: Client-side known platform registry & parser fallback
      if (!scrapedResult) {
        scrapedResult = parseOpportunityFromUrl(urlToScrape, type);
      }

      if (!scrapedResult) {
        onShowToast?.('Could not extract details. Please enter a valid URL or use Manual Add.');
        setIsAutoParsing(false);
        return;
      }

      const cleanTitle = scrapedResult.title || scrapedResult.name || `${scrapedResult.company || 'Tech'} Opportunity 2026`;
      const cleanCompany = scrapedResult.company || scrapedResult.org || 'Tech Organization';
      const cleanApplyDate = scrapedResult.lastDateApply || scrapedResult.deadline || new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0];
      const cleanSecondDate = scrapedResult.secondDate || scrapedResult.lastDateSubmission || scrapedResult.submissionDeadline || (
        isHackathon 
          ? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
          : isJob 
          ? 'OA & Interview Scheduled' 
          : '₹50,000/mo • 3-6 Mo'
      );
      const cleanCompensation = scrapedResult.compensation || (
        isHackathon ? '₹3,00,000+ Prize Pool' : isJob ? '₹18 - 28 LPA' : '₹50,000 - ₹80,000 / month'
      );
      const targetUrl = scrapedResult.link || scrapedResult.applyUrl || urlToScrape;
      
      let host = cleanCompany;
      try {
        host = new URL(targetUrl).hostname;
      } catch {}

      const trackerId = `tracker-${type}-${Date.now()}`;

      // Create Tracker Row Item
      const newTrackerEntry = {
        id: trackerId,
        type,
        name: cleanTitle,
        company: cleanCompany,
        link: targetUrl,
        lastDateApply: cleanApplyDate,
        lastDateSubmission: cleanSecondDate,
        secondDate: cleanSecondDate,
        compensation: cleanCompensation,
        tags: scrapedResult.tags || ['Tech', 'Coding'],
        mode: scrapedResult.mode || 'Hybrid',
        status: 'unread',
        hasNewEmail: true,
        emailNotification: `Auto-extracted from ${host}. Live deadline tracked.`,
        updatedAt: new Date().toISOString()
      };

      // Create Website Showcase Card Item (So it appears simultaneously on the website!)
      const newCatalogItem = {
        id: `card-${type}-${Date.now()}`,
        trackerRefId: trackerId,
        type,
        title: cleanTitle,
        org: cleanCompany,
        avatarText: cleanCompany.substring(0, 3).toUpperCase(),
        mode: scrapedResult.mode || 'Hybrid',
        location: scrapedResult.location || (scrapedResult.mode ? `${scrapedResult.mode} (Live)` : 'Hybrid / Remote'),
        compensation: cleanCompensation,
        compLabel: isHackathon ? 'Prize Pool' : isInternship ? 'Monthly Stipend' : 'CTC Package',
        deadline: cleanApplyDate,
        submissionDeadline: cleanSecondDate,
        secondDate: cleanSecondDate,
        experience: scrapedResult.experience || 'Open for All',
        teamSize: isHackathon ? '2 - 4 Members' : 'Individual',
        tags: scrapedResult.tags || ['Tech', 'Coding'],
        description: scrapedResult.description || `Live tracked ${type} opportunity at ${cleanCompany}. Auto-extracted from link.`,
        applyUrl: targetUrl,
        featured: true,
        addedAt: new Date().toISOString().split('T')[0]
      };

      // If user is authenticated, sync tracker row to MongoDB
      try {
        const token = localStorage.getItem('devradar_auth_token');
        if (token) {
          const dbItem = await api.createTracker(newTrackerEntry);
          if (dbItem && dbItem._id) {
            newTrackerEntry._id = dbItem._id;
            newCatalogItem._id = dbItem._id;
          }
        }
      } catch (err) {
        console.warn('MongoDB sync notice (using local storage fallback):', err.message);
      }

      // Add to tracker table
      setTrackerItems(prev => [newTrackerEntry, ...prev]);

      // ALSO synchronize to main website catalog cards showcase!
      if (onAddOpportunityToMainList) {
        onAddOpportunityToMainList(newCatalogItem);
      }

      setPasteUrl('');
      setIsAutoParsing(false);
      onShowToast?.(`⚡ Auto-Filled & Added "${cleanTitle}" to Tracker and Website!`);
    } catch (err) {
      console.error('Auto-fill error:', err);
      setIsAutoParsing(false);
      onShowToast?.('Failed to auto-extract details. Please try Manual Add.');
    }
  };

  // 2. Mark as READ
  const handleMarkRead = async (id) => {
    setTrackerItems(prev => prev.map(item => {
      if (item.id === id || item._id === id) {
        return {
          ...item,
          status: 'read',
          hasNewEmail: false,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    // Sync to MongoDB if authenticated
    try {
      const token = localStorage.getItem('devradar_auth_token');
      if (token && id && id.length === 24) { // Mongo ObjectId length
        await api.updateTracker(id, { status: 'read', hasNewEmail: false });
      }
    } catch (err) {
      console.warn('MongoDB update notice:', err.message);
    }

    onShowToast?.('✓ Marked as Read (Notification cleared)');
  };

  // 3. Mark as UNREAD
  const handleMarkUnread = async (id) => {
    setTrackerItems(prev => prev.map(item => {
      if (item.id === id || item._id === id) {
        return {
          ...item,
          status: 'unread',
          hasNewEmail: true,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    // Sync to MongoDB if authenticated
    try {
      const token = localStorage.getItem('devradar_auth_token');
      if (token && id && id.length === 24) {
        await api.updateTracker(id, { status: 'unread', hasNewEmail: true });
      }
    } catch (err) {
      console.warn('MongoDB update notice:', err.message);
    }

    onShowToast?.('🔔 Marked as UnRead (Highlighted with Tick)');
  };

  // 4. Synchronized Delete (Removes from Tracker AND Website!)
  const handleDelete = async (id, name, link) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from your tracker AND the website showcase?`)) {
      // 1. Remove from local tracker list
      setTrackerItems(prev => prev.filter(item => item.id !== id && item._id !== id));

      // 2. Remove from website catalog (items state in App.jsx)
      if (onDeleteItem) {
        onDeleteItem(id, name, link);
      }

      // 3. Sync to MongoDB if authenticated
      try {
        const token = localStorage.getItem('devradar_auth_token');
        if (token && id && id.length === 24) {
          await api.deleteTracker(id);
        }
      } catch (err) {
        console.warn('MongoDB delete notice:', err.message);
      }

      onShowToast?.(`🗑️ Deleted "${name}" from Tracker & Website!`);
    }
  };

  // 5. Manual add fallback
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualItem.name.trim() || !manualItem.link.trim()) return;

    const newItem = {
      id: `tracker-${type}-${Date.now()}`,
      type,
      name: manualItem.name.trim(),
      company: manualItem.company.trim() || 'Tech Company',
      link: manualItem.link.trim().startsWith('http') ? manualItem.link.trim() : `https://${manualItem.link.trim()}`,
      lastDateApply: manualItem.lastDateApply || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      lastDateSubmission: manualItem.secondDate || new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
      secondDate: manualItem.secondDate || (isHackathon ? '2026-12-15' : isJob ? 'Interview Scheduled' : '₹50,000/mo • 3 Mo'),
      status: 'unread',
      hasNewEmail: true,
      emailNotification: 'New entry manually added to your tracker.',
      updatedAt: new Date().toISOString()
    };

    try {
      const token = localStorage.getItem('devradar_auth_token');
      if (token) {
        const dbItem = await api.createTracker(newItem);
        if (dbItem && dbItem._id) newItem._id = dbItem._id;
      }
    } catch (err) {
      console.warn('MongoDB create notice:', err.message);
    }

    setTrackerItems(prev => [newItem, ...prev]);
    setManualItem({ name: '', company: '', link: '', lastDateApply: '', secondDate: '' });
    setIsManualAddOpen(false);
    onShowToast?.(`Added "${newItem.name}" to Tracker!`);
  };

  // 6. Simulate email
  const handleSimulateEmail = () => {
    const activeItems = trackerItems.filter(i => !isExpired(i));
    if (activeItems.length === 0) {
      onShowToast?.('No active entries to receive email!');
      return;
    }

    const randomItem = activeItems[Math.floor(Math.random() * activeItems.length)];
    const mockSubjects = isHackathon ? [
      'Round 1 Shortlist Results Announced! Check problem portal.',
      'New Problem Statement Released for Team Review.',
      'Mentor Evaluation Schedule updated. Confirm slot.'
    ] : isJob ? [
      'Recruiting Team: Online Assessment link sent for SDE role.',
      'Interview Scheduled: Technical discussion with Engineering Manager.',
      'Application Status Update: Moved to Final Interview Round.'
    ] : [
      'Student Programs: Please complete the Coding Challenge.',
      'Internship Selection Committee: Interview scheduled.',
      'Offer Letter Released: Please sign and confirm your slot.'
    ];

    const randomSubject = mockSubjects[Math.floor(Math.random() * mockSubjects.length)];

    setTrackerItems(prev => prev.map(item => {
      if (item.id === randomItem.id || item._id === randomItem._id) {
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
                {config.title}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${config.badgeColor}`}>
                  {trackerItems.length} Tracked
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {config.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Email Simulator Button */}
          <button
            onClick={handleSimulateEmail}
            title="Simulate incoming email notification"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-dark-950 hover:bg-slate-800 border border-slate-800 text-amber-300 hover:text-amber-200 transition-all hover:border-amber-500/30 shadow-sm"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Simulate Email Alert</span>
          </button>

          {/* Manual Form Toggle */}
          <button
            onClick={() => setIsManualAddOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-dark-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
          >
            <Plus className="w-4 h-4" />
            <span>{isManualAddOpen ? 'Close Form' : 'Manual Add'}</span>
          </button>
        </div>
      </div>

      {/* ⚡ SMART "PASTE LINK & AUTO-FILL" TOOLBAR ⚡ */}
      <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-dark-950 via-slate-900 to-dark-950 border border-cyan-500/30 shadow-lg">
        <form onSubmit={handleAutoFillFromUrl} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full flex-1">
            <Zap className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              placeholder={`🔗 Sirf link paste karein (e.g. ${config.sampleUrl})...`}
              className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={isAutoParsing}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${config.btnColor}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAutoParsing ? 'Extracting Details...' : '⚡ Auto-Fill & Add'}</span>
          </button>
        </form>
        <p className="text-[11px] text-slate-400 mt-2 px-1 flex items-center gap-1">
          <span className="text-cyan-400 font-bold">Smart Auto-Detect:</span> 
          <span>Link paste karte hi website Company, Title, Deadlines, aur Tags khud auto-fill karke list me daal degi!</span>
        </p>
      </div>

      {/* Manual Input Form Drawer */}
      {isManualAddOpen && (
        <form onSubmit={handleManualSubmit} className="mt-4 p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-3 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Manual Add Entry:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Title / Role *</label>
              <input
                type="text"
                required
                value={manualItem.name}
                onChange={e => setManualItem(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. SDE 1 or Innovation Hack"
                className="w-full bg-dark-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Company / Organizer *</label>
              <input
                type="text"
                required
                value={manualItem.company}
                onChange={e => setManualItem(p => ({ ...p, company: e.target.value }))}
                placeholder="e.g. Google, Microsoft"
                className="w-full bg-dark-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Apply Link *</label>
              <input
                type="text"
                required
                value={manualItem.link}
                onChange={e => setManualItem(p => ({ ...p, link: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-dark-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Last Date to Apply *</label>
              <input
                type="date"
                required
                value={manualItem.lastDateApply}
                onChange={e => setManualItem(p => ({ ...p, lastDateApply: e.target.value }))}
                className="w-full bg-dark-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">{config.col4} *</label>
              <input
                type="text"
                required
                value={manualItem.secondDate}
                onChange={e => setManualItem(p => ({ ...p, secondDate: e.target.value }))}
                placeholder={isHackathon ? '2026-12-10' : isJob ? 'OA Date or Salary' : '₹60,000/mo'}
                className="w-full bg-dark-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsManualAddOpen(false)}
              className="px-3 py-1 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
            >
              Save Entry
            </button>
          </div>
        </form>
      )}

      {/* Todo Tracker List Table */}
      <div className="mt-5 space-y-3">
        {/* Table Header Row */}
        <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-2.5 rounded-xl bg-dark-950/60 border border-slate-800/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
          <div className="col-span-4 font-bold">{config.col1}</div>
          <div className="col-span-1 font-bold text-center">{config.col2}</div>
          <div className="col-span-2 font-bold">{config.col3}</div>
          <div className="col-span-2 font-bold">{config.col4}</div>
          <div className="col-span-1 font-bold text-center">Read</div>
          <div className="col-span-1 font-bold text-center">UnRead</div>
          <div className="col-span-1 font-bold text-center">Manage</div>
        </div>

        {/* Rows List */}
        <div className="space-y-3">
          {trackerItems.map((item) => {
            const expired = isExpired(item);
            const isRead = item.status === 'read';
            const isUnread = item.status === 'unread';
            const itemId = item._id || item.id;
            const isEditing = editingRowId === itemId;

            return (
              <div
                key={itemId}
                className={`relative rounded-2xl border p-4 transition-all duration-200 overflow-hidden ${
                  isEditing
                    ? 'bg-dark-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : expired
                    ? 'bg-rose-950/15 border-rose-900/30 text-slate-500'
                    : 'bg-dark-950/40 hover:bg-slate-800/20 border-slate-800/70 text-slate-200'
                }`}
              >
                {/* MIDDLE CUT-LINE OVERLAY FOR EXPIRED ITEMS */}
                {expired && !isEditing && (
                  <div 
                    title="Deadline has passed - Entry expired"
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2.5px] bg-gradient-to-r from-rose-500/80 via-rose-500 to-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.9)] pointer-events-none z-30" 
                  />
                )}

                {/* INLINE EDIT MODE */}
                {isEditing ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                    <div className="lg:col-span-4 space-y-1.5">
                      <label className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">Opportunity Title & Company:</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={e => setEditFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="Opportunity Title"
                        className="w-full bg-dark-950 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                      />
                      <input
                        type="text"
                        value={editFormData.company}
                        onChange={e => setEditFormData(p => ({ ...p, company: e.target.value }))}
                        placeholder="Company / Host Organization"
                        className="w-full bg-dark-950 border border-slate-700 rounded-lg px-2.5 py-0.5 text-[11px] text-slate-300 focus:outline-none"
                      />
                    </div>

                    <div className="lg:col-span-1">
                      <label className="text-[10px] text-slate-400 block mb-1">Link:</label>
                      <input
                        type="text"
                        value={editFormData.link}
                        onChange={e => setEditFormData(p => ({ ...p, link: e.target.value }))}
                        placeholder="URL"
                        className="w-full bg-dark-950 border border-slate-700 rounded-lg px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="text-[10px] text-cyan-400 font-bold block mb-1">Apply Deadline (Date):</label>
                      <input
                        type="date"
                        value={editFormData.lastDateApply}
                        onChange={e => setEditFormData(p => ({ ...p, lastDateApply: e.target.value }))}
                        className="w-full bg-dark-950 border border-cyan-500/50 rounded-lg px-2 py-1 text-xs text-cyan-300 font-mono font-bold focus:outline-none"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-1">{config.col4}:</label>
                      <input
                        type="text"
                        value={editFormData.secondDate}
                        onChange={e => setEditFormData(p => ({ ...p, secondDate: e.target.value }))}
                        placeholder={config.col4}
                        className="w-full bg-dark-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="lg:col-span-3 flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleSaveEdit(itemId)}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-dark-950 shadow-md transition-all"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Save ✓</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* NORMAL DISPLAY ROW */
                  <div className={`grid grid-cols-1 lg:grid-cols-12 gap-3 items-center ${
                    expired ? 'opacity-60 line-through' : ''
                  }`}>
                    
                    {/* 1. Name & Company */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.company && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-wider">
                            {item.company}
                          </span>
                        )}
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

                    {/* 4. Second Column: Problem submission / OA Date / Stipend */}
                    <div className="lg:col-span-2 text-xs font-mono">
                      <div className={`flex items-center gap-1.5 ${expired ? 'text-slate-500' : 'text-emerald-400 font-semibold'}`}>
                        {isHackathon ? <Clock className="w-3.5 h-3.5 text-slate-500" /> : <DollarSign className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{item.secondDate || item.lastDateSubmission || 'Scheduled'}</span>
                      </div>
                    </div>

                    {/* 5. Read Column (Highlight & Tick) */}
                    <div className="lg:col-span-1 flex lg:justify-center">
                      <button
                        onClick={() => handleMarkRead(itemId)}
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
                        onClick={() => handleMarkUnread(itemId)}
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

                    {/* 7. Manage Column (Edit & Delete) */}
                    <div className="lg:col-span-1 flex items-center lg:justify-center gap-1">
                      <button
                        onClick={() => handleStartEdit(item)}
                        title="Quick Edit Title or Dates"
                        className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-slate-800/80 hover:border-cyan-500/30 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(itemId, item.name, item.link)}
                        title="Delete from Tracker & Website Showcase"
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}

          {trackerItems.length === 0 && (
            <div className="py-10 text-center text-slate-500 italic bg-dark-950/40 border border-slate-800/80 rounded-2xl">
              Koi entry nahi mili. Upar diye gaye link bar se kisi bhi URL ko paste karke Auto-Add karein!
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Email aane par <strong>UnRead</strong> tick aur highlight hota hai. Read karne par <strong>Read</strong> tick ho jata hai.
          </span>
        </div>
        <div className="text-slate-500 font-mono">
          Expired dates hone par middle line cut lag jaata hai.
        </div>
      </div>
    </div>
  );
}
