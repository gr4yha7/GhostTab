// app/group-detail.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { useGroup, useGroupTabs, useRemoveGroupMember, useMakeGroupAdmin, useRemoveGroupAdmin } from '../hooks/api';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import { TAB_CATEGORIES } from '@/services/api';

export default function GroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { showError } = useError();
  const { data: group, isLoading, refetch } = useGroup(id);
  const { data: tabsData } = useGroupTabs(id, 'OPEN');
  
  const removeMemberMutation = useRemoveGroupMember();
  const makeAdminMutation = useMakeGroupAdmin();
  const removeAdminMutation = useRemoveGroupAdmin();

  const [activeTab, setActiveTab] = useState<'members' | 'tabs'>('members');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Text className="text-slate-400 text-center mb-4">Group not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-indigo-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const userMember = group.members.find((m) => m.user.id === user?.id);
  const isCreator = userMember?.role === 'CREATOR';
  const isAdmin = userMember?.role === 'ADMIN' || isCreator;

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMemberMutation.mutateAsync({ groupId: id, memberId });
              refetch();
            } catch (error) {
              showError(error as Error);
            }
          },
        },
      ]
    );
  };

  const handleMakeAdmin = async (memberId: string) => {
    try {
      await makeAdminMutation.mutateAsync({ groupId: id, memberId });
      refetch();
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      await removeAdminMutation.mutateAsync({ groupId: id, adminId });
      refetch();
    } catch (error) {
      showError(error as Error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 bg-white border-b border-slate-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
          >
            <Icon name="chevron-back" size={22} />
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/edit-group', params: { id } })}
              className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
            >
              <Icon name="settings-outline" size={22} />
            </TouchableOpacity>
          )}
        </View>

        <View className="items-center mb-6">
          <View className="w-20 h-20 bg-indigo-100 rounded-2xl items-center justify-center mb-3">
            <Text className="text-4xl">{group.icon || '👥'}</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-900 mb-1">{group.name}</Text>
          {group.description && (
            <Text className="text-sm text-slate-500 text-center px-6">{group.description}</Text>
          )}
          <Text className="text-xs text-slate-400 mt-2">
            {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
          </Text>
        </View>

        <View className="flex-row bg-slate-50 rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setActiveTab('members')}
            className={`flex-1 py-2 rounded-lg ${activeTab === 'members' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                activeTab === 'members' ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              Members
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('tabs')}
            className={`flex-1 py-2 rounded-lg ${activeTab === 'tabs' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                activeTab === 'tabs' ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              Tabs
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        {activeTab === 'members' ? (
          <View>
            {isAdmin && (
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/add-group-members', params: { groupId: id } })}
                className="bg-indigo-600 py-3 rounded-xl mb-4 shadow-lg"
              >
                <Text className="text-white font-medium text-center">Add Members</Text>
              </TouchableOpacity>
            )}

            {group.members.map((member) => (
              <View
                key={member.id}
                className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Avatar
                      src={
                        member.user.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/png?seed=${member.user.id}`
                      }
                      size={48}
                    />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-slate-900">
                        {member.user.username || member.user.email?.split('@')[0]}
                        {member.user.id === user?.id && ' (You)'}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <View
                          className={`px-2 py-0.5 rounded ${
                            member.role === 'CREATOR'
                              ? 'bg-indigo-50'
                              : member.role === 'ADMIN'
                              ? 'bg-emerald-50'
                              : 'bg-slate-50'
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold ${
                              member.role === 'CREATOR'
                                ? 'text-indigo-600'
                                : member.role === 'ADMIN'
                                ? 'text-emerald-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {member.role}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Admin actions */}
                  {isAdmin && member.user.id !== user?.id && member.role !== 'CREATOR' && (
                    <TouchableOpacity
                      onPress={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                      className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center"
                    >
                      <Icon name="ellipsis-vertical" size={18} color="#64748b" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Member actions menu */}
                {selectedMember === member.id && (
                  <View className="mt-3 pt-3 border-t border-slate-100">
                    {isCreator && member.role === 'MEMBER' && (
                      <TouchableOpacity
                        onPress={() => handleMakeAdmin(member.user.id)}
                        className="py-2 flex-row items-center gap-2"
                      >
                        <Icon name="shield-checkmark-outline" size={18} color="#10b981" />
                        <Text className="text-sm font-medium text-emerald-600">Make Admin</Text>
                      </TouchableOpacity>
                    )}
                    {isCreator && member.role === 'ADMIN' && (
                      <TouchableOpacity
                        onPress={() => handleRemoveAdmin(member.user.id)}
                        className="py-2 flex-row items-center gap-2"
                      >
                        <Icon name="remove-circle-outline" size={18} color="#f59e0b" />
                        <Text className="text-sm font-medium text-amber-600">Remove Admin</Text>
                      </TouchableOpacity>
                    )}
                    {(isCreator || (isAdmin && member.role === 'MEMBER')) && (
                      <TouchableOpacity
                        onPress={() =>
                          handleRemoveMember(
                            member.user.id,
                            member.user.username || member.user.email || 'member'
                          )
                        }
                        className="py-2 flex-row items-center gap-2"
                      >
                        <Icon name="person-remove-outline" size={18} color="#ef4444" />
                        <Text className="text-sm font-medium text-red-500">Remove from Group</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View>
            {isAdmin && (
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/create-group-tab', params: { groupId: id } })}
                className="bg-indigo-600 py-3 rounded-xl mb-4 shadow-lg"
              >
                <Text className="text-white font-medium text-center">Create Group Tab</Text>
              </TouchableOpacity>
            )}

            {!tabsData?.data || tabsData.data.length === 0 ? (
              <View className="bg-white rounded-2xl p-8 items-center border border-slate-100">
                <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-3">
                  <Icon name="document-text-outline" size={28} color="#cbd5e1" />
                </View>
                <Text className="text-slate-400 text-center">No active tabs in this group</Text>
              </View>
            ) : (
              tabsData.data.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => router.push({ pathname: '/detail', params: { id: tab.id } })}
                  className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-12 h-12 bg-orange-50 rounded-xl items-center justify-center">
                        <Text className="text-2xl">{TAB_CATEGORIES[tab.category].icon || '💸'}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-slate-900">{tab.title}</Text>
                        <Text className="text-xs text-slate-500 mt-0.5">
                          ${tab.totalAmount} {tab.currency}
                        </Text>
                      </View>
                    </View>
                    <Icon name="chevron-forward" size={20} color="#cbd5e1" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}