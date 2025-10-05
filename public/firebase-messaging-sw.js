// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase using the configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpPLa8zclJVENgKWXhaitv2vMhS0cmsLg",
  authDomain: "homemadehub-66ae1.firebaseapp.com",
  projectId: "homemadehub-66ae1",
  storageBucket: "homemadehub-66ae1.firebasestorage.app",
  messagingSenderId: "80228001524",
  appId: "1:80228001524:web:d5a2538ff9626ec432a0a1",
  measurementId: "G-98C05PQ69N"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // You can customize this
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});