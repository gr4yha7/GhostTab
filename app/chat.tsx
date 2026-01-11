// app/chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import {
  useChannelMessages,
  useSendMessage,
  useMarkChannelAsRead,
  useTab,
  useChannels,
} from '../hooks/api';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import { Message } from '../services/api';

export default function ChatScreen() {
  const router = useRouter();
  const { channelId, tabId } = useLocalSearchParams<{ channelId: string; tabId: string }>();
  const { user } = useAuth();
  const { showError } = useError();
  const flatListRef = useRef<FlatList>(null);

  const [messageText, setMessageText] = useState('');

  const { data: tab } = useTab(tabId);
  const { data: channelsData } = useChannels();
  const { data: messagesData, isLoading, refetch } = useChannelMessages(channelId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkChannelAsRead();

  const channel = channelsData?.channels.find(c => c.channelId === channelId);
  const messages = messagesData?.messages || [];

  useEffect(() => {
    // Mark channel as read when opening
    markAsReadMutation.mutate(channelId);
  }, [channelId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!messageText.trim()) return;

    try {
      const text = messageText.trim();
      setMessageText('');

      await sendMessageMutation.mutateAsync({
        channelId,
        text,
      });

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      showError(error as Error);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.userId === user?.id || item.userId === user?.walletAddress;
    const showAvatar =
      index === messages.length - 1 ||
      messages[index + 1]?.userId !== item.userId;
    const showTimestamp =
      index === messages.length - 1 ||
      new Date(messages[index + 1]?.createdAt).getTime() -
      new Date(item.createdAt).getTime() >
      300000; // 5 minutes

    return (
      <View
        className={`flex-row ${isCurrentUser ? 'justify-end' : 'justify-start'
          } mb-2 px-4`}
      >
        {!isCurrentUser && (
          <View className="mr-2">
            {showAvatar ? (
              <Avatar
                src={item.user.avatarUrl || ''}
                size={32}
              />
            ) : (
              <View className="w-8" />
            )}
          </View>
        )}

        <View className={`max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          {!isCurrentUser && showAvatar && (
            <Text className="text-xs text-slate-500 font-medium mb-1 ml-1">
              {item.user.username || item.user.email?.split('@')[0]}
            </Text>
          )}
          <View
            className={`rounded-2xl px-4 py-2.5 ${isCurrentUser
              ? 'bg-indigo-600'
              : 'bg-white border border-slate-100'
              }`}
          >
            <Text
              className={`text-sm ${isCurrentUser ? 'text-white' : 'text-slate-900'
                }`}
            >
              {item.text}
            </Text>
          </View>
          {showTimestamp && (
            <Text className="text-[10px] text-slate-400 mt-1 mx-1">
              {new Date(item.createdAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <SafeAreaView edges={['top']} className="bg-white border-b border-slate-100">
          <View className="px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center"
              >
                <Icon name="chevron-back" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/detail', params: { id: tabId } })}
                className="flex-row items-center gap-2 flex-1"
              >
                <View className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center">
                  <Text className="text-lg">{'💬'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-900">
                    {tab?.title || channel?.name || 'Tab Chat'}
                  </Text>
                  <Text className="text-xs text-slate-400">
                    {(tab?.participants?.length ?? channel?.memberCount ?? 0)} participants
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/detail', params: { id: tabId } })}
              className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center"
            >
              <Icon name="information-circle-outline" size={20} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View className="flex-1">
          {messages.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6">
              <View className="w-20 h-20 bg-indigo-50 rounded-full items-center justify-center mb-4">
                <Icon name="chatbubbles-outline" size={32} color="#4f46e5" />
              </View>
              <Text className="text-slate-400 text-center text-base mb-2">
                No messages yet
              </Text>
              <Text className="text-slate-400 text-center text-sm">
                Start the conversation about this tab
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 16 }}
              inverted={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )}
        </View>

        <View className="bg-white border-t border-slate-100">
          <View className="px-4 py-3 flex-row items-center gap-2">
            <View className="flex-1 bg-slate-50 rounded-2xl flex-row items-center px-4 py-2">
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type a message..."
                placeholderTextColor="#94a3b8"
                className="flex-1 text-sm text-slate-900"
                multiline
                maxLength={500}
              />
            </View>
            <TouchableOpacity
              onPress={handleSend}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              className={`w-10 h-10 rounded-full items-center justify-center ${messageText.trim() && !sendMessageMutation.isPending
                ? 'bg-indigo-600'
                : 'bg-slate-200'
                }`}
            >
              {sendMessageMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon
                  name="send"
                  size={18}
                  color={messageText.trim() ? '#fff' : '#94a3b8'}
                />
              )}
            </TouchableOpacity>
          </View>
          <SafeAreaView edges={['bottom']} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}