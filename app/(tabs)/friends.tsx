// app/(tabs)/friends.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../../components/Icon';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/Card';
import { useFriends, useFriendRequests, useAcceptFriendRequest, useDeclineFriendRequest, useSearchUsers } from '../../hooks/api';
import { useAuth } from '../../context/AuthContext';
import { useError } from '../../context/ErrorContext';

export default function FriendsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showError } = useError();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: friendsData, isLoading: friendsLoading, refetch: refetchFriends, isRefetching } = useFriends('ACCEPTED');
  const { data: requestsData, refetch: refetchRequests } = useFriendRequests();
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(searchQuery, searchQuery.length >= 2);
  
  const acceptMutation = useAcceptFriendRequest();
  const declineMutation = useDeclineFriendRequest();

  const handleRefresh = async () => {
    await Promise.all([refetchFriends(), refetchRequests()]);
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await acceptMutation.mutateAsync({ friendshipId });
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleDeclineRequest = async (friendshipId: string) => {
    try {
      await declineMutation.mutateAsync(friendshipId);
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleAddFriend = () => {
    router.push('/add-friend');
  };

  const pendingRequests = requestsData || [];
  const friends = friendsData?.data || [];

  // Filter friends based on search
  const filteredFriends = searchQuery.length >= 2
    ? friends.filter(f => {
        const friend = f.friend.id === user?.id ? f.user : f.friend;
        const username = friend.username?.toLowerCase() || '';
        const email = friend.email?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return username.includes(query) || email.includes(query);
      })
    : friends;

  if (friendsLoading) {
    return (
      <View className="flex-1 bg-slate-50/50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50/50 pb-24">
      <View className="px-6 pt-12 pb-4 bg-white/80">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-semibold text-slate-900 tracking-tight">Friends</Text>
          <TouchableOpacity
            onPress={handleAddFriend}
            className="w-9 h-9 rounded-full bg-indigo-50 items-center justify-center"
          >
            <Icon name="person-add-outline" size={18} color="#4f46e5" />
          </TouchableOpacity>
        </View>
        <View className="relative">
          <View className="absolute left-3 top-2.5 z-10">
            <Icon name="search-outline" size={16} />
          </View>
          <TextInput
            placeholder="Search name or username"
            placeholderTextColor="#94a3b8"
            className="w-full bg-slate-100 text-sm py-2.5 pl-10 pr-4 rounded-xl"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 p-6"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor="#4f46e5" />
        }
      >
        {pendingRequests.length > 0 && (
          <View className="mb-8">
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Pending Requests ({pendingRequests.length})
            </Text>
            {pendingRequests.map((request) => {
              const requester = request.user.id === user?.id ? request.friend : request.user;
              
              return (
                <Card key={request.id} className="p-4 flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Avatar
                      src={
                        requester.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/png?seed=${requester.id}`
                      }
                    />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-slate-900">
                        {requester.username || requester.email?.split('@')[0]}
                      </Text>
                      <Text className="text-xs text-indigo-500 font-medium">
                        {requester.email}
                      </Text>
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
                </Card>
              );
            })}
          </View>
        )}

        <View>
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            All Friends {filteredFriends.length > 0 && `(${filteredFriends.length})`}
          </Text>

          {filteredFriends.length === 0 ? (
            <Card className="p-8 items-center">
              <Text className="text-slate-400 text-center mb-4">
                {searchQuery.length >= 2
                  ? 'No friends found matching your search'
                  : 'No friends added yet'}
              </Text>
              {searchQuery.length < 2 && (
                <TouchableOpacity
                  onPress={handleAddFriend}
                  className="bg-indigo-600 px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-medium">Add Your First Friend</Text>
                </TouchableOpacity>
              )}
            </Card>
          ) : (
            <View>
              {filteredFriends.map((friendship) => {
                const friend = friendship.friend.id === user?.id ? friendship.user : friendship.friend;

                return (
                  <TouchableOpacity
                    key={friendship.id}
                    onPress={() =>
                      router.push({
                        pathname: '/friend-profile',
                        params: { userId: friend.id },
                      })
                    }
                  >
                    <Card className="p-4 flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center gap-3 flex-1">
                        <Avatar
                          src={
                            friend.avatarUrl ||
                            `https://api.dicebear.com/7.x/avataaars/png?seed=${friend.id}`
                          }
                        />
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-slate-900">
                            {friend.username || friend.email?.split('@')[0]}
                          </Text>
                          <View className="flex-row items-center gap-1.5">
                            <Text className="text-xs text-slate-400">
                              {friend.walletAddress.slice(0, 6)}...{friend.walletAddress.slice(-4)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="w-8 h-8 rounded-full items-center justify-center">
                        <Icon name="chevron-forward" size={16} color="#cbd5e1" />
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}