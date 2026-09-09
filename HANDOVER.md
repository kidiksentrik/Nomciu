# 🐾 Feedy Developer Handover & Architecture Document

Welcome to **Feedy** (formerly *Nomciu*), a mobile-first, zero-friction Pet Feeding Tracker Progressive Web App (PWA).  
This document is the **single source of truth** for any developer or AI assistant continuing development on any machine.

> [!IMPORTANT]
> **Developer Golden Rule**: Whenever a new feature is added, modified, or reconfigured, **this `HANDOVER.md` document MUST be updated and committed** to ensure seamless continuity across development environments.

---

## 1. Project Overview & Core Principles

- **Brand Name**: **Feedy** (rebranded from *Nomciu* for a clean, modern, global feel).
- **Core Purpose**: Prevent overfeeding or missed meals in multi-roommate / family households through instant real-time synchronization and lock-screen push notifications.
- **Pet is the Hero**: The pet’s photo and name dominate the top hero section with dynamic emotion headlines (e.g., *"Kami is waiting for breakfast! 🥣"* or *"Kami's belly is full today! 😸"*).
- **Zero-Friction Access**: No passwords, email signups, or OAuth barriers. Users join via a **6-digit room code** (e.g., `814332`) or a **one-click invite link** (`https://feedy-tracker.vercel.app/?join=814332`).
- **Tactile Primary Action**: The centerpiece is a giant 3D mechanical red **`FEED`** button with physical spring physics (Framer Motion), mobile haptic vibration, and canvas confetti bursts.
- **Midnight Auto-Reset**: Daily logs are partitioned by calendar date (`YYYY-MM-DD`). Every midnight resets naturally without requiring backend cron jobs.

---

## 2. Live Production Infrastructure & Active Data

- **Primary Production URL**: [https://feedy-tracker.vercel.app](https://feedy-tracker.vercel.app)
- **Legacy Compatibility URL**: [https://nomciu.vercel.app](https://nomciu.vercel.app) *(Kept active so existing roommates' installed PWA icons never break)*
- **GitHub Repository**: [https://github.com/kidiksentrik/Nomciu](https://github.com/kidiksentrik/Nomciu) (branch: `main`)
- **Hosting Provider**: Vercel (automatic continuous deployment on push to `main`)
- **Database**: Google Cloud Firestore (`firebase` v11)
  - **Region**: `europe-central2` (Warsaw, Poland) — ultra-low latency (<50ms) for European users.
  - **Project ID**: `nomciu-d622f` (Internal cloud resource name; never visible in UI).
- **Active User Household**:
  - **Pet Name**: `Kami` (Siamese cat)
  - **Household Join Code**: **`814332`**
  - **Direct Join URL**: `https://feedy-tracker.vercel.app/?join=814332`

---

## 3. Tech Stack & Design System

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14+ (App Router, React 18, TypeScript) | SSR, PWA manifest handling, API routes |
| **Styling** | Tailwind CSS 3.4 | Utility-first responsive styling, iOS safe-area insets |
| **Icons** | Lucide React (`lucide-react`) | Consistent modern line icons |
| **Animations** | Framer Motion 11 | Tactile button press springs, modals, popovers |
| **Celebration** | Canvas Confetti (`canvas-confetti`) | Visual reward when feeding |
| **Database** | Firebase Firestore (Web SDK v11) | Real-time `onSnapshot` multi-device sync |
| **Push Alerts** | Web Push (`web-push` npm) + Service Worker | VAPID-authenticated lock-screen notifications |
| **Storage** | Multi-layer: `localStorage` + 1-year persistent cookie | Resilient PWA re-installs & cache resets |

### Deep Dark Mode Palette
- **Background**: `#0D0E13` (true deep dark, OLED friendly)
- **Card Surfaces**: `#161822` / `#1A1C26`
- **Borders & Dividers**: `#282C3D`
- **Text Primary**: `#F3F4F6` (high readability)
- **Text Muted**: `#9CA3AF` / `#A1A1AA`
- **Brand Accents**: Peach `#F97316` to Amber `#F59E0B`
- **Big Red Button**: Linear gradient `from #FF2A55 via #E11D48 to #9F1239` enclosed in dark brushed titanium chassis (`#232736`).

---

## 4. Architecture & Key Subsystems

### A. Multi-Layer Persistence (`lib/storage.ts`)
To prevent data loss when users remove and re-add PWA home screen icons on iOS/Android:
1. Every household ID, nickname, and recent household list is saved to **both `localStorage` AND a 1-year persistent cookie (`document.cookie; SameSite=Lax; max-age=31536000`)**.
2. iOS Safari and standalone WebClips share domain cookies. If `localStorage` is cleared on WebClip reinstall, the cookie automatically recovers the session.
3. Backward compatibility: Reads `feedy_*` keys first, with fallback to legacy `nomciu_*` keys.

### B. 1-Tap Quick Reconnect (`components/OnboardingModal.tsx`)
- If a user opens the app without an active session, the top of the onboarding modal renders a **"⚡ Recently Connected"** card displaying the pet avatar, name (`Kami`), and join code (`#814332`).
- A single tap on **[Reconnect]** restores the full session in 1 second with zero typing.
- Quick chips (`#814332 (Kami)`) also appear on the [Join with Code] tab.

### C. Web Push Notification Pipeline
1. **Subscription**:
   - PWA registers service worker at `/sw.js`.
   - Device subscribes via `PushManager.subscribe()` using `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
   - Subscription endpoint and auth keys are saved to Firestore: `households/{householdId}/subscriptions/{deviceId}`.
2. **Dispatch (`app/api/notify/route.ts`)**:
   - Triggered when anyone feeds the pet or clicks **[Send Test Alert]** in the profile menu.
   - **Self-Filtering Logic**: The person who pressed `FEED` does not receive self-notifications; all other registered roommates in the household receive the notification simultaneously.
   - For test alerts (`isTest: true`), the notification is delivered directly to the requesting device.
   - Notification payload uses PNG icons (`/icon.png`) for universal iOS WebKit & Android lock-screen compatibility.

### D. Client-Side Image Compression (`components/EditPetModal.tsx`)
- When users upload custom pet photos, an HTML5 Canvas downsamples the image client-side to max 400x400px (JPEG 85%, ~30KB).
- The compressed base64 string is stored directly in the Firestore household document, enabling instant photo updates for all roommates with zero external S3/Firebase Storage billing!

---

## 5. Directory Structure & File Map

```text
Nomciu/ (Project root)
├── app/
│   ├── api/
│   │   └── notify/
│   │       └── route.ts          # Backend Web Push notification dispatcher
│   ├── globals.css               # Tailwind directives, notch/safe-area classes, 3D button CSS
│   ├── layout.tsx                # HTML root, PWA meta tags, apple-mobile-web-app-title
│   └── page.tsx                  # Main application orchestrator & state aggregator
├── components/
│   ├── Confetti.tsx              # Canvas confetti cannon trigger
│   ├── EditPetModal.tsx          # Real-time pet name & custom photo modal with canvas compression
│   ├── FeedNowButton.tsx         # Giant tactile 3D FEED button & celebratory completion status
│   ├── InviteModal.tsx           # 1-click invite link & 6-digit code copy modal
│   ├── MealCard.tsx              # Breakfast/Lunch/Dinner individual meal card
│   ├── MealGrid.tsx              # 3-meal collapsible tracking grid with Undo & Reset Today
│   ├── Navbar.tsx                # Brand header, join code pill, push bell, profile menu
│   ├── NotificationBanner.tsx    # Sleek lock-screen push permission opt-in banner
│   ├── OnboardingModal.tsx       # Welcome screen, 1-tap quick restore, Create / Join tabs
│   └── PetHero.tsx               # Pet avatar, camera badge for editing, dynamic aura & emotion headline
├── hooks/
│   ├── useHousehold.ts           # Household Firestore sync, create, join, leave, profile update
│   ├── useMeals.ts               # Daily meal tracking, feed/undo, midnight rollover, push trigger
│   └── usePushNotifications.ts   # SW registration, PushManager subscription, Firestore sync
├── lib/
│   ├── firebase.ts               # Firestore initialization & config validation
│   ├── storage.ts                # Dual-layer localStorage + 1-year cookie persistence
│   └── utils.ts                  # Time window calculators, date helpers, preset avatars
├── public/
│   ├── icon.png                  # High-resolution 3D Feeder app icon (512x512)
│   ├── apple-touch-icon.png      # iOS home screen touch icon
│   ├── icon.svg                  # Vector Feeder icon
│   ├── manifest.json             # PWA Web App Manifest (Feedy)
│   └── sw.js                     # Background Service Worker for push notifications
├── types/
│   └── index.ts                  # TypeScript interfaces (Household, DailyMealLog, RecentHousehold)
├── FIREBASE_SETUP.md             # Firebase configuration guide & security rules
├── HANDOVER.md                   # THIS DOCUMENT (Developer handover & architecture)
├── README.md                     # Public repository overview
├── package.json                  # Dependencies and scripts (name: "feedy")
└── next.config.mjs               # Next.js configuration
```

---

## 6. Firestore Schema & Security Rules

### Data Model
```text
households/ (collection)
└── {householdId}/ (document, e.g. "814332")
    ├── id: "814332"
    ├── joinCode: "814332"
    ├── petName: "Kami"
    ├── petPhotoUrl: "data:image/jpeg;base64,..."
    ├── createdAt: 1788856000000
    │
    ├── logs/ (subcollection)
    │   └── {YYYY-MM-DD}/ (document, e.g. "2026-09-09")
    │       ├── date: "2026-09-09"
    │       ├── breakfast: { completed: true, fedBy: "Alex", fedAt: "08:30 AM" }
    │       ├── lunch: { completed: false, fedBy: null, fedAt: null }
    │       ├── dinner: { completed: false, fedBy: null, fedAt: null }
    │       └── updatedAt: 1788856200000
    │
    └── subscriptions/ (subcollection)
        └── {deviceId}/ (document)
            ├── endpoint: "https://fcm.googleapis.com/fcm/send/..."
            ├── keys: { p256dh: "...", auth: "..." }
            ├── feederName: "Sam"
            └── updatedAt: 1788856500000
```

### Active Security Rules (Published on Firebase Console)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /households/{householdId} {
      allow read, write: if true;
      match /{allSubcollections=**} {
        allow read, write: if true;
      }
    }
  }
}
```

---

## 7. Environment Variables (`.env.local`)

Both local development and Vercel production require the following environment variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nomciu-d622f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nomciu-d622f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nomciu-d622f.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=738132595843
NEXT_PUBLIC_FIREBASE_APP_ID=1:738132595843:web:038c9c337cfac84a2377b6
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-Q47LVH8GY5

# Web Push VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BCxZbzmGJzA11oNZwG4t-5r4Q0iecEqttowMUeZbKF74ZOpEWcxAxlrBoL11CttELV5OirLmvecIL6H7AdEj0dk
VAPID_PRIVATE_KEY=K2KiVfSTl1EL6tE6S8k0qBwIuCxcT2CWr5pB9Mqhu94
VAPID_SUBJECT=mailto:admin@nomciu.app
```

---

## 8. Development Commands & Workflow

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build for production (Typecheck & bundle validation)
npm run build

# Deploy to GitHub & Vercel
git add -A
git commit -m "feat: your descriptive change"
git push origin main
# Vercel automatically deploys within 40 seconds!
```

---

## 9. Guidelines for Future Developers & AI Agents

1. **Check this Handover First**: Always read `HANDOVER.md` at the start of any new session or feature development.
2. **Update this Handover After Changes**: If you create a component, add an environment variable, change a domain, or adjust a data model, update `HANDOVER.md` before concluding your turn.
3. **UI Language Consistency**: Keep all user-facing UI labels, notifications, and error strings in natural **English**.
4. **Preserve Backward Compatibility**:
   - Never delete the legacy Vercel domain (`nomciu.vercel.app`) or break the legacy `nomciu_*` cookie/storage fallbacks, as existing roommates rely on them without needing manual intervention.
5. **Dark Mode Integrity**: Adhere strictly to the Deep Dark palette (`#0D0E13` background, `#161822` cards, `#282C3D` borders). Avoid harsh white backgrounds.
6. **Zero-Friction Mandate**: Never introduce mandatory email/password or authentication barriers. Keep household access instantaneous via 6-digit codes and direct links.
