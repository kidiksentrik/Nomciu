import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@nomciu.app";

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (e) {
    console.error("Failed to set VAPID details:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { householdId, petName, mealType, mealLabel, fedBy, time, isTest } = body;

    if (!householdId) {
      return NextResponse.json({ error: "Missing householdId" }, { status: 400 });
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn("VAPID keys not configured. Skipping push notification.");
      return NextResponse.json({ message: "VAPID keys not configured" }, { status: 200 });
    }

    const firestore = db;
    if (!firestore) {
      return NextResponse.json({ message: "Database not connected" }, { status: 200 });
    }

    // Query all push subscriptions for this household
    const subsRef = collection(firestore, "households", householdId, "subscriptions");
    const snapshot = await getDocs(subsRef);

    if (snapshot.empty) {
      return NextResponse.json({ message: "No subscribers found for household" }, { status: 200 });
    }

    const payload = JSON.stringify({
      title: isTest ? "🔔 Feedy Push Test" : `🔔 ${petName || "Kami"} had ${mealLabel || "a meal"}!`,
      body: isTest
        ? "Push notifications are working perfectly on this device! 🐾"
        : `${fedBy || "A roommate"} fed ${petName || "Kami"} at ${time || "just now"}.`,
      icon: "/icon.png",
      badge: "/icon.png",
      url: "/",
      tag: isTest ? `feedy-test-${Date.now()}` : `feedy-feed-${Date.now()}`,
      householdId,
      mealType,
      fedBy,
      time,
    });

    let sentCount = 0;
    const sendPromises = snapshot.docs.map(async (docSnap) => {
      const subData = docSnap.data();
      // Don't send notification to the person who just fed the pet (unless it's a test)
      if (!isTest && subData.feederName && subData.feederName === fedBy) {
        return;
      }

      if (!subData.endpoint || !subData.keys) {
        return;
      }

      try {
        await webpush.sendNotification(
          {
            endpoint: subData.endpoint,
            keys: subData.keys,
          },
          payload
        );
        sentCount++;
      } catch (err: any) {
        // If subscription is 404 or 410 (unsubscribed or expired), clean up from Firestore
        if (err.statusCode === 404 || err.statusCode === 410) {
          try {
            await deleteDoc(doc(firestore, "households", householdId, "subscriptions", docSnap.id));
          } catch (e) {
            console.error("Failed to delete expired subscription:", e);
          }
        } else {
          console.error("Failed to send push notification to subscriber:", err);
        }
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, sentCount });
  } catch (error: any) {
    console.error("Error in /api/notify:", error);
    return NextResponse.json({ error: error.message || "Failed to send notifications" }, { status: 500 });
  }
}
