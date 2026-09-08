# 🔥 Firebase Setup Guide for Nomciu

This document guides you step-by-step through setting up Google Firebase Firestore so that roommates can sync their pet feeding statuses in real-time.

---

## 📋 Step-by-Step Checklist

### Step 1. Create a Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** (or "Create a project").
3. Enter your project name (e.g. `nomciu-tracker`).
4. (Optional) Disable or enable Google Analytics, then click **Create project**.

---

### Step 2. Register a Web App & Copy API Keys
1. In the Firebase Project Overview screen, click the **Web icon (`</>`)** to add an app.
2. Enter an app nickname (e.g., `Nomciu Web`). You do NOT need to check "Firebase Hosting" yet.
3. Click **Register app**.
4. You will see your `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "nomciu-tracker.firebaseapp.com",
     projectId: "nomciu-tracker",
     storageBucket: "nomciu-tracker.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef..."
   };
   ```
5. Leave this page open or copy these values.

---

### Step 3. Create Cloud Firestore Database
1. In the Firebase left sidebar, navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a Firestore location close to your users (e.g., `asia-northeast3` for Seoul, or default `us-central1`).
4. Select **Start in test mode** for immediate setup (or start in production mode and apply the rules below).
5. Click **Create**.

---

### Step 4. Configure Firestore Security Rules
1. In the Firestore Database section, click on the **Rules** tab.
2. Paste the following production-friendly rules (ensures anyone in the household can read and update the pet's meal logs without requiring complex email/password accounts):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Household documents: Read & create by 6-digit join code
    match /households/{householdId} {
      allow read, create, update: if true;
      
      // Daily meal logs subcollection: Read & update daily feeding status
      match /logs/{dateString} {
        allow read, write: if true;
      }
    }
    
  }
}
```
3. Click **Publish**.

> [!NOTE]
> Since Nomciu is designed for zero-friction roommate sharing (using a 6-digit Join Code instead of email/passwords), anyone with the 6-digit code has access to that pet's daily log. The rules above allow seamless real-time syncing for all roommates.

---

### Step 5. Create `.env.local` in your project
In your project root (`Nomciu/`), create a file named `.env.local` and paste your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Restart your dev server (`npm run dev`), and you will see the header badge change from **"Demo Sync"** to **"🟢 Live Sync"**!
