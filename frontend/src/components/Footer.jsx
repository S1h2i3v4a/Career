import React from 'react';
import { Compass, Zap, RotateCcw } from 'lucide-react';

export default function Footer({ onResetData }) {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-dark-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        {/* Left */}
        <div className="space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span className="font-extrabold text-base text-white">DevRadar</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              React + Vite + Tailwind
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Curated portal for college hackers and engineers to discover top hackathons & tech opportunities.
          </p>
        </div>

        {/* Center / Actions */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {/* Right Stats */}
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          <Zap className="w-3.5 h-3.5" />
          <span>Vite Engine • &lt; 30ms render</span>
        </div>

      </div>
    </footer>
  );
}
