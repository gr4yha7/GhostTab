// hooks/useNotifications.ts
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { NotificationService, NotificationType } from '../services/notifications';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
  const router = useRouter();
  const { user } = useAuth();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Register for push notifications
    if (user) {
      NotificationService.registerForPushNotifications().then((token) => {
        if (token) {
          console.log('Push token:', token);
          // TODO: Send token to backend to store for this user
        }
      });
    }

    // Listen for notifications received while app is foregrounded
    notificationListener.current = NotificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // You can show an in-app notification here if desired
      }
    );

    // Listen for user interactions with notifications
    responseListener.current = NotificationService.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        handleNotificationResponse(data);
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  const handleNotificationResponse = (data: any) => {
    // Navigate based on notification type
    switch (data.type) {
      case NotificationType.TAB_INVITE:
        if (data.tabId) {
          router.push({ pathname: '/accept-invite', params: { tabId: data.tabId } });
        }
        break;
      case NotificationType.TAB_REMINDER:
        if (data.tabId) {
          router.push({ pathname: '/detail', params: { id: data.tabId } });
        }
        break;
      case NotificationType.PAYMENT_RECEIVED:
        if (data.tabId) {
          router.push({ pathname: '/detail', params: { id: data.tabId } });
        }
        break;
      case NotificationType.FRIEND_REQUEST:
        router.push('/social');
        break;
      case NotificationType.GROUP_INVITE:
        if (data.groupId) {
          router.push({ pathname: '/group-detail', params: { id: data.groupId } });
        }
        break;
      case NotificationType.CHAT_MESSAGE:
        if (data.channelId) {
          router.push({
            pathname: '/chat',
            params: { channelId: data.channelId, tabId: data.tabId || '' },
          });
        }
        break;
      default:
        console.log('Unknown notification type:', data.type);
    }
  };

  return {
    scheduleNotification: NotificationService.scheduleNotification,
    cancelNotification: NotificationService.cancelNotification,
    setBadgeCount: NotificationService.setBadgeCount,
    clearBadge: NotificationService.clearBadge,
  };
}
