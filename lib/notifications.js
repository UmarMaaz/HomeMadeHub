import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { auth } from './firebase';

// Real VAPID key for Firebase project - you need to get this from Firebase Console
// For now, using a placeholder - in real implementation, replace with your actual VAPID key
const VAPID_KEY = 'BKwzmVNk5J8J9m3y6Y2r3v6j4H8b7F3n2J8K9m4Y7V3N6P9k2J8Q4R7W5T2Y6U8E4R7'; // Replace with your actual VAPID key

export const requestNotificationPermission = async () => {
  try {
    const messaging = getMessaging();
    
    // Request permission to use notifications
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get the token for this device
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });
      
      return token;
    } else {
      throw new Error('Notification permission not granted');
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    throw error;
  }
};

export const onMessageListener = () => {
  return new Promise((resolve) => {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

// Function to subscribe user to topic (for admin notifications)
export const subscribeToTopic = async (topic) => {
  try {
    // In a real implementation, you would use the Firebase Admin SDK on the server
    // to subscribe users to topics. On the client side, we can't directly subscribe
    // users to topics with the regular Firebase SDK.
    // This would be handled server-side in a real app.
    console.log(`Client-side subscription to topic: ${topic} - In real app, this would be server-side`);
  } catch (error) {
    console.error('Error subscribing to topic:', error);
  }
};