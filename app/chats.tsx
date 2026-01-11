// app/chats.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { useChannels } from '../hooks/api';
import { useAuth } from '../context/AuthContext';

export default function ChatsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: channelsData, isLoading, refetch } = useChannels();

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  function ChannelItem({ channel, router }: { channel: any; router: any }) {
    const lastMessage = channel.lastMessage;

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/chat',
            params: { channelId: channel.channelId, tabId: channel.tabId || '' },
          })
        }
        className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="relative">
              <View className="w-12 h-12 bg-indigo-50 rounded-full items-center justify-center">
                <Icon name="chatbubbles" size={24} color="#6366f1" />
              </View>
              {channel.unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">
                    {channel.unreadCount > 9 ? '9+' : channel.unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-slate-900 mb-0.5">
                {channel.name || 'Tab Chat'}
              </Text>
              {lastMessage ? (
                <Text className="text-sm text-slate-500" numberOfLines={1}>
                  {lastMessage.text}
                </Text>
              ) : (
                <Text className="text-sm text-slate-400 italic" numberOfLines={1}>
                  No messages yet
                </Text>
              )}
            </View>
          </View>
          <View className="items-end">
            {(lastMessage?.createdAt || channel.lastMessageAt) && (
              <Text className="text-xs text-slate-400">
                {formatLastMessageTime(lastMessage?.createdAt || channel.lastMessageAt)}
              </Text>
            )}
            <Icon name="chevron-forward" size={20} color="#cbd5e1" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 pb-4 bg-white border-b border-slate-100">
        <Text className="text-2xl font-bold text-slate-900">Chats</Text>
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#6366f1" />
        }
      >
        {!channelsData || channelsData.channels.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center border border-slate-100">
            <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-3">
              <Icon name="chatbubbles-outline" size={28} color="#cbd5e1" />
            </View>
            <Text className="text-slate-400 text-center mb-1">No chats yet</Text>
            <Text className="text-slate-500 text-xs text-center">
              Start a conversation from a tab or group
            </Text>
          </View>
        ) : (
          channelsData.channels.map((channel) => (
            <ChannelItem key={channel.channelId} channel={channel} router={router} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
