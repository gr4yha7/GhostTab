// app/(tabs/social.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { useFriends, useGroups, useFriendRequests, useAcceptFriendRequest, useDeclineFriendRequest, useRemoveFriend } from '@/hooks/api';
import { useAuth } from '@/context/AuthContext';
import { useError } from '@/context/ErrorContext';

type TabType = 'friends' | 'groups';

export default function SocialScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showError } = useError();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: friendsData, isLoading: friendsLoading, refetch: refetchFriends } = useFriends('ACCEPTED');
  const { data: requestsData, isLoading: requestsLoading, refetch: refetchRequests } = useFriendRequests();
  const { data: groupsData, isLoading: groupsLoading, refetch: refetchGroups } = useGroups();

  const acceptMutation = useAcceptFriendRequest();
  const declineMutation = useDeclineFriendRequest();
  const removeMutation = useRemoveFriend();

  const isRefreshing = activeTab === 'friends' ? (friendsLoading || requestsLoading) : groupsLoading;

  const handleRefresh = async () => {
    if (activeTab === 'friends') {
      await Promise.all([refetchFriends(), refetchRequests()]);
    } else {
      await refetchGroups();
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await acceptMutation.mutateAsync(friendshipId);
      Alert.alert('Success', 'Friend request accepted!');
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleDeclineRequest = async (friendshipId: string) => {
    try {
      await declineMutation.mutateAsync(friendshipId);
      Alert.alert('Success', 'Friend request declined.');
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friendName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMutation.mutateAsync(friendId);
              Alert.alert('Success', 'Friend removed.');
            } catch (error) {
              showError(error as Error);
            }
          }
        }
      ]
    );
  };

  const filteredFriends = friendsData?.data?.filter((friendship) => {
    const friend = friendship.friend?.id === user?.id ? friendship.user : friendship.friend;
    if (!friend) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      friend.username?.toLowerCase().includes(searchLower) ||
      friend.email?.toLowerCase().includes(searchLower)
    );
  });

  const filteredGroups = groupsData?.data?.filter((group) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower)
    );
  });

  const pendingRequests = requestsData?.data || [];
  console.log("pendingRequests", pendingRequests);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 pb-4 bg-white border-b border-slate-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-slate-900">Social</Text>
          <TouchableOpacity
            onPress={() => router.push('/search-friends')}
            className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center"
          >
            <Icon name="person-add-outline" size={22} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row bg-slate-50 rounded-xl p-1 mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab('friends')}
            className="flex-1 py-2 rounded-lg"
            style={activeTab === 'friends' ? { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 } : {}}
          >
            <Text
              className="text-center text-sm font-medium"
              style={{ color: activeTab === 'friends' ? '#0f172a' : '#64748b' }}
            >
              Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('groups')}
            className="flex-1 py-2 rounded-lg"
            style={activeTab === 'groups' ? { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 } : {}}
          >
            <Text
              className="text-center text-sm font-medium"
              style={{ color: activeTab === 'groups' ? '#0f172a' : '#64748b' }}
            >
              Groups
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="bg-slate-50 rounded-xl px-4 py-3 flex-row items-center">
          <Icon name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor="#cbd5e1"
            className="flex-1 ml-2 text-sm text-slate-900"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#6366f1" />
        }
      >
        {activeTab === 'friends' ? (
          <View>
            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && !searchQuery && (
              <View className="mb-6">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Pending Requests ({pendingRequests.length})
                </Text>
                {pendingRequests.map((request) => {
                  const requester = request.user?.id === user?.id ? request.friend : request.user;
                  if (!requester) return null;
                  return (
                    <View key={request.id} className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 flex-row items-center justify-between shadow-sm">
                      <View className="flex-row items-center gap-3 flex-1">
                        <Avatar src={requester.avatarUrl || ''} size={40} />
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>
                            {requester.username || requester.email?.split('@')[0]}
                          </Text>
                          <Text className="text-[10px] text-indigo-500 font-medium">{requester.email}</Text>
                        </View>
                      </View>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handleAcceptRequest(request.id)}
                          disabled={acceptMutation.isPending}
                          className="bg-indigo-600 px-3 py-1.5 rounded-lg"
                        >
                          {acceptMutation.isPending ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text className="text-white text-xs font-semibold">Accept</Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeclineRequest(request.id)}
                          disabled={declineMutation.isPending}
                          className="bg-slate-100 px-3 py-1.5 rounded-lg"
                        >
                          <Text className="text-slate-600 text-xs font-semibold">Skip</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              All Friends {(filteredFriends && filteredFriends?.length > 0) && `(${filteredFriends.length})`}
            </Text>

            {!filteredFriends || filteredFriends.length === 0 ? (
              <View className="bg-white rounded-2xl p-8 items-center border border-slate-100">
                <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-3">
                  <Icon name="people-outline" size={28} color="#cbd5e1" />
                </View>
                <Text className="text-slate-400 text-center mb-2">
                  {searchQuery ? 'No friends found' : 'No friends yet'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    onPress={() => router.push('/search-friends')}
                    className="mt-2 px-4 py-2 bg-indigo-50 rounded-lg"
                  >
                    <Text className="text-indigo-600 font-medium text-sm">Add Friends</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredFriends.map((friendship) => {
                const friend = friendship.friend?.id === user?.id ? friendship.user : friendship.friend;
                if (!friend) return null;
                return (
                  <TouchableOpacity
                    key={friendship.id || `friend-${friend.id}`}
                    className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <Avatar src={friend.avatarUrl || ''} size={48} />
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-slate-900">
                          {friend.username || friend.email?.split('@')[0]}
                        </Text>
                        <Text className="text-xs text-slate-500 mt-0.5">{friend.email}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveFriend(friend.id, friend.username || friend.email || 'Friend')}
                      className="p-2"
                    >
                      <Icon name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        ) : (
          <View>
            <TouchableOpacity
              onPress={() => router.push('/create-group')}
              className="bg-indigo-600 py-3 rounded-xl mb-4 shadow-lg flex-row items-center justify-center gap-2"
            >
              <Icon name="add-circle-outline" size={20} color="#fff" />
              <Text className="text-white font-medium">Create New Group</Text>
            </TouchableOpacity>

            {!filteredGroups || filteredGroups.length === 0 ? (
              <View className="bg-white rounded-2xl p-8 items-center border border-slate-100">
                <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-3">
                  <Icon name="people-outline" size={28} color="#cbd5e1" />
                </View>
                <Text className="text-slate-400 text-center mb-2">
                  {searchQuery ? 'No groups found' : 'No groups yet'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    onPress={() => router.push('/create-group')}
                    className="mt-2 px-4 py-2 bg-indigo-50 rounded-lg"
                  >
                    <Text className="text-indigo-600 font-medium text-sm">Create Group</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredGroups.map((group) => {
                const isAdmin = group.role === 'ADMIN' || group.role === 'CREATOR';
                return (
                  <TouchableOpacity
                    key={group.id}
                    onPress={() => router.push({ pathname: '/group-detail', params: { id: group.id } })}
                    className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-12 h-12 bg-indigo-50 rounded-xl items-center justify-center">
                        <Text className="text-2xl">{group.icon || '👥'}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>{group.name}</Text>
                        <Text className="text-xs text-slate-500 mt-0.5">
                          {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end gap-1">
                      {group.role === 'CREATOR' && (
                        <View className="bg-indigo-50 px-2 py-0.5 rounded-md">
                          <Text className="text-[9px] font-bold text-indigo-600 tracking-tighter">CREATOR</Text>
                        </View>
                      )}
                      {group.role === 'ADMIN' && (
                        <View className="bg-emerald-50 px-2 py-0.5 rounded-md">
                          <Text className="text-[9px] font-bold text-emerald-600 tracking-tighter">ADMIN</Text>
                        </View>
                      )}
                      <Icon name="chevron-forward" size={18} color="#cbd5e1" />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
