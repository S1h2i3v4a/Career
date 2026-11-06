import React from 'react';
import { Sparkles, Trophy, Briefcase, GraduationCap, Zap, ShieldCheck } from 'lucide-react';

export default function Hero({ hackathonsCount, jobsCount, internshipsCount }) {
  return (
    <section className="relative pt-10 pb-8 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      {/* Decorative Glow Blobs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 glow-cyan rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 glow-purple rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto space-y-4">
        {/* Top Live Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-900 border border-slate-800 text-xs text-slate-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium">3 Dedicated Sections: Hackathons • Tech Jobs • Internships</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Track & Explore{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Hackathons
          </span>
          ,{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Jobs
          </span>{' '}
          &{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Internships
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
          Sirf link paste karke kisi bhi Hackathon, Job ya Internship ko auto-fill karke track karein. Email alerts par automatic Read/UnRead tick aur expired hone par middle line cut!
        </p>

        {/* Stats Grid with 3 Separate Sections */}
        <div className="pt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 max-w-4xl mx-auto">
          {/* Hackathons */}
          <div className="bg-dark-900/70 border border-slate-800/80 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-0.5">
              <Trophy className="w-4 h-4" />
              <span className="text-lg font-bold font-mono">{hackathonsCount}+</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Hackathons</div>
          </div>

          {/* Jobs */}
          <div className="bg-dark-900/70 border border-slate-800/80 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-0.5">
              <Briefcase className="w-4 h-4" />
              <span className="text-lg font-bold font-mono">{jobsCount}+</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Full-Time Jobs</div>
          </div>

          {/* Internships */}
          <div className="bg-dark-900/70 border border-slate-800/80 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-0.5">
              <GraduationCap className="w-4 h-4" />
              <span className="text-lg font-bold font-mono">{internshipsCount}+</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Internships</div>
          </div>

          {/* Bounties */}
          <div className="bg-dark-900/70 border border-slate-800/80 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-0.5">
              <Zap className="w-4 h-4" />
              <span className="text-lg font-bold font-mono">₹85L+</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Total Bounties</div>
          </div>

          {/* Auto Link Fill */}
          <div className="bg-dark-900/70 border border-slate-800/80 rounded-xl p-3 backdrop-blur-sm col-span-2 sm:col-span-1">
            <div className="flex items-center justify-center gap-1.5 text-cyan-300 mb-0.5">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-lg font-bold font-mono">⚡ Auto-Fill</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Link Scraper</div>
          </div>
        </div>
      </div>
    </section>
  );
}
