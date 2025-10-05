'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

export default function NotificationHandler() {
  const { notifications } = useNotifications();

  // This component handles the display of notifications
  // The actual notification display is handled by the NotificationContext
  // This component exists to ensure the useNotifications hook is used in the app

  return null;
}