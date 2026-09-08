# 🐾 Nomciu - Pet Feeding Tracker PWA

A sleek, minimal, and mobile-first Pet Feeding Tracker Progressive Web App (PWA) built for roommates, couples, and pet-loving households.

![Nomciu Tech Stack](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)

---

## ✨ Features

- 🐶 **Pet is the Hero**: Large pet avatar with dynamic emotional status headlines (*"Luna is waiting for lunch! 😿"* or *"Luna's belly is full today! 😸"*).
- ⚡ **Zero-Friction Roommate Setup**: No passwords or email signups. Simply share a 6-digit Join Code and enter a nickname.
- 🥣 **High Tactile "FEED NOW" Button**: Prominent hero action button with Framer Motion spring physics and celebration confetti bursts.
- 🔄 **Real-Time Multi-Device Sync**: Powered by Cloud Firestore `onSnapshot` for instant updates across all roommates.
- 🌙 **Midnight Auto-Reset**: Date-partitioned schema (`YYYY-MM-DD`) provides a clean slate every morning without cron jobs.
- 📱 **Mobile-First PWA**: Installable on iOS & Android home screens with native app feel.

---

## 🚀 Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
*(Works out-of-the-box in local demo mode even before setting up Firebase!)*

---

## 📖 Documentation

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**: Step-by-step instructions on setting up Firebase Firestore & security rules.
- **[HANDOVER.md](./HANDOVER.md)**: Developer architecture guide, Git push guide, and deployment instructions.
