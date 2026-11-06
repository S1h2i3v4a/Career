import React, { useEffect } from 'react';
import { 
  X, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Bookmark, 
  ExternalLink, 
  CheckCircle2, 
  Gift 
} from 'lucide-react';

export default function DetailModal({ 
  item, 
  isSaved, 
  onToggleBookmark, 
  onClose 
}) {
  if (!item) return null;

  const isHackathon = item.type === 'hackathon';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-dark-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 pr-10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-base border flex-shrink-0 ${
            isHackathon 
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
              : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
          }`}>
            {item.avatarText || item.org.substring(0, 3).toUpperCase()}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {item.org}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              {item.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{item.location || item.mode}</span>
            </p>
          </div>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-dark-950 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              {isHackathon ? 'Prize Pool' : 'Salary / Stipend'}
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {item.compensation}
            </span>
          </div>

          <div className="bg-dark-950 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Work Mode
            </span>
            <span className="text-sm font-bold text-slate-200">
              {item.mode}
            </span>
          </div>

          <div className="bg-dark-950 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Eligibility
            </span>
            <span className="text-sm font-bold text-slate-200">
              {item.experience}
            </span>
          </div>

          <div className="bg-dark-950 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Apply Deadline
            </span>
            <span className="text-sm font-bold text-slate-200 font-mono">
              {item.deadline}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            About The Opportunity
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Eligibility Section */}
        {item.eligibility && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Eligibility & Requirements</span>
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-dark-950/60 border border-slate-800/60 rounded-xl p-3.5">
              {item.eligibility}
            </p>
          </div>
        )}

        {/* Perks Section */}
        {item.perks && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Perks & Awards</span>
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-dark-950/60 border border-slate-800/60 rounded-xl p-3.5">
              {item.perks}
            </p>
          </div>
        )}

        {/* Tech Stack */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Required Skills & Tech Stack
          </h4>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold px-3 py-1 rounded-lg bg-dark-950 border border-slate-800 text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => onToggleBookmark(item.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isSaved
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-dark-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
            <span>{isSaved ? 'Saved in Bookmarks' : 'Save for Later'}</span>
          </button>

          <a
            href={item.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 ${
              isHackathon
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/25'
            }`}
          >
            <span>{isHackathon ? 'Go to Official Registration' : 'Direct Apply on Website'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
