// app/edit-group.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { useGroup, useUpdateGroup, useDeleteGroup, useLeaveGroup } from '../hooks/api';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';

const GROUP_ICONS = ['👥', '🎉', '🏠', '✈️', '🍕', '🎮', '💼', '🎓', '⚽', '🎵'];

export default function EditGroupScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { showError } = useError();

  const { data: group, isLoading } = useGroup(id);
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();
  const leaveGroupMutation = useLeaveGroup();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('👥');

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setSelectedIcon(group.icon || '👥');
    }
  }, [group]);

  const userMember = group?.members?.find((m) => m.user?.id === user?.id);
  const isCreator = userMember?.role === 'CREATOR';
  const isAdmin = userMember?.role === 'ADMIN' || isCreator;

  const handleSave = async () => {
    if (!name.trim()) {
      showError('Please enter a group name');
      return;
    }

    try {
      await updateGroupMutation.mutateAsync({
        groupId: id,
        updates: {
          name: name.trim(),
          description: description.trim() || undefined,
          icon: selectedIcon,
        },
      });
      router.back();
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroupMutation.mutateAsync(id);
              router.replace('/(tabs)/social');
            } catch (error) {
              showError(error as Error);
            }
          },
        },
      ]
    );
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroupMutation.mutateAsync(id);
              router.replace('/(tabs)/social');
            } catch (error) {
              showError(error as Error);
            }
          },
        },
      ]
    );
  };

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
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-indigo-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
            <Text className="text-xl font-semibold text-slate-900 tracking-tight">
              {isAdmin ? 'Edit Group' : 'Group Settings'}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 p-6">
          {isAdmin && (
            <>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Group Icon
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                {GROUP_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    className="w-14 h-14 rounded-2xl items-center justify-center mr-3"
                    style={{
                      backgroundColor: selectedIcon === icon ? '#4f46e5' : '#ffffff',
                      borderWidth: 1,
                      borderColor: selectedIcon === icon ? '#4f46e5' : '#f1f5f9',
                      ...(selectedIcon === icon ? {
                        shadowColor: '#4f46e5',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 4,
                      } : {})
                    }}
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
            </>
          )}

          {/* Danger Zone */}
          <View className="bg-white rounded-3xl border border-red-100 p-6 mt-4">
            <Text className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-4">
              Danger Zone
            </Text>

            {!isCreator && (
              <TouchableOpacity
                onPress={handleLeave}
                disabled={leaveGroupMutation.isPending}
                className="py-3 flex-row items-center justify-center gap-2 bg-red-50 rounded-xl mb-3"
              >
                <Icon name="exit-outline" size={18} color="#ef4444" />
                <Text className="text-red-600 font-medium">Leave Group</Text>
              </TouchableOpacity>
            )}

            {isCreator && (
              <TouchableOpacity
                onPress={handleDelete}
                disabled={deleteGroupMutation.isPending}
                className="py-3 flex-row items-center justify-center gap-2 bg-red-50 rounded-xl"
              >
                <Icon name="trash-outline" size={18} color="#ef4444" />
                <Text className="text-red-600 font-medium">Delete Group</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {isAdmin && (
          <View className="p-4 bg-white border-t border-slate-100 pb-8">
            <TouchableOpacity
              onPress={handleSave}
              disabled={updateGroupMutation.isPending}
              className={`w-full py-4 rounded-2xl shadow-lg ${updateGroupMutation.isPending ? 'bg-indigo-400' : 'bg-indigo-600'
                }`}
            >
              {updateGroupMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-center">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
