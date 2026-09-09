# 🐾 Feedy - Pet Feeding Tracker PWA

A sleek, minimal, and mobile-first Pet Feeding Tracker Progressive Web App (PWA) built for roommates, couples, and pet-loving households.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)
![PWA](https://img.shields.io/badge/PWA-Installable-purple?style=flat-square)

🌐 **Live Application**: [https://feedy-tracker.vercel.app](https://feedy-tracker.vercel.app)  
*(Legacy compatibility domain: `https://nomciu.vercel.app`)*

---

## ✨ Features

- 🐱 **Pet is the Hero**: Large pet avatar with dynamic emotional status headlines (*"Kami is waiting for breakfast! 🥣"* or *"Kami's belly is full today! 😸"*).
- ⚡ **Zero-Friction Access**: No passwords or email signups. Join via a 6-digit room code (e.g. `814332`) or a 1-click invite link.
- 🥣 **Tactile 3D "FEED" Action**: Giant physical button with Framer Motion spring physics, mobile haptic vibration, and canvas confetti bursts.
- 🔔 **Lock-Screen Web Push Notifications**: Roommates receive instant push alerts whenever anyone feeds the pet (self-filtered so you don't ping yourself).
- 🔄 **Real-Time Multi-Device Sync**: Powered by Google Cloud Firestore (`europe-central2` Warsaw) with sub-100ms sync across devices.
- 🛡️ **Multi-Layer Session Resilience**: Dual-layer LocalStorage + 1-year persistent cookie backup with 1-tap quick restore cards.
- 🌙 **Midnight Auto-Reset**: Daily logs partition by calendar date (`YYYY-MM-DD`) for a clean slate every morning without backend cron jobs.
- 📱 **Mobile-First Deep Dark PWA**: Custom 3D smart feeder app icon, OLED deep dark palette (`#0D0E13`), and iOS safe-area inset support.

---

## 🚀 Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.  
*(Works out-of-the-box in local demo mode even without Firebase credentials!)*

---

## 📖 Documentation

- **[HANDOVER.md](./HANDOVER.md)**: **Complete developer handover, architecture, production configuration, and operating guidelines.**
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**: Step-by-step instructions on setting up Firebase Firestore & security rules.
