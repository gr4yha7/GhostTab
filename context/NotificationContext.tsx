// src/context/NotificationContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { wsService, Notification } from '../services/websocket';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  markAllAsRead: () => Promise<void>;
}

type UnsubscribeFunction = () => void;

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unsubscribe, setUnsubscribe] = useState<UnsubscribeFunction | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    // Load initial notifications
    loadNotifications();
    loadUnreadCount();

    // Subscribe to WebSocket notifications
    const unsubscribeFn: UnsubscribeFunction = wsService.subscribe((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show local notification
      showLocalNotification(notification);
    });

    setUnsubscribe(unsubscribeFn);
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    }
  }, [token]);

  const loadNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      // TODO: handle pagination
      setNotifications(data.data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await apiService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count', error);
    }
  };

  const showLocalNotification = (notification: Notification) => {
    // Implement local notification using expo-notifications
    // This is a placeholder
    console.log('New notification:', notification.title);
  };

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllAsRead();
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        clearNotifications,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};