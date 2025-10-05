import { getFirestore, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { auth, db } from './firebase';

// Function to subscribe to order updates
export const subscribeToOrderUpdates = (orderId, callback) => {
  const orderRef = doc(db, 'orders', orderId);
  
  return onSnapshot(orderRef, (doc) => {
    const order = { id: doc.id, ...doc.data() };
    callback(order);
  });
};

// Function to send notification to user when order status changes
export const notifyOrderUpdate = async (userId, title, body) => {
  try {
    // First, get the user's FCM token from Firestore
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;

    if (!fcmToken) {
      console.error('No FCM token found for user:', userId);
      return { success: false, error: 'No FCM token found for user' };
    }

    // Send notification via API
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        body,
        fcmToken,
        type: 'order_status_update'
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

// Function to register FCM token for user
export const registerFCMToken = async (userId, fcmToken) => {
  try {
    const response = await fetch('/api/users/update-fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        fcmToken
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error registering FCM token:', error);
    throw error;
  }
};

// Function to request notification permission and get token
export const initializeNotifications = async () => {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    try {
      // Register the service worker
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const messaging = getMessaging();
        
        // Check if the browser supports VAPID keys properly
        if ('serviceWorker' in navigator) {
          // Get FCM token with a proper VAPID key from your Firebase project
          // You need to replace this with your actual VAPID key from Firebase Console
          const vapidKey = 'BKwzmVNk5J8J9m3y6Y2r3v6j4H8b7F3n2J8K9m4Y7V3N6P9k2J8Q4R7W5T2Y6U8E4R7'; // Replace with your actual key
          
          const token = await getToken(messaging, { vapidKey });
          return token;
        } else {
          // For browsers that don't support VAPID properly
          const token = await getToken(messaging);
          return token;
        }
      }
    } catch (error) {
      console.warn('Error initializing notifications (this may be expected in development):', error);
      // In development, we might get errors about VAPID keys, so we'll return null
      return null;
    }
  }
  
  return null;
};