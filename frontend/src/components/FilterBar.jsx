import React, { useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, LayoutGrid, Columns2 } from 'lucide-react';

const POPULAR_TAGS = [
  'All',
  'AI / ML',
  'Full Stack',
  'Frontend',
  'Backend',
  'Web3',
  'Internship',
  'Remote',
  'Cloud / DevOps'
];

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  filterMode,
  setFilterMode,
  filterExperience,
  setFilterExperience,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode
}) {
  const searchInputRef = useRef(null);

  // Keyboard shortcut: '/' focuses search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-4 mb-8">
      {/* Primary Search & Controls Card */}
      <div className="bg-dark-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col lg:flex-row items-center gap-3.5">
        
        {/* Search Box */}
        <div className="relative w-full lg:flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, company, skills (e.g. React, AI, Python)..."
            className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-16 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 pointer-events-none">
              /
            </kbd>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
          {/* Mode */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="flex-1 sm:flex-none bg-dark-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">🌐 All Locations & Modes</option>
            <option value="Online / Remote">💻 Online / Remote</option>
            <option value="Hybrid">🏢 Hybrid</option>
            <option value="On-site">📍 On-site / In-Person</option>
          </select>

          {/* Experience */}
          <select
            value={filterExperience}
            onChange={(e) => setFilterExperience(e.target.value)}
            className="flex-1 sm:flex-none bg-dark-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">🎯 All Levels</option>
            <option value="Fresher / College">🎓 Freshers / Students</option>
            <option value="0-2 Years">🌱 Entry Level (0-2 Yrs)</option>
            <option value="3+ Years">⚡ Experienced (3+ Yrs)</option>
            <option value="Open for All">🌍 Open for All</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 sm:flex-none bg-dark-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
          >
            <option value="featured">✨ Featured First</option>
            <option value="deadline">⏳ Deadline (Ending Soon)</option>
            <option value="compensation">💰 Prize / CTC (High-Low)</option>
            <option value="newest">🆕 Recently Added</option>
          </select>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-dark-950 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('dual')}
              title="Dual Column View"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'dual'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Columns2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Tag Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {POPULAR_TAGS.map((tag) => {
          const isActive = (tag === 'All' && selectedTag === 'all') || selectedTag.toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === 'All' ? 'all' : tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-cyan-500 text-dark-950 font-bold shadow-md shadow-cyan-500/25 scale-105'
                  : 'bg-dark-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
