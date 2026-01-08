// app/detail.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { useTab, useCancelTab, useChannelByTabId } from '../hooks/api';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { showError } = useError();
  const [showMenu, setShowMenu] = useState(false);
  
  const { data: tab, isLoading, refetch } = useTab(id);
  const { data: channel } = useChannelByTabId(id);
  const cancelTabMutation = useCancelTab();

  const handleSettle = () => {
    if (!tab || !user) return;

    const userParticipant = tab.participants.find(p => p.userId === user.id);
    if (!userParticipant) return;

    // Navigate to settlement screen with tab data
    router.push({
      pathname: '/settle',
      params: {
        tabId: tab.id,
        amount: userParticipant.shareAmount,
        title: tab.title,
      },
    });
  };

  const handleRemind = () => {
    // Show reminder sent confirmation
    Alert.alert('Reminder Sent', 'We\'ll notify participants about pending payments.');
  };

  const handleCancelTab = () => {
    Alert.alert(
      'Cancel Tab',
      'Are you sure you want to cancel this tab? This cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelTabMutation.mutateAsync(id);
              router.back();
            } catch (error) {
              showError(error as Error);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({
      pathname: '/edit-tab',
      params: { tabId: id },
    });
  };

  const handleOpenChat = () => {
    if (channel) {
      router.push({
        pathname: '/chat',
        params: { channelId: channel.channelId, tabId: id },
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  if (!tab) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Text className="text-slate-400 text-center mb-4">Tab not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-indigo-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isCreator = tab.creatorId === user?.id;
  const userParticipant = tab.participants.find(p => p.userId === user?.id);
  const canSettle = userParticipant && !userParticipant.paid;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 pb-2 bg-white border-b border-slate-50">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
          >
            <Icon name="chevron-back" size={22} />
          </TouchableOpacity>
          <Text className="text-sm font-bold text-slate-900">
            {tab.title} {tab.icon}
          </Text>
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
          >
            <Icon name="ellipsis-horizontal" size={22} />
          </TouchableOpacity>
        </View>

        {showMenu && (
          <View className="absolute right-4 top-16 bg-white rounded-xl shadow-lg border border-slate-100 z-50">
            {isCreator && tab.status === 'OPEN' && (
              <TouchableOpacity
                onPress={handleEdit}
                className="px-4 py-3 flex-row items-center gap-2 border-b border-slate-50"
              >
                <Icon name="create-outline" size={18} color="#64748b" />
                <Text className="text-sm font-medium text-slate-900">Edit Tab</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleOpenChat}
              className="px-4 py-3 flex-row items-center gap-2 border-b border-slate-50"
            >
              <Icon name="chatbubble-outline" size={18} color="#64748b" />
              <Text className="text-sm font-medium text-slate-900">Open Chat</Text>
            </TouchableOpacity>
            {isCreator && tab.status === 'OPEN' && (
              <TouchableOpacity
                onPress={handleCancelTab}
                className="px-4 py-3 flex-row items-center gap-2"
              >
                <Icon name="trash-outline" size={18} color="#ef4444" />
                <Text className="text-sm font-medium text-red-500">Cancel Tab</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <ScrollView className="flex-1">
        <View className="items-center justify-center py-10 bg-white border-b border-slate-100">
          <View className="w-20 h-20 bg-orange-50 rounded-3xl items-center justify-center mb-4 shadow-sm">
            <Text className="text-4xl">{tab.icon || '💸'}</Text>
          </View>
          <Text className="text-3xl font-semibold text-slate-900 tracking-tight">
            ${tab.totalAmount}
          </Text>
          <Text className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">
            Total Spent
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <View
              className={`px-2 py-1 rounded-lg ${
                tab.status === 'OPEN'
                  ? 'bg-emerald-50'
                  : tab.status === 'SETTLED'
                  ? 'bg-indigo-50'
                  : 'bg-slate-50'
              }`}
            >
              <Text
                className={`text-[10px] font-bold uppercase ${
                  tab.status === 'OPEN'
                    ? 'text-emerald-600'
                    : tab.status === 'SETTLED'
                    ? 'text-indigo-600'
                    : 'text-slate-600'
                }`}
              >
                {tab.status}
              </Text>
            </View>
            {!tab.summary.allSettled && (
              <Text className="text-xs text-slate-500">
                ${tab.summary.remaining} remaining
              </Text>
            )}
          </View>
        </View>

        <View className="p-6">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Participants ({tab.participants.length})
          </Text>

          <View className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {tab.participants.map((participant, index) => {
              const isCurrentUser = participant.userId === user?.id;
              const owes = !participant.paid;

              return (
                <View
                  key={participant.userId}
                  className={`p-4 flex-row items-center justify-between ${
                    index !== tab.participants.length - 1 ? 'border-b border-slate-50' : ''
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <Avatar
                      src={
                        participant.user.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/png?seed=${participant.user.id}`
                      }
                      size={40}
                    />
                    <View>
                      <Text className="text-sm font-semibold text-slate-900">
                        {isCurrentUser
                          ? 'You'
                          : participant.user.username || participant.user.email?.split('@')[0]}
                      </Text>
                      <Text className="text-[10px] text-slate-400 font-medium uppercase">
                        {participant.paid
                          ? 'Settled'
                          : isCreator && !isCurrentUser
                          ? 'Owes to tab'
                          : isCurrentUser
                          ? 'Owes to tab'
                          : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end gap-1">
                    <Text
                      className={`font-semibold text-sm ${
                        participant.paid ? 'text-emerald-500' : 'text-orange-500'
                      }`}
                    >
                      ${participant.shareAmount}
                    </Text>
                    {participant.paid && (
                      <View className="flex-row items-center gap-1">
                        <Icon name="checkmark-circle" size={12} color="#10b981" />
                        <Text className="text-[9px] text-emerald-500 font-medium">Paid</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {tab.description && (
            <View className="mt-6">
              <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Description
              </Text>
              <View className="bg-white rounded-2xl border border-slate-100 p-4">
                <Text className="text-sm text-slate-700">{tab.description}</Text>
              </View>
            </View>
          )}

          <View className="mt-6">
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Details
            </Text>
            <View className="bg-white rounded-2xl border border-slate-100 p-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-xs text-slate-500">Created by</Text>
                <Text className="text-xs font-medium text-slate-900">
                  {tab.creator.username || tab.creator.email?.split('@')[0]}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-xs text-slate-500">Created on</Text>
                <Text className="text-xs font-medium text-slate-900">
                  {new Date(tab.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500">Currency</Text>
                <Text className="text-xs font-medium text-slate-900">{tab.currency}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {tab.status === 'OPEN' && (
        <View className="p-4 bg-white border-t border-slate-100 flex-row gap-3 pb-8">
          {canSettle ? (
            <TouchableOpacity
              onPress={handleSettle}
              className="flex-1 bg-indigo-600 py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-lg"
            >
              <Icon name="send" size={16} color="#fff" />
              <Text className="text-white font-medium text-sm">Settle Now</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-1 bg-emerald-50 py-3.5 rounded-xl flex-row items-center justify-center gap-2">
              <Icon name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-emerald-600 font-medium text-sm">You're Settled</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={handleRemind}
            className="w-14 bg-white border border-slate-200 rounded-xl items-center justify-center shadow-sm"
          >
            <Icon name="notifications-outline" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleOpenChat}
            className="w-14 bg-white border border-slate-200 rounded-xl items-center justify-center shadow-sm"
          >
            <Icon name="chatbubble-outline" size={20} />
            {channel && channel.unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-[10px] font-bold">{channel.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}