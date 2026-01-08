// app/create.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { useFriends, useCreateTab } from '../hooks/api';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';

const ICON_OPTIONS = [
  { name: 'cafe-outline', emoji: '☕' },
  { name: 'airplane-outline', emoji: '✈️' },
  { name: 'bag-handle-outline', emoji: '🛍️' },
  { name: 'restaurant-outline', emoji: '🍽️' },
  { name: 'car-outline', emoji: '🚗' },
  { name: 'ticket-outline', emoji: '🎫' },
  { name: 'gift-outline', emoji: '🎁' },
];

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showError } = useError();
  const { data: friendsData, isLoading: friendsLoading } = useFriends('ACCEPTED');
  const createTabMutation = useCreateTab();

  const [title, setTitle] = useState('');
  const [selectedIconIndex, setSelectedIconIndex] = useState(3);
  const [totalAmount, setTotalAmount] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());

  const toggleParticipant = (userId: string) => {
    const updated = new Set(selectedParticipants);
    if (updated.has(userId)) {
      updated.delete(userId);
    } else {
      updated.add(userId);
    }
    setSelectedParticipants(updated);
  };

  const handleCreate = async () => {
    // Validation
    if (!title.trim()) {
      showError('Please enter a title for the tab');
      return;
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    if (selectedParticipants.size === 0) {
      showError('Please select at least one participant');
      return;
    }

    try {
      // Calculate split amounts
      const participants = Array.from(selectedParticipants).map((userId) => ({
        userId,
      }));

      // Add current user as participant
      if (user) {
        participants.push({ userId: user.id });
      }

      await createTabMutation.mutateAsync({
        title: title.trim(),
        icon: ICON_OPTIONS[selectedIconIndex].emoji,
        totalAmount,
        currency: 'MOVE',
        participants,
      });

      // Navigate back on success
      router.back();
    } catch (error) {
      showError(error as Error);
    }
  };

  const splitAmount = totalAmount
    ? (parseFloat(totalAmount) / (selectedParticipants.size + 1)).toFixed(2)
    : '0.00';

  if (friendsLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="absolute inset-0 z-50 bg-slate-50">
      <SafeAreaView className="flex-1">
        <View className="px-4 pt-4 pb-4 bg-white flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-slate-900 tracking-tight">New Tab</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
          >
            <Icon name="close" size={18} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-6">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            What is it for?
          </Text>
          <View className="bg-white rounded-2xl border border-slate-200 p-1 flex-row items-center mb-6">
            <View className="w-10 h-10 items-center justify-center">
              <Icon name="happy-outline" size={22} />
            </View>
            <TextInput
              placeholder="E.g. Dinner at Luca's"
              placeholderTextColor="#cbd5e1"
              className="flex-1 h-10 text-sm font-medium text-slate-900"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
            {ICON_OPTIONS.map((icon, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedIconIndex(i)}
                className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                  selectedIconIndex === i
                    ? 'bg-indigo-600 shadow-lg'
                    : 'bg-white border border-slate-100'
                }`}
              >
                <Icon
                  name={icon.name as any}
                  size={20}
                  color={selectedIconIndex === i ? '#fff' : '#94a3b8'}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Total Amount
          </Text>
          <View className="relative mb-2">
            <Text className="absolute left-0 text-3xl font-medium text-emerald-500" style={{ top: 10 }}>
              $
            </Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#e2e8f0"
              keyboardType="numeric"
              className="w-full text-5xl font-semibold text-slate-900 pl-8"
              value={totalAmount}
              onChangeText={setTotalAmount}
            />
          </View>
          <Text className="text-[10px] font-medium text-indigo-600 mb-2">
            SPLIT EVENLY AMONG {selectedParticipants.size + 1} PEOPLE
          </Text>
          <Text className="text-sm text-slate-600 mb-8">
            Each person pays: ${splitAmount}
          </Text>

          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            With whom?
          </Text>

          {!friendsData?.data || friendsData.data.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-100 p-6 items-center">
              <Text className="text-slate-400 text-center mb-4">
                You don't have any friends added yet
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/friends')}
                className="bg-indigo-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-medium">Add Friends</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {friendsData.data.map((friendship) => {
                const friend = friendship.friend.id === user?.id ? friendship.user : friendship.friend;
                const isSelected = selectedParticipants.has(friend.id);

                return (
                  <TouchableOpacity
                    key={friendship.id}
                    onPress={() => toggleParticipant(friend.id)}
                    className={`bg-white p-3 rounded-2xl border flex-row items-center justify-between mb-2 ${
                      isSelected ? 'border-indigo-600 bg-indigo-50/10' : 'border-slate-100'
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <Avatar
                        src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${friend.id}`}
                      />
                      <View>
                        <Text className="text-sm font-semibold text-slate-900">
                          {friend.username || friend.email}
                        </Text>
                        <Text className="text-xs text-slate-400">{friend.walletAddress.slice(0, 10)}...</Text>
                      </View>
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'
                      }`}
                    >
                      {isSelected && <Icon name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View className="p-4 bg-white border-t border-slate-100 pb-8">
          <TouchableOpacity
            onPress={handleCreate}
            disabled={createTabMutation.isPending}
            className={`w-full py-4 rounded-2xl shadow-lg ${
              createTabMutation.isPending ? 'bg-indigo-400' : 'bg-indigo-600'
            }`}
          >
            {createTabMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-medium text-sm text-center">Create Tab</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}