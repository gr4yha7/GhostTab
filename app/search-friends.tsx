// app/search-friends.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { useSearchUsers, useSendFriendRequest, useGroups, useAddGroupMembers } from '../hooks/api';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchFriendsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showError } = useError();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: searchResults, isLoading } = useSearchUsers(debouncedQuery, debouncedQuery.length > 2);
  const { data: groupsData } = useGroups();
  const sendFriendRequestMutation = useSendFriendRequest();
  const addGroupMemberMutation = useAddGroupMembers();

  const handleSendRequest = async (toIdentifier: string, username: string) => {
    try {
      await sendFriendRequestMutation.mutateAsync(toIdentifier);
      Alert.alert('Success', `Friend request sent to ${username}`);
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleAddToGroup = (foundUser: any) => {
    if (!groupsData?.data || groupsData.data.length === 0) {
      Alert.alert(
        'No Groups',
        'You haven\'t created any groups yet. Create a group first to add members.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedUser(foundUser);
    setShowGroupModal(true);
  };

  const handleGroupSelection = async (groupId: string, groupName: string) => {
    if (!selectedUser) return;

    try {
      await addGroupMemberMutation.mutateAsync({
        groupId,
        memberIds: [selectedUser.id],
      });
      setShowGroupModal(false);
      setSelectedUser(null);
      Alert.alert('Success', `Added ${selectedUser.username || 'user'} to ${groupName}`);
    } catch (error) {
      showError(error as Error);
    }
  };

  return (
    <View className="absolute inset-0 z-50 bg-slate-50">
      <SafeAreaView className="flex-1">
        <View className="px-4 pt-4 pb-4 bg-white border-b border-slate-100">
          <View className="flex-row items-center gap-3 mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <Icon name="chevron-back" size={18} />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-slate-900 tracking-tight">Find Friends</Text>
          </View>

          {/* Search Input */}
          <View className="bg-slate-50 rounded-xl px-4 py-3 flex-row items-center">
            <Icon name="search-outline" size={20} color="#94a3b8" />
            <TextInput
              placeholder="Search by email or username..."
              placeholderTextColor="#cbd5e1"
              className="flex-1 ml-2 text-sm text-slate-900"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView className="flex-1 p-4">
          {searchQuery.length === 0 && (
            <View className="bg-white rounded-2xl p-8 items-center border border-slate-100">
              <View className="w-16 h-16 bg-indigo-50 rounded-full items-center justify-center mb-3">
                <Icon name="search-outline" size={28} color="#6366f1" />
              </View>
              <Text className="text-slate-900 font-semibold text-center mb-1">Search for Friends</Text>
              <Text className="text-slate-500 text-sm text-center">
                Enter an email or username to find people
              </Text>
            </View>
          )}

          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <View className="bg-white rounded-2xl p-8 items-center border border-slate-100">
              <Text className="text-slate-500 text-sm text-center">
                Type at least 3 characters to search
              </Text>
            </View>
          )}

          {isLoading && debouncedQuery.length >= 3 && (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#6366f1" />
              <Text className="text-slate-500 text-sm mt-3">Searching...</Text>
            </View>
          )}

          {!isLoading && debouncedQuery.length >= 3 && searchResults && (
            <>
              {searchResults.users.length === 0 ? (
                <View className="bg-white rounded-2xl p-8 items-center border border-slate-100">
                  <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-3">
                    <Icon name="people-outline" size={28} color="#cbd5e1" />
                  </View>
                  <Text className="text-slate-400 text-center">No users found</Text>
                  <Text className="text-slate-500 text-xs text-center mt-1">
                    Try a different search term
                  </Text>
                </View>
              ) : (
                <>
                  <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                    {searchResults.total} result{searchResults.total !== 1 ? 's' : ''}
                  </Text>
                  {searchResults.users.map((foundUser) => {
                    const isCurrentUser = foundUser.id === user?.id;
                    return (
                      <View
                        key={foundUser.id}
                        className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
                      >
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center gap-3 flex-1">
                            <Avatar
                              src={foundUser.avatarUrl || ''}
                              size={48}
                            />
                            <View className="flex-1">
                              <Text className="text-base font-semibold text-slate-900">
                                {foundUser.username || foundUser.email?.split('@')[0]}
                                {isCurrentUser && ' (You)'}
                              </Text>
                              <View className="flex-col">
                                <Text className="text-xs text-slate-500 mt-0.5">{foundUser.email}</Text>
                                <TrustScoreBadge score={foundUser.trustScore} size="small" />
                              </View>
                            </View>
                          </View>
                        </View>

                        {!isCurrentUser && (
                          <View className="flex-row gap-2">
                            <TouchableOpacity
                              onPress={() =>
                                handleSendRequest(
                                  foundUser.email || foundUser.id,
                                  foundUser.username || 'user'
                                )
                              }
                              disabled={sendFriendRequestMutation.isPending}
                              className="flex-1 px-4 py-2 bg-indigo-600 rounded-xl flex-row items-center justify-center gap-2"
                            >
                              {sendFriendRequestMutation.isPending ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <>
                                  <Icon name="person-add-outline" size={16} color="#fff" />
                                  <Text className="text-white font-medium text-sm">Add Friend</Text>
                                </>
                              )}
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleAddToGroup(foundUser)}
                              disabled={addGroupMemberMutation.isPending}
                              className="flex-1 px-4 py-2 bg-emerald-600 rounded-xl flex-row items-center justify-center gap-2"
                            >
                              <Icon name="people-outline" size={16} color="#fff" />
                              <Text className="text-white font-medium text-sm">Add to Group</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </>
              )}
            </>
          )}
        </ScrollView>

        {/* Group Selection Modal */}
        <Modal
          visible={showGroupModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowGroupModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6 pb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-slate-900">Select Group</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowGroupModal(false);
                    setSelectedUser(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                >
                  <Icon name="close" size={18} />
                </TouchableOpacity>
              </View>

              {selectedUser && (
                <View className="bg-slate-50 rounded-xl p-3 mb-4 flex-row items-center gap-3">
                  <Avatar src={selectedUser.avatarUrl || ''} size={40} />
                  <View>
                    <Text className="text-sm font-semibold text-slate-900">
                      {selectedUser.username || selectedUser.email?.split('@')[0]}
                    </Text>
                    <Text className="text-xs text-slate-500">{selectedUser.email}</Text>
                  </View>
                </View>
              )}

              <ScrollView className="max-h-96">
                {groupsData?.data && groupsData.data.length > 0 ? (
                  groupsData.data.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      onPress={() => handleGroupSelection(group.id, group.name)}
                      disabled={addGroupMemberMutation.isPending}
                      className="bg-white border border-slate-100 rounded-xl p-4 mb-3 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className="w-12 h-12 bg-indigo-50 rounded-xl items-center justify-center">
                          <Text className="text-2xl">{group.icon || '👥'}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-slate-900">{group.name}</Text>
                          <Text className="text-xs text-slate-500 mt-0.5">
                            {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                      {addGroupMemberMutation.isPending ? (
                        <ActivityIndicator size="small" color="#6366f1" />
                      ) : (
                        <Icon name="chevron-forward" size={20} color="#cbd5e1" />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View className="py-8 items-center">
                    <Text className="text-slate-400 text-center">No groups available</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
