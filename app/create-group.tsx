// app/create-group.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { useFriends, useCreateGroup } from '../hooks/api';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';

const GROUP_ICONS = ['👥', '🎉', '🏠', '✈️', '🍕', '🎮', '💼', '🎓', '⚽', '🎵'];

export default function CreateGroupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showError } = useError();
  const { data: friendsData, isLoading: friendsLoading } = useFriends('ACCEPTED');
  const createGroupMutation = useCreateGroup();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('👥');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  const handleToggleMember = (userId: string) => {
    const updated = new Set(selectedMembers);
    if (updated.has(userId)) {
      updated.delete(userId);
    } else {
      updated.add(userId);
    }
    setSelectedMembers(updated);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      showError('Please enter a group name');
      return;
    }

    try {
      await createGroupMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
        initialMembers: Array.from(selectedMembers),
      });
      router.back();
    } catch (error) {
      showError(error as Error);
    }
  };

  return (
    <View className="absolute inset-0 z-50 bg-slate-50">
      <SafeAreaView className="flex-1">
        <View className="px-4 pt-4 pb-4 bg-white flex-row items-center justify-between border-b border-slate-100">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <Icon name="close" size={18} />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-slate-900 tracking-tight">Create Group</Text>
          </View>
        </View>

        <ScrollView className="flex-1 p-6">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Group Icon
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {GROUP_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                className="w-14 h-14 rounded-2xl items-center justify-center mr-3"
                style={selectedIcon === icon
                  ? { backgroundColor: '#4f46e5', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }
                  : { backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9' }
                }
              >
                <Text className="text-2xl">{icon}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Group Name
          </Text>
          <View className="bg-white rounded-2xl border border-slate-200 p-1 flex-row items-center mb-6">
            <View className="w-10 h-10 items-center justify-center">
              <Icon name="people-outline" size={22} />
            </View>
            <TextInput
              placeholder="E.g. Weekend Squad"
              placeholderTextColor="#cbd5e1"
              className="flex-1 h-10 text-sm font-medium text-slate-900"
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Description (Optional)
          </Text>
          <View className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
            <TextInput
              placeholder="What's this group about?"
              placeholderTextColor="#cbd5e1"
              className="text-sm text-slate-900 min-h-[80px]"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Add Members (Optional)
          </Text>
          {friendsLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator color="#6366f1" />
            </View>
          ) : !friendsData?.data || friendsData.data.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-100 p-6 items-center">
              <Text className="text-slate-400 text-center">No friends to add</Text>
            </View>
          ) : (
            <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {friendsData.data.map((friendship, index) => {
                const friend = friendship.friend.id === user?.id ? friendship.user : friendship.friend;
                const isSelected = selectedMembers.has(friend.id);

                return (
                  <TouchableOpacity
                    key={friend.id}
                    onPress={() => handleToggleMember(friend.id)}
                    className="p-4 flex-row items-center justify-between"
                    style={index !== friendsData.data.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#f8fafc' } : {}}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <Avatar
                        src={friend.avatarUrl || ''}
                        size={40}
                      />
                      <Text className="text-sm font-medium text-slate-900">
                        {friend.username || friend.email?.split('@')[0]}
                      </Text>
                    </View>
                    <View
                      className="w-6 h-6 rounded-full border-2 items-center justify-center"
                      style={isSelected ? { backgroundColor: '#4f46e5', borderColor: '#4f46e5' } : { borderColor: '#cbd5e1' }}
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
            disabled={createGroupMutation.isPending}
            className="w-full py-4 rounded-2xl shadow-lg"
            style={{ backgroundColor: createGroupMutation.isPending ? '#818cf8' : '#4f46e5' }}
          >
            {createGroupMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-medium text-sm text-center">Create Group</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
