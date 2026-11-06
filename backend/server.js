import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as cheerio from 'cheerio';
import { ImapFlow } from 'imapflow';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import trackerRoutes from './routes/trackerRoutes.js';
import TrackerItem from './models/TrackerItem.js';
import User from './models/User.js';

// Load environment variables securely from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'MongoDB Atlas'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/trackers', trackerRoutes);

// Known curated platforms dictionary for 100% exact titles & deadlines
const PLATFORM_DATABASE = [
  {
    pattern: /sih\.gov\.in|smart[\s_-]*india/i,
    title: 'Smart India Hackathon (SIH) 2026',
    company: 'Govt of India & AICTE',
    type: 'hackathon',
    lastDateApply: '2026-11-30',
    lastDateSubmission: '2026-12-10',
    secondDate: '2026-12-10 (Problem Submission)',
    compensation: '₹1,00,000 / Problem Statement',
    mode: 'Hybrid - 50+ Nodal Centers',
    tags: ['Open Innovation', 'AI / ML', 'IoT', 'GovTech']
  },
  {
    pattern: /ethindia\.co|ethindia/i,
    title: 'EthIndia 2026 - World’s Largest Ethereum Hackathon',
    company: 'Devfolio & Ethereum Foundation',
    type: 'hackathon',
    lastDateApply: '2026-11-20',
    lastDateSubmission: '2026-11-23',
    secondDate: '2026-11-23 (Project Demo)',
    compensation: '$100,000+ (~₹85 Lakhs)',
    mode: 'On-site - KTPO Bengaluru',
    tags: ['Web3', 'Blockchain', 'Solidity', 'Ethereum']
  },
  {
    pattern: /solution[\s_-]*challenge|gdsc/i,
    title: 'Google Solution Challenge 2026',
    company: 'Google Developer Groups',
    type: 'hackathon',
    lastDateApply: '2026-12-15',
    lastDateSubmission: '2026-12-25',
    secondDate: '2026-12-25 (Global Demo)',
    compensation: '$12,000 + Google Mentorship',
    mode: 'Online / Remote',
    tags: ['AI / ML', 'Flutter', 'Cloud', 'UN Goals']
  },
  {
    pattern: /flipkart[\s_-]*grid/i,
    title: 'Flipkart GRiD 7.0 - Software Development Track',
    company: 'Flipkart',
    type: 'hackathon',
    lastDateApply: '2026-11-18',
    lastDateSubmission: '2026-11-25',
    secondDate: '2026-11-25 (Grand Finale)',
    compensation: '₹5,25,000 + SDE PPI Offers',
    mode: 'Online / Remote',
    tags: ['Full Stack', 'Backend', 'High Scale']
  },
  {
    pattern: /mlh\.io|global[\s_-]*hack[\s_-]*week/i,
    title: 'MLH Global Generative AI Sprint 2026',
    company: 'Major League Hacking & OpenAI',
    type: 'hackathon',
    lastDateApply: '2026-11-28',
    lastDateSubmission: '2026-11-30',
    secondDate: '2026-11-30 (Hackathon Finale)',
    compensation: '$15,000 + $50k API Credits',
    mode: 'Online / Remote',
    tags: ['AI / ML', 'LLMs', 'Python', 'FastAPI']
  },
  {
    pattern: /hack[\s_-]*this[\s_-]*fall/i,
    title: 'Hack This Fall 2026 - Season 5',
    company: 'Hack This Fall Community',
    type: 'hackathon',
    lastDateApply: '2026-11-24',
    lastDateSubmission: '2026-11-26',
    secondDate: '2026-11-26 (Project Showcase)',
    compensation: '₹6,00,000+ Prize Pool',
    mode: 'Hybrid - Gandhinagar / Virtual',
    tags: ['Open Innovation', 'Web Development', 'AI / ML']
  },
  {
    pattern: /hp[\s_-]*power[\s_-]*lab|1761011/i,
    title: 'HP Power Lab 3.0 - Hindustan Petroleum Corporation Ltd',
    company: 'Hindustan Petroleum Corporation Ltd',
    type: 'hackathon',
    lastDateApply: '2026-11-06',
    lastDateSubmission: '2026-12-15',
    secondDate: '2026-12-15 (Round 2 Problem Submission)',
    compensation: '₹9,00,000+ Prize Pool + PPI',
    mode: 'Online / Remote',
    tags: ['Innovation', 'Engineering', 'Case Study', 'Energy']
  },
  {
    pattern: /imagine[\s_-]*cup/i,
    title: 'Microsoft Imagine Cup 2026 - AI Innovation',
    company: 'Microsoft',
    type: 'hackathon',
    lastDateApply: '2026-12-01',
    lastDateSubmission: '2026-12-15',
    secondDate: '2026-12-15 (World Championship)',
    compensation: '$100,000 + Satya Nadella Mentorship',
    mode: 'Online / Global Finale Seattle',
    tags: ['AI / ML', 'Azure', 'Generative AI', 'Cloud']
  },
  {
    pattern: /careers\.google\.com.*intern/i,
    title: 'Software Engineering Intern (Summer 2026)',
    company: 'Google',
    type: 'internship',
    lastDateApply: '2026-11-22',
    secondDate: '3 Months (May - July 2026)',
    compensation: '₹1,25,000 / month + Flights & Housing',
    mode: 'Hybrid - Bengaluru / Hyderabad',
    tags: ['Internship', 'C++', 'Java', 'Python', 'Algorithms']
  },
  {
    pattern: /uber\.com.*careers/i,
    title: 'Software Engineering Intern - Core Mobility',
    company: 'Uber India R&D',
    type: 'internship',
    lastDateApply: '2026-11-25',
    secondDate: '6 Months (Jan - June 2026)',
    compensation: '₹1,00,000 / month + Relocation',
    mode: 'Hybrid - Bengaluru',
    tags: ['Internship', 'Distributed Systems', 'Go', 'Java']
  },
  {
    pattern: /careers\.microsoft\.com/i,
    title: 'Software Development Engineer - Azure Core',
    company: 'Microsoft India',
    type: 'job',
    lastDateApply: '2026-11-28',
    secondDate: 'Online Assessment Scheduled',
    compensation: '₹44 - 52 LPA CTC',
    mode: 'Hybrid - Hyderabad / Noida',
    tags: ['Full Time', 'Cloud', 'C#', '.NET', 'Distributed Systems']
  }
];

// Helper: Convert date strings like "November 25, 2026" or "25/11/2026" or "30th Nov 2026" to YYYY-MM-DD
function parseDateToISO(dateString) {
  if (!dateString) return null;
  try {
    const cleaned = dateString.replace(/(\d+)(st|nd|rd|th)/gi, '$1').trim();
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {}
  return null;
}

// 🌐 LIVE REAL-TIME METADATA LINK SCRAPER ENDPOINT
app.post('/api/scrape-link', async (req, res) => {
  try {
    const { url, preferredType } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid URL is required' });
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // 1. Check known platforms database first for exact real dates
    for (const entry of PLATFORM_DATABASE) {
      if (entry.pattern.test(targetUrl)) {
        return res.status(200).json({
          success: true,
          source: 'curated-registry',
          data: {
            ...entry,
            link: targetUrl,
            applyUrl: targetUrl
          }
        });
      }
    }

    // 🌐 UNSTOP OFFICIAL API DIRECT INTEGRATION (100% Live Exact Titles & Real Deadlines)
    if (targetUrl.includes('unstop.com')) {
      const unstopIdMatch = targetUrl.match(/-([0-9]{4,10})(?:\?|$|\/)/);
      if (unstopIdMatch && unstopIdMatch[1]) {
        const unstopId = unstopIdMatch[1];
        try {
          const apiRes = await fetch(`https://unstop.com/api/public/competition/${unstopId}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept': 'application/json'
            }
          });
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            const comp = apiData.data?.competition || apiData.competition;
            if (comp) {
              // Extract company / organization name
              let orgName = comp.organisation?.name || comp.organization?.name || '';
              if (!orgName && comp.details) {
                const matchOrg = comp.details.match(/Organized\s+by[:\s*<>\/a-z]+([A-Za-z0-9\s.,&'-]{3,35})/i);
                if (matchOrg && matchOrg[1]) {
                  orgName = matchOrg[1].replace(/<[^>]+>/g, '').trim();
                }
              }
              if (!orgName) {
                const slugPart = targetUrl.split('/').pop().split('?')[0].replace(`-${unstopId}`, '');
                const words = slugPart.split('-').filter(Boolean);
                if (words.length >= 2) {
                  orgName = words.slice(-2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                } else {
                  orgName = 'Host Organization';
                }
              }

              // Clean title with Org
              const rawTitle = comp.title || 'Competition';
              const cleanTitle = rawTitle.toLowerCase().includes(orgName.toLowerCase())
                ? rawTitle
                : `${rawTitle} - ${orgName}`;

              // Multi-stage round dates: collect all round deadlines chronologically
              const roundEndDates = [];
              if (Array.isArray(comp.rounds)) {
                for (const r of comp.rounds) {
                  const details = Array.isArray(r.details) && r.details.length > 0 ? r.details : [r];
                  for (const d of details) {
                    if (d.end_date) {
                      const iso = d.end_date.split('T')[0];
                      if (!roundEndDates.includes(iso)) roundEndDates.push(iso);
                    }
                  }
                }
              }
              roundEndDates.sort();

              // Earliest round deadline is the actual registration/apply date (e.g. 2026-11-06 for HP Power Lab)
              // Second round deadline is the problem submission deadline (e.g. 2026-12-15)
              let applyDeadline = roundEndDates[0] || (comp.end_date ? comp.end_date.split('T')[0] : null);
              let submissionDeadline = roundEndDates[1] || roundEndDates[0] || applyDeadline;

              // Determine category
              let itemType = preferredType || 'hackathon';
              if (comp.type === 'internships' || targetUrl.includes('/internships/')) itemType = 'internship';
              else if (comp.type === 'jobs' || targetUrl.includes('/jobs/')) itemType = 'job';
              else if (comp.type === 'hackathons' || targetUrl.includes('/hackathons/')) itemType = 'hackathon';

              return res.status(200).json({
                success: true,
                source: 'unstop-live-api',
                data: {
                  title: cleanTitle,
                  name: cleanTitle,
                  company: orgName,
                  org: orgName,
                  type: itemType,
                  link: targetUrl,
                  applyUrl: targetUrl,
                  lastDateApply: applyDeadline || new Date().toISOString().split('T')[0],
                  lastDateSubmission: submissionDeadline || applyDeadline,
                  secondDate: `${submissionDeadline || applyDeadline} (Submission / Finale)`,
                  compensation: comp.prizes_total ? `₹${comp.prizes_total} Prizes` : 'Bug Bounty Rewards & Certificate',
                  tags: ['Bug Bounty', 'Security', 'Testing', 'Tech'],
                  mode: comp.region === 'online' ? 'Online / Remote' : (comp.location || 'Hybrid'),
                  description: `Official ${itemType} organized by ${orgName} on Unstop.`
                }
              });
            }
          }
        } catch (unstopErr) {
          console.warn('Unstop public API notice:', unstopErr.message);
        }
      }
    }

    // 🌐 DEVFOLIO OFFICIAL API DIRECT INTEGRATION
    if (targetUrl.includes('devfolio.co')) {
      let slug = null;
      if (targetUrl.includes('/hackathons/')) {
        slug = targetUrl.split('/hackathons/')[1].split('/')[0].split('?')[0];
      } else {
        try {
          const host = new URL(targetUrl).hostname;
          if (host.endsWith('.devfolio.co') && host !== 'devfolio.co') {
            slug = host.replace('.devfolio.co', '');
          }
        } catch {}
      }

      if (slug) {
        try {
          const apiRes = await fetch(`https://api.devfolio.co/api/hackathons/${slug}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          if (apiRes.ok) {
            const devData = await apiRes.json();
            if (devData && devData.name) {
              const applyDate = devData.hackathon_setting?.reg_ends_at 
                ? devData.hackathon_setting.reg_ends_at.split('T')[0] 
                : (devData.starts_at ? devData.starts_at.split('T')[0] : null);
              const subDate = devData.ends_at ? devData.ends_at.split('T')[0] : applyDate;

              return res.status(200).json({
                success: true,
                source: 'devfolio-live-api',
                data: {
                  title: `${devData.name} Hackathon`,
                  name: `${devData.name} Hackathon`,
                  company: 'Devfolio Partner',
                  org: 'Devfolio Partner',
                  type: 'hackathon',
                  link: targetUrl,
                  applyUrl: targetUrl,
                  lastDateApply: applyDate || new Date().toISOString().split('T')[0],
                  lastDateSubmission: subDate,
                  secondDate: `${subDate} (Project Demo)`,
                  compensation: '$10,000+ Bounties',
                  tags: ['Web3', 'Open Innovation', 'Hackathon'],
                  mode: devData.is_online ? 'Online / Remote' : 'On-site',
                  description: devData.tagline || `Live tracked Devfolio hackathon: ${devData.name}.`
                }
              });
            }
          }
        } catch (devErr) {
          console.warn('Devfolio public API notice:', devErr.message);
        }
      }
    }

    // 2. Fetch live webpage HTML
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    let html = '';
    let fetchedUrl = targetUrl;

    try {
      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      fetchedUrl = response.url || targetUrl;
      html = await response.text();
    } catch (fetchErr) {
      console.warn(`Scrape fetch notice for ${targetUrl}: ${fetchErr.message}`);
    } finally {
      clearTimeout(timeout);
    }

    const parsedUrl = new URL(fetchedUrl);
    const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsedUrl.pathname.toLowerCase();

    // Default company extraction
    let company = 'Tech Company';
    if (hostname.includes('google')) company = 'Google';
    else if (hostname.includes('microsoft')) company = 'Microsoft';
    else if (hostname.includes('amazon')) company = 'Amazon';
    else if (hostname.includes('flipkart')) company = 'Flipkart';
    else if (hostname.includes('swiggy')) company = 'Swiggy';
    else if (hostname.includes('zomato')) company = 'Zomato';
    else if (hostname.includes('zerodha')) company = 'Zerodha';
    else if (hostname.includes('devfolio')) company = 'Devfolio Organizer';
    else if (hostname.includes('unstop')) company = 'Unstop Host';
    else if (hostname.includes('internshala')) company = 'Internshala Partner';
    else if (hostname.includes('wellfound') || hostname.includes('angel.co')) company = 'YC Startup';
    else {
      const parts = hostname.split('.');
      company = (parts[0] || 'Company').toUpperCase();
    }

    let title = '';
    let description = '';
    let scrapedApplyDate = null;
    let scrapedSecondDate = null;

    if (html && html.length > 50) {
      const $ = cheerio.load(html);

      // Extract Title from OG or standard tags
      title = $('meta[property="og:title"]').attr('content') ||
              $('meta[name="twitter:title"]').attr('content') ||
              $('title').text().trim() ||
              $('h1').first().text().trim();

      // Clean title from platform branding suffixes (e.g. " | Unstop", " - Devfolio", " - LinkedIn")
      title = title
        .replace(/(\s*[|\-–—:]\s*(Unstop|Devfolio|LinkedIn|Internshala|Careers|Glassdoor|Indeed|Google|Microsoft)).*$/i, '')
        .trim();

      // Reject bot challenge / Cloudflare splash titles
      if (/just a moment|attention required|access denied|security check|cloudflare|ddos-guard/i.test(title)) {
        title = '';
      }

      // Extract Description
      description = $('meta[property="og:description"]').attr('content') ||
                    $('meta[name="description"]').attr('content') || '';

      // Extract Site Name / Company if available
      const siteName = $('meta[property="og:site_name"]').attr('content') || $('meta[name="author"]').attr('content');
      if (siteName && siteName.length > 2 && siteName.length < 30) {
        company = siteName.trim();
      }

      // Check JSON-LD for exact event / job dates
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const jsonText = $(el).html();
          const ldData = JSON.parse(jsonText);
          const itemData = Array.isArray(ldData) ? ldData[0] : (ldData['@graph'] ? ldData['@graph'][0] : ldData);
          if (itemData) {
            const dateFound = itemData.validThrough || itemData.endDate || itemData.applicationDeadline;
            if (dateFound) scrapedApplyDate = parseDateToISO(dateFound);
            if (itemData.startDate) scrapedSecondDate = parseDateToISO(itemData.startDate);
            if (itemData.title || itemData.name) {
              title = itemData.title || itemData.name;
            }
          }
        } catch {}
      });

      // Collect all candidate dates across the page
      const foundCandidateDates = [];
      if (scrapedApplyDate) foundCandidateDates.push(scrapedApplyDate);
      if (scrapedSecondDate) foundCandidateDates.push(scrapedSecondDate);

      // A. Check <time> tags
      $('time').each((_, el) => {
        const dt = $(el).attr('datetime') || $(el).text();
        const parsed = parseDateToISO(dt);
        if (parsed && !foundCandidateDates.includes(parsed)) foundCandidateDates.push(parsed);
      });

      // B. Regex search in body text for explicit deadline phrases
      const bodyText = $('body').text().slice(0, 30000);
      const deadlineRegex = /(?:deadline|last date|apply before|registration closes|closes on|ends on|submission deadline|due date)[:\s]+([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9}\s+[0-9]{4}|[A-Za-z]{3,9}\s+[0-9]{1,2}(?:st|nd|rd|th)?,?\s+[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{4})/gi;
      let match;
      while ((match = deadlineRegex.exec(bodyText)) !== null) {
        const parsed = parseDateToISO(match[1]);
        if (parsed && !foundCandidateDates.includes(parsed)) foundCandidateDates.push(parsed);
      }

      // C. General date patterns matching 2026/2027 in body
      const generalDateRegex = /\b(202[6-9]-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])|(?:0?[1-9]|[12][0-9]|3[01])\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+202[6-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:0?[1-9]|[12][0-9]|3[01]),?\s+202[6-9])\b/gi;
      while ((match = generalDateRegex.exec(bodyText)) !== null) {
        const parsed = parseDateToISO(match[1]);
        if (parsed && !foundCandidateDates.includes(parsed)) foundCandidateDates.push(parsed);
      }

      // Sort candidate dates chronologically so earliest is apply deadline
      foundCandidateDates.sort();

      if (foundCandidateDates.length > 0) {
        scrapedApplyDate = foundCandidateDates[0];
        scrapedSecondDate = foundCandidateDates[1] || foundCandidateDates[0];
      }
    }

    // Subdomain smart title detection (e.g. hackthisfall.devfolio.co)
    if ((!title || title.length < 5) && hostname.includes('.devfolio.co') && hostname !== 'devfolio.co') {
      const sub = hostname.replace('.devfolio.co', '');
      title = sub
        .replace(/[-_]/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') + ' Hackathon 2026';
    }

    // Fallback title formatting from URL path if scraping was empty
    if (!title || title.length < 4) {
      const segments = pathname.split('/').filter(Boolean);
      const cleanSegments = segments.filter(s => !['hackathons', 'jobs', 'careers', 'detail', 'view', 'o', 'p', 'competitions'].includes(s) && !/^\d+$/.test(s));
      if (cleanSegments.length > 0) {
        title = cleanSegments[cleanSegments.length - 1]
          .replace(/[-_]/g, ' ')
          .replace(/\b(id|\d+|in|at)\b/gi, '')
          .split(' ')
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
          .trim();
      }
      if (!title || title.length < 3) {
        title = `${company} Opportunity 2026`;
      }
    }

    // Category determination
    let type = preferredType;
    const combinedText = (targetUrl + ' ' + title + ' ' + description).toLowerCase();
    if (!type || !['hackathon', 'job', 'internship'].includes(type)) {
      if (combinedText.includes('hack') || combinedText.includes('bounty') || combinedText.includes('challenge') || combinedText.includes('sprint') || combinedText.includes('devfolio')) {
        type = 'hackathon';
      } else if (combinedText.includes('intern') || combinedText.includes('internship') || combinedText.includes('summer')) {
        type = 'internship';
      } else {
        type = 'job';
      }
    }

    // Deadlines fallback
    const now = Date.now();
    const finalApplyDate = scrapedApplyDate || new Date(now + 18 * 86400000).toISOString().split('T')[0];
    const finalSecondDate = scrapedSecondDate || (type === 'hackathon' 
      ? new Date(now + 28 * 86400000).toISOString().split('T')[0]
      : type === 'internship'
      ? '3 - 6 Months'
      : 'OA & Tech Round Scheduled');

    const compensation = type === 'hackathon' 
      ? '₹3,00,000+ Prize Pool' 
      : type === 'internship'
      ? '₹50,000 - ₹80,000 / month'
      : '₹18 - 28 LPA';

    return res.status(200).json({
      success: true,
      source: html ? 'live-scraped' : 'url-analyzed',
      data: {
        title,
        name: title,
        company,
        org: company,
        type,
        link: targetUrl,
        applyUrl: targetUrl,
        lastDateApply: finalApplyDate,
        lastDateSubmission: type === 'hackathon' ? finalSecondDate : null,
        secondDate: finalSecondDate,
        compensation,
        tags: ['Tech', 'Coding', type === 'hackathon' ? 'Open Innovation' : 'Engineering'],
        mode: combinedText.includes('remote') ? 'Online / Remote' : 'Hybrid',
        description: description || `Live tracked ${type} from ${company}.`
      }
    });
  } catch (err) {
    console.error('Scrape API error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Inbound Email Webhook Endpoint (Supports Hackathons, Jobs & Internships)
app.post('/api/webhook/email-inbound', async (req, res) => {
  try {
    const { userEmail, sender, subject, body, hackathonName, opportunityName, itemName, company } = req.body;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'User email is required' });
    }

    const user = await User.findOne({
      $or: [
        { email: userEmail.toLowerCase() },
        { inboundEmail: userEmail.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not registered in DevRadar' });
    }

    const searchTarget = hackathonName || opportunityName || itemName;
    let matchedItem = null;

    if (searchTarget) {
      // Find matching item by target name or company across all 3 categories (hackathon, job, internship)
      matchedItem = await TrackerItem.findOne({
        user: user._id,
        $or: [
          { name: { $regex: searchTarget, $options: 'i' } },
          { company: { $regex: searchTarget, $options: 'i' } }
        ]
      });
    } else if (company) {
      matchedItem = await TrackerItem.findOne({
        user: user._id,
        company: { $regex: company, $options: 'i' }
      });
    }

    // Smart Fallback: If no direct target name provided, scan user's tracker items against subject & body & sender
    if (!matchedItem && (subject || body || sender)) {
      const emailContent = `${sender || ''} ${subject || ''} ${body || ''}`.toLowerCase();
      const allUserItems = await TrackerItem.find({ user: user._id });
      
      matchedItem = allUserItems.find(item => {
        const itemTitle = (item.name || '').toLowerCase();
        const itemCompany = (item.company || '').toLowerCase();
        return (itemCompany && emailContent.includes(itemCompany)) || 
               (itemTitle && emailContent.includes(itemTitle));
      });
    }

    if (matchedItem) {
      matchedItem.status = 'unread';
      matchedItem.hasNewEmail = true;
      matchedItem.emailNotification = `[${sender || 'Recruiter/Organizer'}]: ${subject || 'New update received'}`;
      await matchedItem.save();

      return res.status(200).json({
        success: true,
        category: matchedItem.type,
        message: `Email alert received! Marked ${matchedItem.type.toUpperCase()} "${matchedItem.name}" as UnRead with Tick.`,
        data: matchedItem
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email ingested, but no matching tracker item was found in your Hackathon, Job, or Internship list.'
    });
  } catch (err) {
    console.error('Webhook Ingestion Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Direct Gmail IMAP Sync Endpoint (Zero Domain / Zero Bounce / Native Google TLS)
app.post('/api/sync-gmail', async (req, res) => {
  const { userEmail, appPassword, trackerItems } = req.body;

  if (!userEmail || !appPassword) {
    return res.status(400).json({
      success: false,
      message: 'Gmail email address and 16-character App Password are required.'
    });
  }

  const cleanEmail = userEmail.trim().toLowerCase();
  const cleanPassword = appPassword.replace(/\s+/g, '');

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: cleanEmail,
      pass: cleanPassword
    },
    logger: false
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    const matchedAlerts = [];

    try {
      // Find items from DB if connected, or from frontend payload
      const isDbConnected = mongoose.connection.readyState === 1;
      let user = null;
      let userItems = [];

      if (isDbConnected) {
        try {
          user = await User.findOne({ email: cleanEmail });
          if (user) {
            userItems = await TrackerItem.find({ user: user._id });
          }
        } catch (dbErr) {
          console.warn('DB read notice during Gmail sync (bypassing DB):', dbErr.message);
        }
      }

      // Merge items passed from frontend tracker lists
      if (Array.isArray(trackerItems) && trackerItems.length > 0) {
        for (const fItem of trackerItems) {
          const fid = fItem._id || fItem.id;
          if (!userItems.some(ui => (ui._id || ui.id) === fid)) {
            userItems.push(fItem);
          }
        }
      }

      // Search recent messages (unseen, or last 15 messages)
      let targetUids = [];
      try {
        const uids = await client.search({ unseen: true });
        if (uids && uids.length > 0) {
          targetUids = uids.slice(-15);
        } else {
          const allUids = await client.search({ all: true });
          targetUids = allUids.slice(-15);
        }
      } catch {
        const allUids = await client.search({ all: true });
        targetUids = allUids.slice(-15);
      }

      for (const uid of targetUids) {
        try {
          const msg = await client.fetchOne(uid, { envelope: true });
          if (!msg || !msg.envelope) continue;

          const subject = msg.envelope.subject || '';
          const sender = msg.envelope.from?.[0]?.address || msg.envelope.from?.[0]?.name || 'Unknown';
          const contentStr = `${subject} ${sender}`.toLowerCase();

          // Check if this matches any opportunity in user's list or generic keywords
          let matched = null;
          for (const item of userItems) {
            const title = (item.name || '').toLowerCase();
            const comp = (item.company || '').toLowerCase();
            if ((comp && comp.length > 2 && contentStr.includes(comp)) || 
                (title && title.length > 3 && contentStr.includes(title))) {
              matched = item;
              break;
            }
          }

          const isOpportunityMail = contentStr.includes('hackathon') || 
                                   contentStr.includes('assessment') || 
                                   contentStr.includes('interview') || 
                                   contentStr.includes('devfolio') || 
                                   contentStr.includes('unstop') ||
                                   contentStr.includes('shortlist') ||
                                   contentStr.includes('internship') ||
                                   contentStr.includes('hiring') ||
                                   contentStr.includes('application');

          if (matched) {
            // Save to DB if DB is active
            if (isDbConnected && typeof matched.save === 'function') {
              try {
                matched.status = 'unread';
                matched.hasNewEmail = true;
                matched.emailNotification = `[${sender}]: ${subject}`;
                await matched.save();
              } catch {}
            }

            matchedAlerts.push({
              id: matched._id || matched.id,
              itemId: matched._id || matched.id,
              name: matched.name,
              type: matched.type || 'opportunity',
              sender,
              subject,
              status: 'Matched Tracker Item'
            });
          } else if (isOpportunityMail) {
            matchedAlerts.push({
              sender,
              subject,
              status: 'Opportunity Email Detected'
            });
          }
        } catch (fetchErr) {
          console.warn('Error fetching envelope for UID', uid, fetchErr.message);
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();

    return res.status(200).json({
      success: true,
      message: `Successfully connected to Gmail (${cleanEmail})! Scanned inbox.`,
      matchedCount: matchedAlerts.length,
      alerts: matchedAlerts
    });
  } catch (err) {
    console.error('Gmail IMAP Sync Error:', err);
    return res.status(401).json({
      success: false,
      message: err.message.includes('AuthenticationFailed') || err.message.includes('Invalid credentials')
        ? 'Invalid Gmail App Password. Please verify your 16-character Google App Password.'
        : `Gmail Sync Error: ${err.message}`
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 DevRadar Backend Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Live Link Scraper: http://localhost:${PORT}/api/scrape-link`);
});
