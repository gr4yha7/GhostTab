// app/notifications.tsx
import React from 'react';
import { Text, TouchableOpacity, ScrollView, View, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '../components/Icon';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useAcceptFriendRequest, useDeclineFriendRequest } from '../hooks/api';
import { Notification } from '../services/api';

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: notificationsData, isLoading, refetch, isRefetching } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const acceptFriendMutation = useAcceptFriendRequest();
  const declineFriendMutation = useDeclineFriendRequest();
  const [actedNotifications, setActedNotifications] = React.useState<Record<string, 'ACCEPTED' | 'DECLINED'>>({});

  const notifications = notificationsData?.data || [];
  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleAcceptFriend = async (friendshipId: string, notificationId: string) => {
    try {
      await acceptFriendMutation.mutateAsync(friendshipId);
      setActedNotifications(prev => ({ ...prev, [notificationId]: 'ACCEPTED' }));
      await handleMarkAsRead(notificationId);
    } catch (error) {
      console.error('Failed to accept friend request', error);
    }
  };

  const handleDeclineFriend = async (friendshipId: string, notificationId: string) => {
    try {
      await declineFriendMutation.mutateAsync(friendshipId);
      setActedNotifications(prev => ({ ...prev, [notificationId]: 'DECLINED' }));
      await handleMarkAsRead(notificationId);
    } catch (error) {
      console.error('Failed to decline friend request', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'TAB_CREATED':
        if (notification.data?.tabId) {
          router.push({
            pathname: '/accept-invite',
            params: { tabId: notification.data.tabId },
          });
        }
        break;
      case 'TAB_UPDATED':
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_REMINDER':
      case 'TAB_SETTLED':
        if (notification.data?.tabId) {
          router.push({
            pathname: '/detail',
            params: { id: notification.data.tabId },
          });
        }
        break;
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPTED':
        router.push('/(tabs)/social');
        break;
      case 'MESSAGE_RECEIVED':
        if (notification.data?.channelId) {
          router.push({
            pathname: '/chat',
            params: {
              channelId: notification.data.channelId,
              tabId: notification.data.tabId,
            },
          });
        }
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconConfig: Record<string, { name: string; color: string; bgColor: string }> = {
      FRIEND_REQUEST: { name: 'person-add-outline', color: '#4f46e5', bgColor: '#f5f3ff' },
      FRIEND_ACCEPTED: { name: 'people-outline', color: '#10b981', bgColor: '#ecfdf5' },
      TAB_CREATED: { name: 'add-circle-outline', color: '#4f46e5', bgColor: '#f5f3ff' },
      TAB_UPDATED: { name: 'create-outline', color: '#f59e0b', bgColor: '#fffbeb' },
      PAYMENT_RECEIVED: { name: 'cash-outline', color: '#10b981', bgColor: '#ecfdf5' },
      PAYMENT_REMINDER: { name: 'alarm-outline', color: '#f59e0b', bgColor: '#fffbeb' },
      TAB_SETTLED: { name: 'checkmark-circle-outline', color: '#10b981', bgColor: '#ecfdf5' },
      MESSAGE_RECEIVED: { name: 'chatbubble-outline', color: '#4f46e5', bgColor: '#f5f3ff' },
    };

    return iconConfig[type] || { name: 'notifications-outline', color: '#64748b', bgColor: '#f8fafc' };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="px-4 pt-4 pb-4 flex-row items-center justify-between border-b border-slate-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full border border-slate-100 items-center justify-center"
          >
            <Icon name="arrow-back" size={20} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-sm font-semibold text-slate-900">Notifications</Text>
          <TouchableOpacity
            disabled={markAllAsReadMutation.isPending || notifications.some(n => !n.read) === false}
            className="px-3 py-1.5 rounded-lg"
          >
            {markAllAsReadMutation.isPending ? (
              <ActivityIndicator size="small" color="#4f46e5" />
            ) : (
              <Text
                className="text-xs font-medium"
                style={{ color: notifications.some(n => !n.read) === false ? '#cbd5e1' : '#4f46e5' }}
                onPress={handleClearAll}
              >
                Clear all
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4f46e5" />
          }
        >
          {notifications.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20 px-6">
              <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-4">
                <Icon name="notifications-outline" size={32} color="#cbd5e1" />
              </View>
              <Text className="text-slate-400 text-center text-base mb-2">No notifications yet</Text>
              <Text className="text-slate-400 text-center text-sm">
                We'll notify you when something important happens
              </Text>
            </View>
          ) : (
            <>
              {unreadNotifications.length > 0 && (
                <View>
                  <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 pt-4 pb-2">
                    New ({unreadNotifications.length})
                  </Text>
                  {unreadNotifications.map((notification) => {
                    const config = getNotificationIcon(notification.type);
                    return (
                      <TouchableOpacity
                        key={notification.id}
                        onPress={() => handleNotificationPress(notification)}
                        className="p-4 flex-row items-start gap-3 border-b border-slate-100 bg-indigo-50/30"
                      >
                        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: config.bgColor }}>
                          <Icon name={config.name as any} size={20} color={config.color} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm text-slate-900 font-medium">{notification.title}</Text>
                          <Text className="text-xs text-slate-500 mt-0.5">{notification.body}</Text>
                          {notification.type === 'FRIEND_REQUEST' && notification.data?.friendshipId && (
                            <View className="mt-2">
                              {actedNotifications[notification.id] ? (
                                <View className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                  <Text className="text-[10px] text-slate-500 font-medium italic">
                                    You {actedNotifications[notification.id] === 'ACCEPTED' ? 'accepted' : 'declined'} the request
                                  </Text>
                                </View>
                              ) : (
                                <View className="flex-row gap-2">
                                  <TouchableOpacity
                                    onPress={() => handleAcceptFriend(notification.data!.friendshipId, notification.id)}
                                    disabled={acceptFriendMutation.isPending}
                                    className="bg-indigo-600 px-3 py-1.5 rounded-lg"
                                  >
                                    <Text className="text-white text-[10px] font-bold">Accept</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => handleDeclineFriend(notification.data!.friendshipId, notification.id)}
                                    disabled={declineFriendMutation.isPending}
                                    className="bg-slate-100 px-3 py-1.5 rounded-lg"
                                  >
                                    <Text className="text-slate-600 text-[10px] font-bold">Decline</Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          )}
                          <Text className="text-[10px] text-slate-400 mt-1">
                            {formatTime(notification.createdAt)}
                          </Text>
                        </View>
                        <View className="items-center justify-center pt-1">
                          <TouchableOpacity
                            onPress={() => handleMarkAsRead(notification.id)}
                            className="bg-indigo-50 w-7 h-7 rounded-full items-center justify-center mb-2"
                          >
                            <Icon name="checkmark-done" size={14} color="#4f46e5" />
                          </TouchableOpacity>
                          <View className="w-2 h-2 rounded-full bg-indigo-500" />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {readNotifications.length > 0 && (
                <View>
                  <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 pt-4 pb-2">
                    Earlier
                  </Text>
                  {readNotifications.map((notification) => {
                    const config = getNotificationIcon(notification.type);
                    return (
                      <TouchableOpacity
                        key={notification.id}
                        onPress={() => handleNotificationPress(notification)}
                        className="p-4 flex-row items-start gap-3 border-b border-slate-100 bg-white"
                      >
                        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: config.bgColor }}>
                          <Icon name={config.name as any} size={20} color={config.color} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm text-slate-900">{notification.title}</Text>
                          <Text className="text-xs text-slate-500 mt-0.5">{notification.body}</Text>
                          {notification.type === 'FRIEND_REQUEST' && notification.data?.friendshipId && (
                            <View className="mt-2">
                              {actedNotifications[notification.id] ? (
                                <View className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                  <Text className="text-[10px] text-slate-500 font-medium italic">
                                    You {actedNotifications[notification.id] === 'ACCEPTED' ? 'accepted' : 'declined'} the request
                                  </Text>
                                </View>
                              ) : (
                                <View className="flex-row gap-2">
                                  <TouchableOpacity
                                    onPress={() => handleAcceptFriend(notification.data!.friendshipId, notification.id)}
                                    disabled={acceptFriendMutation.isPending}
                                    className="bg-indigo-600 px-3 py-1.5 rounded-lg"
                                  >
                                    <Text className="text-white text-[10px] font-bold">Accept</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => handleDeclineFriend(notification.data!.friendshipId, notification.id)}
                                    disabled={declineFriendMutation.isPending}
                                    className="bg-slate-100 px-3 py-1.5 rounded-lg"
                                  >
                                    <Text className="text-slate-600 text-[10px] font-bold">Decline</Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          )}
                          <Text className="text-[10px] text-slate-400 mt-1">
                            {formatTime(notification.createdAt)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}