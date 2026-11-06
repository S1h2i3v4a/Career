Link:- https://career-seven-tawny.vercel.app

# DevRadar ⚡ — Modern Hackathons, Jobs & Internships Platform

DevRadar ek modular full-stack application hai jise **frontend** aur **backend** do alag-alag dedicated folders mein organize kiya gaya hai:

```
List/
├── frontend/                     # 🎨 React 18 + Vite + Tailwind CSS
│   ├── src/                      # Components, Hooks, API services, Link Scrapers
│   ├── index.html                # Main HTML entry point
│   ├── vite.config.js            # Vite configuration & dev server
│   ├── tailwind.config.js        # Modern styling & color theme
│   ├── package.json              # Frontend dependencies & scripts
│   └── dist/                     # Optimized production build
│
├── backend/                      # ⚙️ Node.js + Express + MongoDB Atlas
│   ├── config/db.js              # MongoDB Atlas connection
│   ├── controllers/              # Auth & Tracker controllers
│   ├── middleware/auth.js        # JWT authorization middleware
│   ├── models/                   # Mongoose schemas (User, TrackerItem)
│   ├── routes/                   # REST API routes
│   ├── server.js                 # Express server, Live Link Scraper & Gmail IMAP
│   ├── .env                      # Database URI, JWT secret & server port
│   └── package.json              # Backend dependencies & scripts
│
├── package.json                  # 🚀 Root workspace scripts (run both from root)
└── README.md
```

---

## 🚀 How to Run the Project

### Option A: Root Folder se (Recommended)
Aap bina kisi folder mein switch kiye root directory se hi dono ko chala sakte hain:

```bash
# 1. Frontend Dev Server chalane ke liye:
npm run dev

# 2. Backend Server chalane ke liye:
npm run server

# 3. Production Build create karne ke liye:
npm run build
```

---

### Option B: Separate Folders se

#### 1. Frontend Folder:
```bash
cd frontend
npm run dev
# URL: http://localhost:3000
```

#### 2. Backend Folder:
```bash
cd backend
npm start
# URL: http://localhost:5000
```

---

## 🌟 Key Features

1. **3 Dedicated Opportunity Tracks:**
   - 🚀 **Hackathons:** Problem statements, submission deadlines & prize pools.
   - 💼 **Full-Time Tech Jobs:** CTC packages, OA assessment links & interview rounds.
   - 🎓 **Internships:** Monthly stipends, 3-6 month durations & PPO callbacks.

2. **Universal Smart Link Scraper:**
   - Kisi bhi URL (Unstop, Devfolio, Google, Internshala, etc.) ka link paste karein — website automatically accurate title, company, dates aur category fetch kar leti hai.

3. **Todo Tracker with Strikethrough & Inline Editing:**
   - Expired deadlines par laser-cut red line.
   - ✏️ Inline row editor for dates and titles.
   - 🗑️ Synchronized 2-way deletion across cards and MongoDB.

4. **Native Gmail IMAP Sync:**
   - Google App Password se direct secure TLS connection (`imap.gmail.com`).
   - Zero domain bounce, no fake MX records needed.
   - Naye emails aate hi row instantly **UnRead (✔ Tick)** banke highlight ho jaati hai!
