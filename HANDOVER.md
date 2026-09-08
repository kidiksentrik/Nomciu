# 🐾 Nomciu Developer Handover Document

Welcome to **Nomciu** (Pet Feeding Tracker PWA). This document serves as the complete developer handover for setting up the project on another machine, pushing to GitHub, understanding the architecture, and deploying to production.

---

## 1. Project Overview & UX Principles

- **Pet is the Hero**: Pet name & photo dominate the top layout with high emotional connection and dynamic status headlines (e.g., *"Luna is waiting for lunch! 😿"* or *"Luna's belly is full today! 😸"*).
- **Zero-Friction Setup**: No email/password or authentication barriers. Roommates join using a 6-digit Join Code and enter their nickname saved in browser `localStorage`.
- **High Tactile Feedback**: Giant satisfying "FEED NOW" primary button with spring physics (Framer Motion) and celebration confetti bursts upon feeding.
- **Midnight Auto-Reset**: Daily logs are partitioned by local date (`YYYY-MM-DD`). Every midnight resets naturally without needing backend cron jobs.

---

## 2. Tech Stack

- **Framework**: Next.js 14+ (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS, Lucide Icons (`lucide-react`)
- **Micro-Interactions & Animations**: Framer Motion (`framer-motion`) & Canvas Confetti (`canvas-confetti`)
- **Database & Sync**: Google Cloud Firestore (`firebase`) via real-time `onSnapshot`
- **Session State**: Browser `localStorage`

---

## 3. Directory Structure

```text
Nomciu/
├── app/
│   ├── globals.css          # Tailwind directives, custom scrollbars, safe area insets
│   ├── layout.tsx           # Root layout with PWA meta tags & viewport lock
│   └── page.tsx             # Main screen aggregating components & state
├── components/
│   ├── Confetti.tsx         # Tactile celebration burst helper
│   ├── FeedNowButton.tsx    # Giant tactile FEED NOW button & quick meal drawer
│   ├── InviteModal.tsx      # Roommate invite modal (6-digit code & direct share)
│   ├── MealCard.tsx         # Breakfast, Lunch, Dinner card with Pending/Fed states
│   ├── MealGrid.tsx         # 3-meal grid container with date header & reset
│   ├── Navbar.tsx           # App header with join code pill & profile controls
│   ├── OnboardingModal.tsx  # Screen A (Create/Join) & Screen B (Feeder Nickname)
│   └── PetHero.tsx          # Hero pet avatar, dynamic emotion headline & pills
├── hooks/
│   ├── useHousehold.ts      # Household creation, 6-digit join, realtime sync
│   └── useMeals.ts          # Daily meal tracking, feed/undo actions, midnight reset
├── lib/
│   ├── firebase.ts          # Firebase Firestore client with smart fallback detection
│   └── utils.ts             # Time formatters, date strings, join codes, avatars
├── public/
│   ├── icon.svg             # App logo and PWA icon
│   └── manifest.json        # Web App Manifest for mobile installation
├── types/
│   └── index.ts             # Data models (Household, DailyMealLog, MealItem, etc.)
├── FIREBASE_SETUP.md        # Step-by-step Firebase Console instructions
├── HANDOVER.md              # This developer handover document
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

---

## 4. Firestore Data Model & Real-time Flow

### Collections & Documents

1. **Household Document**: `households/{householdId}`
   - `id` (string): 6-digit code matching `joinCode` (e.g., `"749201"`).
   - `joinCode` (string): 6-digit join code for roommates.
   - `petName` (string): Pet name (e.g., `"Luna"`).
   - `petPhotoUrl` (string): Photo URL or base64 data string.
   - `createdAt` (number): Epoch timestamp.

2. **Daily Meal Log Subcollection**: `households/{householdId}/logs/{dateString}`
   - `dateString` format: `YYYY-MM-DD` (e.g., `"2026-09-08"`).
   - Schema:
     ```json
     {
       "date": "2026-09-08",
       "breakfast": {
         "completed": true,
         "fedBy": "Alex",
         "fedAt": "08:30 AM"
       },
       "lunch": {
         "completed": false,
         "fedBy": null,
         "fedAt": null
       },
       "dinner": {
         "completed": false,
         "fedBy": null,
         "fedAt": null
       },
       "updatedAt": 1788856200000
     }
     ```

### Dual-Mode Architecture (Live Sync vs. Demo Sync)
- **Live Firestore Mode**: When valid Firebase keys are provided in `.env.local`, `useHousehold` and `useMeals` bind directly to Firestore `onSnapshot`.
- **Local Demo Mode**: If Firebase keys are absent, the hooks automatically fall back to browser `localStorage` + `BroadcastChannel`. Multiple tabs in the same browser sync with each other instantly!

---

## 5. How to Push to GitHub

To push this repository to GitHub:

```bash
# 1. Initialize git (if not already done)
git init

# 2. Stage all files
git add .

# 3. Create initial commit
git commit -m "feat: initial commit for Nomciu Pet Feeding Tracker PWA"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/nomciu.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 6. How to Clone & Run on Another Machine

On your other computer or developer environment:

```bash
# 1. Clone your repo
git clone https://github.com/YOUR_USERNAME/nomciu.git
cd nomciu

# 2. Install dependencies
npm install

# 3. Setup environment variables (refer to FIREBASE_SETUP.md)
cp .env.example .env.local
# edit .env.local with your Firebase API keys

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your mobile browser or desktop browser.

---

## 7. Deploying to Vercel (Production)

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `nomciu` repository.
4. Under **Environment Variables**, add the 6 variables from `.env.example`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Click **Deploy**. Your PWA will be live on an HTTPS domain (required for PWA installation on iOS/Android)!
