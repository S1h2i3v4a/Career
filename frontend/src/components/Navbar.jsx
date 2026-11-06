import React, { useState } from 'react';
import { 
  Compass, 
  Trophy, 
  Briefcase, 
  GraduationCap, 
  Bookmark, 
  Plus, 
  Sun, 
  Moon, 
  Sparkles,
  User,
  LogOut,
  Mail,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  counts, 
  onOpenPostModal, 
  theme, 
  toggleTheme,
  currentUser,
  onOpenAuthModal,
  onOpenEmailSyncModal,
  onLogout
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-dark-950/85 border-b border-slate-800/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('all')}
          className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-200">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                DevRadar
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Hackathons • Jobs • Internships
            </p>
          </div>
        </div>

        {/* Center Tabs Navigation (3 Core Sections + All + Saved) */}
        <nav className="hidden lg:flex items-center bg-dark-900/90 p-1 rounded-xl border border-slate-800/80 shadow-inner">
          {/* All */}
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700/60 text-slate-300 font-mono">
              {counts.all}
            </span>
          </button>

          {/* 1. Hackathons */}
          <button
            onClick={() => setActiveTab('hackathons')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeTab === 'hackathons'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hackathons</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
              {counts.hackathons}
            </span>
          </button>

          {/* 2. Jobs */}
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeTab === 'jobs'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-purple-400" />
            <span>Jobs</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
              {counts.jobs}
            </span>
          </button>

          {/* 3. Internships */}
          <button
            onClick={() => setActiveTab('internships')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeTab === 'internships'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Internships</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              {counts.internships}
            </span>
          </button>

          {/* Saved */}
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeTab === 'saved'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Saved</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
              {counts.saved}
            </span>
          </button>
        </nav>

        {/* Right Actions (Email Sync, Post, Auth, Theme) */}
        <div className="flex items-center gap-2">
          
          {/* Email Sync Button */}
          <button
            onClick={onOpenEmailSyncModal}
            title="Link Email ID & Webhook Integration"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-dark-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 transition-all shadow-sm"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>Link Email</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Post Opportunity Button */}
          <button
            onClick={onOpenPostModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Post</span>
          </button>

          {/* User Auth Section */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
                className="flex items-center gap-1.5 p-1 pl-2 rounded-xl bg-dark-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-[10px] text-white">
                  {currentUser.avatar || 'U'}
                </div>
                <span className="font-semibold hidden sm:inline max-w-[90px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div 
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-dark-900 border border-slate-800 shadow-2xl p-2 space-y-1 z-50 animate-in fade-in duration-100"
                >
                  <div className="p-2.5 border-b border-slate-800/80 mb-1">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Email Sync Active</span>
                    </div>
                  </div>

                  <button
                    onClick={onOpenEmailSyncModal}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg text-left"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Email Sync Settings</span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuthModal('signup')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-dark-950 transition-all shadow-md shadow-cyan-500/20"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-8 h-8 rounded-lg border border-slate-800 bg-dark-900 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Tabs Bar */}
      <div className="lg:hidden flex items-center justify-between bg-dark-900/95 px-2.5 py-2 border-t border-slate-800/80 overflow-x-auto text-[11px] font-semibold gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1 whitespace-nowrap px-2 py-1 rounded-lg ${
            activeTab === 'all' ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>All ({counts.all})</span>
        </button>

        <button
          onClick={() => setActiveTab('hackathons')}
          className={`flex items-center gap-1 whitespace-nowrap px-2 py-1 rounded-lg ${
            activeTab === 'hackathons' ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-3 h-3" />
          <span>Hackathons ({counts.hackathons})</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-1 whitespace-nowrap px-2 py-1 rounded-lg ${
            activeTab === 'jobs' ? 'text-purple-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          <Briefcase className="w-3 h-3" />
          <span>Jobs ({counts.jobs})</span>
        </button>

        <button
          onClick={() => setActiveTab('internships')}
          className={`flex items-center gap-1 whitespace-nowrap px-2 py-1 rounded-lg ${
            activeTab === 'internships' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          <GraduationCap className="w-3 h-3" />
          <span>Interns ({counts.internships})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-1 whitespace-nowrap px-2 py-1 rounded-lg ${
            activeTab === 'saved' ? 'text-amber-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          <Bookmark className="w-3 h-3" />
          <span>Saved ({counts.saved})</span>
        </button>
      </div>
    </header>
  );
}
