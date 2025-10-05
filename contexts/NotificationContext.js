'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onMessageListener } from '../lib/notifications';
import { subscribeToOrderUpdates } from '../lib/notificationService';

const NotificationContext = createContext(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Listen for messages when the app is in the foreground
  useEffect(() => {
    onMessageListener()
      .then(payload => {
        addNotification({
          id: Date.now(),
          title: payload.notification.title,
          body: payload.notification.body,
          timestamp: new Date(),
        });
      })
      .catch(err => console.log('Failed to listen for messages:', err));
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only last 10 notifications
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    addNotification,
    clearNotifications
  };

  return (
    <>
      <NotificationContext.Provider value={value}>
        {children}
      </NotificationContext.Provider>
      
      {/* Notification display component */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white shadow-lg rounded-md p-4 border border-gray-200 max-w-xs w-full animate-fadeIn"
          >
            <h4 className="font-semibold text-gray-900">{notification.title}</h4>
            <p className="text-gray-600 text-sm">{notification.body}</p>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
}