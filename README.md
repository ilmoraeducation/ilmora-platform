# 🎓 ILMORA Education — Premium SaaS Platform v2.0

A luxury dark-themed SaaS education platform for **ILMORA Education** (UAE & India).  
Built with React, Firebase, Three.js, and AI chatbot.

---

## ✅ Features

| Feature | Status |
|---|---|
| 🌐 Homepage (upgraded from v1) | ✅ Complete |
| 🤖 AI Chatbot (no API key needed) | ✅ Complete |
| 🔐 Auth (Login / Register / Reset) | ✅ Complete |
| 🎓 Student Portal (6 tabs) | ✅ Complete |
| 🧑‍💼 Admin Dashboard (6 tabs) | ✅ Complete |
| 📄 PDF Brochure Generator | ✅ Complete |
| 🎨 Poster Generator (4 templates) | ✅ Complete |
| 📱 Mobile Responsive | ✅ Complete |

---

## ⚡ Quick Start (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Firebase (see detailed guide below)
```bash
cp .env.example .env
# Fill in your Firebase values in .env
```

### 3. Run locally
```bash
npm start
# Opens at http://localhost:3000
```

---

## 🔥 Firebase Setup (Step by Step)

### Step 1 — Create Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it: `ilmora-education`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2 — Enable Authentication
1. In the left sidebar → **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method** → click **Email/Password**
4. Toggle **Enable** → click **Save**

### Step 3 — Create Firestore Database
1. Left sidebar → **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** → click **Next**
4. Select your region (choose closest to UAE/India) → click **"Enable"**

### Step 4 — Enable Storage
1. Left sidebar → **Build → Storage**
2. Click **"Get started"** → **"Start in test mode"** → **"Done"**

### Step 5 — Get Your Config Keys
1. Click the **gear icon** ⚙️ → **Project settings**
2. Scroll down to **"Your apps"**
3. Click **"Add app"** → choose the **Web** icon `</>`
4. Name it `ilmora-web` → click **"Register app"**
5. Copy the `firebaseConfig` object values into your `.env` file

### Step 6 — Create Admin User (two options)

**Option A — Easy (via Firebase Console):**
1. Go to Authentication → Users → **"Add user"**
2. Enter: `admin@ilmora.com` + a strong password
3. Copy the UID shown
4. Go to Firestore → **Start collection** → name it `users`
5. Click **"Auto-ID"** → change Document ID to the UID you copied
6. Add these fields:
   - `uid` (string): paste the UID
   - `name` (string): `ILMORA Admin`
   - `email` (string): `admin@ilmora.com`
   - `role` (string): `admin`
   - `status` (string): `active`

**Option B — Script (advanced):**
```bash
# Download your service account key from:
# Firebase Console → Project Settings → Service Accounts → Generate new private key
# Save as scripts/serviceAccountKey.json
cd scripts
npm install firebase-admin dotenv
node createAdmin.js
```

### Step 7 — Apply Security Rules
1. In Firestore → **Rules** tab
2. Paste the contents of `firestore.rules`
3. Click **"Publish"**

---

## 🌐 Deployment Guide

### Option 1 — Vercel (Recommended, Free)

**Method A — GitHub (easiest):**
1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "ILMORA Platform v2"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ilmora-platform.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
3. Click **"Add New Project"** → import your repo
4. Click **"Environment Variables"** → add all your `.env` variables:
   - `REACT_APP_FIREBASE_API_KEY` = your value
   - `REACT_APP_FIREBASE_AUTH_DOMAIN` = your value
   - `REACT_APP_FIREBASE_PROJECT_ID` = your value
   - `REACT_APP_FIREBASE_STORAGE_BUCKET` = your value
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` = your value
   - `REACT_APP_FIREBASE_APP_ID` = your value
5. Click **"Deploy"** → live in ~60 seconds ✅

**Method B — Vercel CLI:**
```bash
npm install -g vercel
npm run build
vercel --prod
# Follow prompts — it auto-detects React
```

### Option 2 — Netlify (Free)
1. Run: `npm run build`
2. Go to [netlify.com](https://netlify.com) → **"Add new site"**
3. Drag & drop the `build/` folder onto Netlify
4. Go to **Site settings → Environment variables** → add all your Firebase vars
5. Trigger redeploy — done ✅

**For routing to work on Netlify**, create `public/_redirects`:
```
/*  /index.html  200
```

### Option 3 — Firebase Hosting (Same ecosystem)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select your project, set public dir to "build", configure as SPA: YES
npm run build
firebase deploy
```

---

## 🔐 Auth System

| Role | Access | How to set |
|---|---|---|
| `admin` | Full admin dashboard | Set `role: "admin"` in Firestore `users` doc |
| `staff` | Same as admin | Set `role: "staff"` in Firestore `users` doc |
| `student` | Student portal only | Auto-assigned on register |

Login flow:
- `/login` → Firebase Auth → check Firestore role → redirect to `/admin` or `/student`
- Token persists across page reloads
- Password reset via Firebase email

---

## 📁 Folder Structure

```
ilmora-platform/
├── public/
│   ├── index.html              ← Three.js CDN loaded here
│   └── images/
│       ├── logo/
│       │   ├── ilmora-white.png
│       │   └── ilmora-dark.png
│       └── universities/       ← 6 partner university logos
├── src/
│   ├── App.js                  ← Routing + auth guards
│   ├── index.js                ← React entry
│   ├── styles/
│   │   └── global.css          ← Luxury dark theme variables
│   ├── context/
│   │   └── AuthContext.js      ← Firebase auth + roles
│   ├── utils/
│   │   └── firebase.js         ← Firebase init
│   ├── components/
│   │   └── shared/
│   │       ├── ChatBot.js      ← AI chatbot (no API needed)
│   │       └── ChatBot.css
│   └── pages/
│       ├── HomePage.js         ← Full website (preserves all v1 content)
│       ├── HomePage.css
│       ├── LoginPage.js
│       ├── RegisterPage.js
│       ├── AuthPages.css       ← Shared auth styles
│       ├── StudentDashboard.js ← 6-tab student portal
│       ├── StudentDashboard.css
│       ├── AdminDashboard.js   ← 6-tab admin panel
│       ├── AdminDashboard.css
│       ├── BrochureGenerator.js ← jsPDF brochure tool
│       ├── BrochureGenerator.css
│       ├── PosterGenerator.js  ← Canvas poster maker
│       └── PosterGenerator.css
├── scripts/
│   └── createAdmin.js          ← One-time admin setup script
├── firestore.rules             ← Security rules (paste in Firebase)
├── vercel.json                 ← Vercel SPA routing
├── .env.example                ← Copy to .env and fill values
├── package.json
└── README.md
```

---

## 🤖 AI Chatbot

The chatbot works **without any API key** — it uses intelligent keyword matching across:
- Program & course questions
- UAE equivalency process
- Fees & payment plans
- Application & enrollment
- Contact information
- Certificate attestation

**To upgrade to Claude API** (optional):
1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Add to `.env`: `REACT_APP_ANTHROPIC_API_KEY=sk-ant-...`
3. In `ChatBot.js`, replace `getBotReply()` with an API call to `claude-sonnet-4-6`

---

## 📧 Email Automation (Optional)

The contact form currently collects leads. To add email sending:

**Option A — EmailJS (Free, no backend):**
1. Sign up at [emailjs.com](https://emailjs.com)
2. Create a template
3. Add to contact form handler in `HomePage.js`:
```js
import emailjs from '@emailjs/browser';
emailjs.send('SERVICE_ID', 'TEMPLATE_ID', formData, 'PUBLIC_KEY');
```

**Option B — Firebase + Trigger Email Extension:**
1. In Firebase → Extensions → install **"Trigger Email"**
2. Connect to your Gmail SMTP
3. Write to `mail` collection in Firestore to trigger sends

---

## 🎨 Brand Colors (preserved from v1)

```css
--gold:     #C9A84C   /* Primary gold */
--bg:       #0D0D0D   /* Main background */
--bg-card:  #14141f   /* Card background */
```

---

## 📞 Contact Details (pre-configured)

- **UAE:** +971 52 968 2123
- **India:** +91 77363 85780
- **Email:** Ilmoraeducationgroup@gmail.com
- **Instagram:** @ilmora_education

---

## 🆘 Troubleshooting

| Problem | Solution |
|---|---|
| `npm install` fails | Use Node.js v18+ (`node --version`) |
| Firebase auth errors | Check `.env` values are correct, no quotes around values |
| Blank page on Vercel | Check all env vars are added in Vercel dashboard |
| Admin can't access dashboard | Make sure `role: "admin"` is set in Firestore `users` collection |
| Images not showing | Ensure `public/images/` folder has all logo + university files |
| Three.js particles not loading | Check CDN in `public/index.html`, needs internet connection |

---

*© 2025 ILMORA Education · UAE & India*
