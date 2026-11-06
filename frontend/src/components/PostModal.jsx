import React, { useState } from 'react';
import { X, Trophy, Briefcase, GraduationCap, Plus, Sparkles } from 'lucide-react';
import { parseOpportunityFromUrl } from '../utils/linkParser';
import { api } from '../services/api';

export default function PostModal({ isOpen, onClose, onAddOpportunity }) {
  if (!isOpen) return null;

  const [type, setType] = useState('hackathon'); // 'hackathon' | 'job' | 'internship'
  const [pasteUrl, setPasteUrl] = useState('');
  const [isAutoExtracting, setIsAutoExtracting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    org: '',
    mode: 'Online / Remote',
    compensation: '',
    deadline: '',
    secondDate: '',
    experience: 'Open for All',
    tags: '',
    description: '',
    applyUrl: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Smart Link Auto Fill within modal
  const handleSmartAutoFill = async () => {
    const url = pasteUrl.trim();
    if (!url) return;
    setIsAutoExtracting(true);

    try {
      let parsed = null;
      try {
        const res = await api.scrapeLink(url, type);
        if (res && res.success && res.data) parsed = res.data;
      } catch {}

      if (!parsed) {
        parsed = parseOpportunityFromUrl(url, type);
      }

      if (!parsed) {
        setIsAutoExtracting(false);
        return;
      }

      if (parsed.type) setType(parsed.type);
      setFormData({
        title: parsed.title || parsed.name || '',
        org: parsed.company || parsed.org || '',
        mode: parsed.mode || 'Online / Remote',
        compensation: parsed.compensation || '',
        deadline: parsed.lastDateApply || parsed.deadline || '',
        secondDate: parsed.secondDate || parsed.lastDateSubmission || '',
        experience: parsed.experience || 'Open for All',
        tags: Array.isArray(parsed.tags) ? parsed.tags.join(', ') : '',
        description: parsed.description || '',
        applyUrl: parsed.link || parsed.applyUrl || url
      });
    } finally {
      setIsAutoExtracting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newItem = {
      id: `${type}-${Date.now()}`,
      type,
      title: formData.title.trim(),
      name: formData.title.trim(),
      org: formData.org.trim(),
      company: formData.org.trim(),
      avatarText: formData.org.substring(0, 4).toUpperCase(),
      mode: formData.mode,
      location: formData.mode,
      compensation: formData.compensation.trim(),
      compLabel: type === 'hackathon' ? 'Prize Pool' : type === 'internship' ? 'Monthly Stipend' : 'Annual CTC',
      deadline: formData.deadline || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      lastDateApply: formData.deadline || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      submissionDeadline: formData.secondDate || new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
      secondDate: formData.secondDate || (type === 'hackathon' ? '2026-12-15' : type === 'internship' ? '3-6 Months' : 'Interview Round'),
      experience: formData.experience,
      teamSize: type === 'hackathon' ? '1 - 4 Members' : 'Individual',
      tags: tagsArray.length ? tagsArray : ['Tech', 'Coding'],
      description: formData.description.trim(),
      eligibility: type === 'internship' ? 'College students enrolled in tech degree.' : 'Open to all eligible candidates who meet criteria.',
      perks: type === 'hackathon' ? 'Cash prizes, certificates & networking.' : 'Health cover, flexible hours & mentorship.',
      applyUrl: formData.applyUrl.trim(),
      link: formData.applyUrl.trim(),
      status: 'unread',
      hasNewEmail: true,
      emailNotification: 'New opportunity published in directory.',
      featured: true,
      addedAt: new Date().toISOString()
    };

    onAddOpportunity(newItem);
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-dark-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-white">Post Opportunity</h2>
          <p className="text-xs text-slate-400 mt-1">
            Add a new Hackathon, Full-Time Job, or College Internship.
          </p>
        </div>

        {/* Quick URL Auto-Fill within Modal */}
        <div className="mb-5 p-3 rounded-2xl bg-dark-950 border border-cyan-500/30">
          <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Auto-Fill from Link (Optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              placeholder="Paste any URL to auto-fill all inputs..."
              className="flex-1 bg-dark-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleSmartAutoFill}
              disabled={isAutoExtracting}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-dark-950 text-xs font-bold transition-all"
            >
              {isAutoExtracting ? 'Extracting...' : 'Auto-Fill'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 3 Type Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Section *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('hackathon')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  type === 'hackathon'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                    : 'bg-dark-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Trophy className="w-4 h-4 mb-1" />
                <span>1. Hackathon</span>
              </button>

              <button
                type="button"
                onClick={() => setType('job')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  type === 'job'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'bg-dark-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Briefcase className="w-4 h-4 mb-1" />
                <span>2. Tech Job</span>
              </button>

              <button
                type="button"
                onClick={() => setType('internship')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  type === 'internship'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-dark-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4 mb-1" />
                <span>3. Internship</span>
              </button>
            </div>
          </div>

          {/* Title & Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Title / Role Name *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder={type === 'hackathon' ? 'e.g. AI Innovation Sprint' : type === 'internship' ? 'e.g. SWE Intern' : 'e.g. SDE 1 - Backend'}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Company / Organizer *</label>
              <input
                type="text"
                name="org"
                required
                value={formData.org}
                onChange={handleChange}
                placeholder="e.g. Google, Microsoft, Swiggy"
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Mode & Compensation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Work Mode / Location *</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Online / Remote">💻 Online / Remote</option>
                <option value="Hybrid">🏢 Hybrid</option>
                <option value="On-site">📍 On-site / In-person</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {type === 'hackathon' ? 'Prize Pool *' : type === 'internship' ? 'Monthly Stipend *' : 'Salary / CTC *'}
              </label>
              <input
                type="text"
                name="compensation"
                required
                value={formData.compensation}
                onChange={handleChange}
                placeholder={type === 'hackathon' ? 'e.g. ₹5,00,000' : type === 'internship' ? 'e.g. ₹80,000 / month' : 'e.g. ₹18 - 25 LPA'}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Deadline & Second Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Application Deadline *</label>
              <input
                type="date"
                name="deadline"
                required
                value={formData.deadline}
                onChange={handleChange}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {type === 'hackathon' ? 'Problem Submission Deadline' : type === 'internship' ? 'Duration / Months' : 'Interview / OA Date'}
              </label>
              <input
                type="text"
                name="secondDate"
                value={formData.secondDate}
                onChange={handleChange}
                placeholder={type === 'hackathon' ? '2026-12-15' : type === 'internship' ? '3 - 6 Months' : 'OA scheduled'}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Tags (Comma-separated) *</label>
            <input
              type="text"
              name="tags"
              required
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, AI / ML, Python"
              className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Detailed Description *</label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a concise description of the opportunity..."
              className="w-full bg-dark-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Apply URL */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Apply / Registration URL *</label>
            <input
              type="url"
              name="applyUrl"
              required
              value={formData.applyUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Publish to Directory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
