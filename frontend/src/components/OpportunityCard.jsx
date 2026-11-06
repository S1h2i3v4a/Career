import React from 'react';
import { 
  Trophy, 
  Briefcase, 
  Bookmark, 
  Clock, 
  MapPin, 
  Users, 
  ExternalLink, 
  DollarSign,
  Trash2
} from 'lucide-react';

export default function OpportunityCard({ 
  item, 
  isSaved, 
  onToggleBookmark, 
  onSelect,
  onDelete
}) {
  const isHackathon = item.type === 'hackathon';

  // Calculate days left
  const daysLeft = Math.ceil((new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 7 && daysLeft >= 0;

  return (
    <article 
      onClick={() => onSelect(item)}
      className="group relative bg-dark-900/80 hover:bg-dark-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4"
    >
      {/* Header: Org avatar & name + Bookmark */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-sm border ${
              isHackathon 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            }`}>
              {item.avatarText || item.org.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {item.org}
              </span>
              <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                {item.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item.id);
              }}
              title={isSaved ? "Remove Bookmark" : "Save Bookmark"}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-dark-950 border-slate-800 text-slate-500 hover:text-amber-400 hover:border-slate-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
            </button>

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to remove "${item.title}" from the website and your trackers?`)) {
                    onDelete(item.id, item.title, item.applyUrl);
                  }
                }}
                title="Delete opportunity from website and tracker"
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-800 bg-dark-950 text-slate-500 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold font-mono">
            <DollarSign className="w-3.5 h-3.5" />
            <span>{item.compensation}</span>
          </div>

          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${
            isHackathon
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
          }`}>
            <MapPin className="w-3 h-3" />
            <span>{item.mode}</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-dark-950 text-slate-400 border border-slate-800 text-xs font-medium">
            <Users className="w-3 h-3" />
            <span>{item.experience}</span>
          </div>
        </div>

        {/* Short description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Footer: Tags & Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-dark-950 text-slate-400 border border-slate-800"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px] text-slate-500 px-1 py-0.5 font-mono">
              +{item.tags.length - 3}
            </span>
          )}
        </div>

        {/* Deadline & CTAs */}
        <div className="flex items-center justify-between gap-2">
          <div className={`flex items-center gap-1 text-[11px] font-medium ${
            isUrgent ? 'text-rose-400 font-semibold' : 'text-slate-500'
          }`}>
            <Clock className="w-3 h-3" />
            <span>
              {daysLeft < 0 ? 'Closed' : daysLeft === 0 ? 'Ends Today' : `${daysLeft}d left`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(item)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-dark-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              Details
            </button>
            <a
              href={item.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg text-white transition-all ${
                isHackathon
                  ? 'bg-cyan-500 hover:bg-cyan-400 shadow-sm shadow-cyan-500/20'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-sm shadow-purple-600/20'
              }`}
            >
              <span>{isHackathon ? 'Register' : 'Apply'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
