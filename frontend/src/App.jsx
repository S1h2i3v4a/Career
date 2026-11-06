import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import OpportunityCard from './components/OpportunityCard';
import SectionTracker from './components/SectionTracker';
import DetailModal from './components/DetailModal';
import PostModal from './components/PostModal';
import AuthModal from './components/AuthModal';
import EmailSyncModal from './components/EmailSyncModal';
import Footer from './components/Footer';
import { api } from './services/api';
import { 
  INITIAL_DATA, 
  INITIAL_HACKATHON_TRACKER, 
  INITIAL_JOB_TRACKER, 
  INITIAL_INTERNSHIP_TRACKER 
} from './data/mockData';
import { 
  Trophy, 
  Briefcase, 
  GraduationCap, 
  SearchX, 
  Sparkles, 
  LayoutGrid, 
  ListTodo,
  ExternalLink,
  Zap
} from 'lucide-react';

const STORAGE_KEY_ITEMS = 'devradar_modern_items_v2';
const STORAGE_KEY_SAVED = 'devradar_modern_saved_v2';
const STORAGE_KEY_THEME = 'devradar_modern_theme';
const STORAGE_KEY_TRACKER_HACK = 'devradar_tracker_hackathons';
const STORAGE_KEY_TRACKER_JOB = 'devradar_tracker_jobs';
const STORAGE_KEY_TRACKER_INTERN = 'devradar_tracker_internships';
const STORAGE_KEY_USER = 'devradar_current_user';

export default function App() {
  // Master opportunities state
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
      return stored ? JSON.parse(stored) : INITIAL_DATA;
    } catch {
      return INITIAL_DATA;
    }
  });

  const [savedIds, setSavedIds] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // 3 Dedicated Section Trackers
  const [hackathonTrackers, setHackathonTrackers] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRACKER_HACK);
      return stored ? JSON.parse(stored) : INITIAL_HACKATHON_TRACKER;
    } catch {
      return INITIAL_HACKATHON_TRACKER;
    }
  });

  const [jobTrackers, setJobTrackers] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRACKER_JOB);
      return stored ? JSON.parse(stored) : INITIAL_JOB_TRACKER;
    } catch {
      return INITIAL_JOB_TRACKER;
    }
  });

  const [internshipTrackers, setInternshipTrackers] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRACKER_INTERN);
      return stored ? JSON.parse(stored) : INITIAL_INTERNSHIP_TRACKER;
    } catch {
      return INITIAL_INTERNSHIP_TRACKER;
    }
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : {
        name: 'Shivam Keshari',
        email: 'shivam.keshari@gmail.com',
        avatar: 'SK',
        isEmailLinked: true
      };
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  });

  // Navigation tab: 'all' | 'hackathons' | 'jobs' | 'internships' | 'saved'
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [filterExperience, setFilterExperience] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('dual'); // 'dual' | 'grid'

  // Sub-view mode for dedicated section tabs: 'tracker' or 'cards'
  const [sectionView, setSectionView] = useState('tracker');

  // Modals state
  const [selectedModalItem, setSelectedModalItem] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [isEmailSyncModalOpen, setIsEmailSyncModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Persist items
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  // Persist bookmarks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(Array.from(savedIds)));
    } catch (e) {
      console.error(e);
    }
  }, [savedIds]);

  // Persist Trackers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRACKER_HACK, JSON.stringify(hackathonTrackers));
    } catch (e) {
      console.error(e);
    }
  }, [hackathonTrackers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRACKER_JOB, JSON.stringify(jobTrackers));
    } catch (e) {
      console.error(e);
    }
  }, [jobTrackers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRACKER_INTERN, JSON.stringify(internshipTrackers));
    } catch (e) {
      console.error(e);
    }
  }, [internshipTrackers]);

  // Persist User
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Persist theme
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  // Toggle bookmark
  const handleToggleBookmark = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Removed from Bookmarks');
      } else {
        next.add(id);
        showToast('⭐ Saved to Bookmarks!');
      }
      return next;
    });
  };

  // Add new opportunity handler
  const handleAddOpportunity = (newItem) => {
    // 1. Add to main website cards showcase (prevent duplicate)
    setItems(prev => {
      const exists = prev.some(i => i.id === newItem.id || (newItem.applyUrl && i.applyUrl === newItem.applyUrl));
      if (exists) return prev;
      return [newItem, ...prev];
    });

    // 2. Only add to tracker if it didn't already originate from tracker auto-fill
    if (!newItem.trackerRefId) {
      const trackerEntry = {
        id: `tracker-${newItem.type}-${Date.now()}`,
        name: newItem.title,
        company: newItem.org || newItem.company || 'Tech Company',
        link: newItem.applyUrl,
        lastDateApply: newItem.deadline,
        lastDateSubmission: newItem.submissionDeadline || newItem.deadline,
        secondDate: newItem.secondDate || (newItem.type === 'hackathon' ? newItem.submissionDeadline : newItem.type === 'internship' ? '3-6 Mo' : 'OA scheduled'),
        status: 'unread',
        hasNewEmail: true,
        emailNotification: `New ${newItem.type} opportunity published and tracked.`,
        updatedAt: new Date().toISOString()
      };

      if (newItem.type === 'hackathon') {
        setHackathonTrackers(prev => [trackerEntry, ...prev]);
      } else if (newItem.type === 'job') {
        setJobTrackers(prev => [trackerEntry, ...prev]);
      } else if (newItem.type === 'internship') {
        setInternshipTrackers(prev => [trackerEntry, ...prev]);
      }
    }

    showToast(`🎉 New ${newItem.type.toUpperCase()} published!`);
    setActiveTab(newItem.type === 'hackathon' ? 'hackathons' : newItem.type === 'job' ? 'jobs' : 'internships');
  };

  // Synchronized Deletion Handler:
  // Removes opportunity simultaneously from Website Showcase AND Trackers!
  const handleDeleteOpportunity = (id, name, link) => {
    // Helper to identify match across cards and trackers
    const isMatchingItem = (cardItem) => {
      if (!cardItem) return false;
      if (cardItem.id === id || cardItem._id === id || cardItem.trackerRefId === id) return true;
      if (link && cardItem.applyUrl) {
        const cleanLink = link.replace(/\/+$/, '').toLowerCase();
        const cleanApply = cardItem.applyUrl.replace(/\/+$/, '').toLowerCase();
        if (cleanLink === cleanApply) return true;
      }
      if (name && cardItem.title) {
        const n1 = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const n2 = cardItem.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (n1 && n2 && (n1 === n2 || n1.includes(n2) || n2.includes(n1))) return true;
      }
      return false;
    };

    // 1. Remove from main website catalog
    setItems(prev => prev.filter(item => !isMatchingItem(item)));

    // 2. Remove from all 3 tracker lists
    const isMatchingTracker = (tItem) => {
      if (!tItem) return false;
      if (tItem.id === id || tItem._id === id) return true;
      if (link && tItem.link) {
        const cleanLink = link.replace(/\/+$/, '').toLowerCase();
        const cleanTLink = tItem.link.replace(/\/+$/, '').toLowerCase();
        if (cleanLink === cleanTLink) return true;
      }
      if (name && tItem.name) {
        const n1 = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const n2 = tItem.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (n1 && n2 && (n1 === n2 || n1.includes(n2) || n2.includes(n1))) return true;
      }
      return false;
    };

    setHackathonTrackers(prev => prev.filter(item => !isMatchingTracker(item)));
    setJobTrackers(prev => prev.filter(item => !isMatchingTracker(item)));
    setInternshipTrackers(prev => prev.filter(item => !isMatchingTracker(item)));

    // 3. Remove from bookmarks
    setSavedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    // 4. Sync delete with MongoDB Atlas if user is logged in
    try {
      const token = localStorage.getItem('devradar_auth_token');
      if (token && id && id.length === 24) {
        api.deleteTracker(id).catch(err => console.warn('MongoDB delete sync notice:', err.message));
      }
    } catch {}

    showToast(`🗑️ "${name || 'Opportunity'}" deleted from Website & Trackers!`);
  };

  // Synchronized Update Handler:
  // When user edits a title, company, or date in the Tracker, updates Website cards & database!
  const handleUpdateTrackerItem = (itemId, updatedFields) => {
    // 1. Update in website catalog items
    setItems(prev => prev.map(item => {
      if (item.id === itemId || item._id === itemId || item.trackerRefId === itemId) {
        return {
          ...item,
          title: updatedFields.name || item.title,
          org: updatedFields.company || item.org,
          applyUrl: updatedFields.link || item.applyUrl,
          deadline: updatedFields.lastDateApply || item.deadline,
          submissionDeadline: updatedFields.secondDate || item.submissionDeadline,
          secondDate: updatedFields.secondDate || item.secondDate
        };
      }
      return item;
    }));

    // 2. Update across tracker lists
    const updateTrackerList = (list) => list.map(item => {
      if (item.id === itemId || item._id === itemId) {
        return {
          ...item,
          name: updatedFields.name || item.name,
          company: updatedFields.company || item.company,
          link: updatedFields.link || item.link,
          lastDateApply: updatedFields.lastDateApply || item.lastDateApply,
          lastDateSubmission: updatedFields.secondDate || item.lastDateSubmission,
          secondDate: updatedFields.secondDate || item.secondDate
        };
      }
      return item;
    });

    setHackathonTrackers(updateTrackerList);
    setJobTrackers(updateTrackerList);
    setInternshipTrackers(updateTrackerList);
  };

  // Inbound email trigger handler (Handles Hackathons, Jobs & Internships)
  const handleTriggerEmailEvent = ({ hackathonId, itemId, name, sender, subject }) => {
    const targetId = itemId || hackathonId;
    let matchedName = name || 'Opportunity';
    let matchedCategory = 'Opportunity';

    const isMatch = (item) => {
      if (targetId && (item.id === targetId || item._id === targetId)) return true;
      if (name && item.name && (item.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(item.name.toLowerCase()))) return true;
      if (subject && item.name && item.name.length > 3 && subject.toLowerCase().includes(item.name.toLowerCase())) return true;
      if (subject && item.company && item.company.length > 2 && subject.toLowerCase().includes(item.company.toLowerCase())) return true;
      return false;
    };

    // Search in hackathons
    setHackathonTrackers(prev => prev.map(item => {
      if (isMatch(item)) {
        matchedName = item.name;
        matchedCategory = 'Hackathon';
        return {
          ...item,
          status: 'unread',
          hasNewEmail: true,
          emailNotification: `[${sender}]: ${subject}`,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    // Search in jobs
    setJobTrackers(prev => prev.map(item => {
      if (isMatch(item)) {
        matchedName = item.name;
        matchedCategory = 'Job';
        return {
          ...item,
          status: 'unread',
          hasNewEmail: true,
          emailNotification: `[${sender}]: ${subject}`,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    // Search in internships
    setInternshipTrackers(prev => prev.map(item => {
      if (isMatch(item)) {
        matchedName = item.name;
        matchedCategory = 'Internship';
        return {
          ...item,
          status: 'unread',
          hasNewEmail: true,
          emailNotification: `[${sender}]: ${subject}`,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    // Also notify backend webhook API
    if (currentUser?.email) {
      api.triggerInboundEmailWebhook({
        userEmail: currentUser.email,
        sender,
        subject,
        opportunityName: matchedName,
        hackathonName: matchedName
      }).catch(err => console.warn('Inbound email API notice:', err.message));
    }

    showToast(`📧 New Email Alert: [${matchedCategory}] "${matchedName}" marked UnRead (✔)!`);
  };

  // Auth Handlers (MongoDB Atlas Integrated)
  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    showToast(`🎉 Welcome back, ${user.name}!`);

    // Fetch user's personal items from MongoDB
    try {
      const dbTrackers = await api.getTrackers();
      if (dbTrackers && dbTrackers.length > 0) {
        setHackathonTrackers(dbTrackers.filter(i => i.type === 'hackathon'));
        setJobTrackers(dbTrackers.filter(i => i.type === 'job'));
        setInternshipTrackers(dbTrackers.filter(i => i.type === 'internship'));
        showToast(`📦 Synchronized ${dbTrackers.length} items from your MongoDB Atlas database!`);
      }
    } catch (err) {
      console.warn('MongoDB initial sync notice:', err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('devradar_auth_token');
    setCurrentUser(null);
    showToast('Logged out successfully.');
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('Reset all saved bookmarks, custom opportunities and all 3 trackers to default?')) {
      setItems(INITIAL_DATA);
      setHackathonTrackers(INITIAL_HACKATHON_TRACKER);
      setJobTrackers(INITIAL_JOB_TRACKER);
      setInternshipTrackers(INITIAL_INTERNSHIP_TRACKER);
      setSavedIds(new Set());
      showToast('All demo data reset successfully.');
    }
  };

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return items
      .filter((item) => {
        // Tab filter
        if (activeTab === 'hackathons' && item.type !== 'hackathon') return false;
        if (activeTab === 'jobs' && item.type !== 'job') return false;
        if (activeTab === 'internships' && item.type !== 'internship') return false;
        if (activeTab === 'saved' && !savedIds.has(item.id)) return false;

        // Mode filter
        if (filterMode !== 'all' && !item.mode.includes(filterMode)) return false;

        // Experience filter
        if (filterExperience !== 'all') {
          if (!item.experience.toLowerCase().includes(filterExperience.toLowerCase()) && item.experience !== 'Open for All') {
            return false;
          }
        }

        // Tag filter
        if (selectedTag !== 'all' && !item.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())) {
          return false;
        }

        // Search query
        if (q) {
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchOrg = item.org.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchTag = item.tags.some(t => t.toLowerCase().includes(q));
          const matchLoc = (item.location || '').toLowerCase().includes(q);
          if (!matchTitle && !matchOrg && !matchDesc && !matchTag && !matchLoc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(a.deadline) - new Date(b.deadline);
        }
        if (sortBy === 'deadline') {
          return new Date(a.deadline) - new Date(b.deadline);
        }
        if (sortBy === 'newest') {
          return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
        }
        if (sortBy === 'compensation') {
          const numA = parseInt((a.compensation || '').replace(/\D/g, ''), 10) || 0;
          const numB = parseInt((b.compensation || '').replace(/\D/g, ''), 10) || 0;
          return numB - numA;
        }
        return 0;
      });
  }, [items, savedIds, activeTab, filterMode, filterExperience, selectedTag, searchQuery, sortBy]);

  const hackathons = useMemo(() => filteredItems.filter(i => i.type === 'hackathon'), [filteredItems]);
  const jobs = useMemo(() => filteredItems.filter(i => i.type === 'job'), [filteredItems]);
  const internships = useMemo(() => filteredItems.filter(i => i.type === 'internship'), [filteredItems]);

  const counts = {
    all: items.length,
    hackathons: items.filter(i => i.type === 'hackathon').length,
    jobs: items.filter(i => i.type === 'job').length,
    internships: items.filter(i => i.type === 'internship').length,
    saved: savedIds.size
  };

  // Unified all trackers list for email modal selector
  const allTrackerItems = useMemo(() => {
    return [...hackathonTrackers, ...jobTrackers, ...internshipTrackers];
  }, [hackathonTrackers, jobTrackers, internshipTrackers]);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-dark-900 border border-cyan-500/50 text-cyan-200 text-xs font-semibold shadow-2xl animate-in slide-in-from-bottom duration-200">
          {toastMessage}
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        onOpenPostModal={() => setIsPostModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        onOpenEmailSyncModal={() => setIsEmailSyncModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Hero Header */}
      <Hero 
        hackathonsCount={counts.hackathons} 
        jobsCount={counts.jobs} 
        internshipsCount={counts.internships}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Controls Toolbar */}
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          filterExperience={filterExperience}
          setFilterExperience={setFilterExperience}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* SECTION VIEW CONTROLS (When on Hackathons, Jobs, or Internships Tab) */}
        {['hackathons', 'jobs', 'internships'].includes(activeTab) && (
          <div className="mb-6 flex items-center justify-between bg-dark-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              {activeTab === 'hackathons' && <Trophy className="w-5 h-5 text-cyan-400" />}
              {activeTab === 'jobs' && <Briefcase className="w-5 h-5 text-purple-400" />}
              {activeTab === 'internships' && <GraduationCap className="w-5 h-5 text-emerald-400" />}
              <span className="text-sm font-extrabold text-white capitalize">
                {activeTab} Display Format:
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-dark-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSectionView('tracker')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sectionView === 'tracker'
                    ? 'bg-cyan-500 text-dark-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Todo Tracker Table</span>
              </button>

              <button
                onClick={() => setSectionView('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sectionView === 'cards'
                    ? 'bg-cyan-500 text-dark-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards Showcase</span>
              </button>
            </div>
          </div>
        )}

        {/* 1. HACKATHON TODO TRACKER (Active on Hackathons Tab) */}
        {activeTab === 'hackathons' && sectionView === 'tracker' && (
          <SectionTracker
            type="hackathon"
            trackerItems={hackathonTrackers}
            setTrackerItems={setHackathonTrackers}
            onShowToast={showToast}
            onAddOpportunityToMainList={handleAddOpportunity}
            onDeleteItem={handleDeleteOpportunity}
            onUpdateItem={handleUpdateTrackerItem}
          />
        )}

        {/* 2. TECH JOBS TODO TRACKER (Active on Jobs Tab) */}
        {activeTab === 'jobs' && sectionView === 'tracker' && (
          <SectionTracker
            type="job"
            trackerItems={jobTrackers}
            setTrackerItems={setJobTrackers}
            onShowToast={showToast}
            onAddOpportunityToMainList={handleAddOpportunity}
            onDeleteItem={handleDeleteOpportunity}
            onUpdateItem={handleUpdateTrackerItem}
          />
        )}

        {/* 3. INTERNSHIPS TODO TRACKER (Active on Internships Tab) */}
        {activeTab === 'internships' && sectionView === 'tracker' && (
          <SectionTracker
            type="internship"
            trackerItems={internshipTrackers}
            setTrackerItems={setInternshipTrackers}
            onShowToast={showToast}
            onAddOpportunityToMainList={handleAddOpportunity}
            onDeleteItem={handleDeleteOpportunity}
            onUpdateItem={handleUpdateTrackerItem}
          />
        )}

        {/* Empty State */}
        {filteredItems.length === 0 ? (
          <div className="bg-dark-900/60 border border-slate-800/80 rounded-3xl p-12 text-center max-w-md mx-auto my-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-dark-950 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <SearchX className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Koi Opportunity Nahi Mili</h3>
              <p className="text-xs text-slate-400 mt-1">
                Aapke search ya filters se koi match nahi hua. Search clear karke doobara try karein.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('all');
                setFilterMode('all');
                setFilterExperience('all');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-dark-950 border border-slate-800 text-cyan-400 hover:border-cyan-500"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Opportunities Display */
          <div>
            {/* Active section info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {activeTab === 'all'
                    ? 'All 3 Categories (Hackathons, Jobs, Internships)'
                    : activeTab === 'hackathons'
                    ? 'Curated Hackathons'
                    : activeTab === 'jobs'
                    ? 'Full-Time Tech Jobs'
                    : activeTab === 'internships'
                    ? 'Tech Internships'
                    : 'Saved Opportunities'}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-dark-900 border border-slate-800 text-cyan-400">
                  {filteredItems.length} Available
                </span>
              </div>
            </div>

            {/* DUAL / MULTI-COLUMN VIEW (Active on 'all' tab with dual mode) */}
            {activeTab === 'all' && viewMode === 'dual' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                
                {/* 1. Hackathons Column */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/30">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Trophy className="w-3.5 h-3.5" />
                      </div>
                      <h2 className="text-sm font-bold text-white">1. Hackathons</h2>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('hackathons');
                        setSectionView('tracker');
                      }}
                      className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Tracker ({hackathonTrackers.length})</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {hackathons.map((item) => (
                      <OpportunityCard
                        key={item.id}
                        item={item}
                        isSaved={savedIds.has(item.id)}
                        onToggleBookmark={handleToggleBookmark}
                        onSelect={setSelectedModalItem}
                        onDelete={handleDeleteOpportunity}
                      />
                    ))}
                    {hackathons.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-6 text-center">
                        No hackathons match filters.
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Full-Time Jobs Column */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-500/30">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <h2 className="text-sm font-bold text-white">2. Full-Time Jobs</h2>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('jobs');
                        setSectionView('tracker');
                      }}
                      className="text-[11px] font-semibold text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <span>Tracker ({jobTrackers.length})</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {jobs.map((item) => (
                      <OpportunityCard
                        key={item.id}
                        item={item}
                        isSaved={savedIds.has(item.id)}
                        onToggleBookmark={handleToggleBookmark}
                        onSelect={setSelectedModalItem}
                        onDelete={handleDeleteOpportunity}
                      />
                    ))}
                    {jobs.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-6 text-center">
                        No jobs match filters.
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Internships Column */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <h2 className="text-sm font-bold text-white">3. Internships</h2>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('internships');
                        setSectionView('tracker');
                      }}
                      className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Tracker ({internshipTrackers.length})</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {internships.map((item) => (
                      <OpportunityCard
                        key={item.id}
                        item={item}
                        isSaved={savedIds.has(item.id)}
                        onToggleBookmark={handleToggleBookmark}
                        onSelect={setSelectedModalItem}
                        onDelete={handleDeleteOpportunity}
                      />
                    ))}
                    {internships.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-6 text-center">
                        No internships match filters.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* GRID VIEW (Single responsive cards grid) */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredItems.map((item) => (
                    <OpportunityCard
                      key={item.id}
                      item={item}
                      isSaved={savedIds.has(item.id)}
                      onToggleBookmark={handleToggleBookmark}
                      onSelect={setSelectedModalItem}
                      onDelete={handleDeleteOpportunity}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Opportunity Detail Modal */}
      <DetailModal
        item={selectedModalItem}
        isSaved={selectedModalItem ? savedIds.has(selectedModalItem.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onClose={() => setSelectedModalItem(null)}
      />

      {/* Post Opportunity Modal */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onAddOpportunity={handleAddOpportunity}
      />

      {/* Auth Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Email Sync Integration Modal */}
      <EmailSyncModal
        isOpen={isEmailSyncModalOpen}
        onClose={() => setIsEmailSyncModalOpen(false)}
        currentUser={currentUser}
        trackerItems={allTrackerItems}
        onTriggerEmailEvent={handleTriggerEmailEvent}
        onShowToast={showToast}
      />

      {/* Footer */}
      <Footer onResetData={handleResetData} />
    </div>
  );
}
