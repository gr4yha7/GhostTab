// app/(tabs)/groups.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../../components/Icon';
import { useGroups } from '../../hooks/api';

export default function GroupsScreen() {
  const router = useRouter();
  const { data: groups, isLoading, refetch, isRefetching } = useGroups();

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-6 pt-12 pb-6 bg-white">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-semibold text-slate-900">Groups</Text>
          <TouchableOpacity
            onPress={() => router.push('/create-group')}
            className="w-10 h-10 rounded-full bg-indigo-600 items-center justify-center shadow-lg"
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {!groups || groups.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-indigo-50 rounded-full items-center justify-center mb-4">
            <Icon name="people-outline" size={32} color="#4f46e5" />
          </View>
          <Text className="text-lg font-semibold text-slate-900 mb-2">No groups yet</Text>
          <Text className="text-slate-400 text-center mb-6">
            Create a group to split expenses with multiple friends at once
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/create-group')}
            className="bg-indigo-600 px-6 py-3 rounded-xl shadow-lg"
          >
            <Text className="text-white font-medium">Create Your First Group</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4f46e5" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/group-detail', params: { id: item.id } })}
              className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-sm"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-14 h-14 bg-indigo-100 rounded-xl items-center justify-center">
                  <Text className="text-2xl">{item.icon || '👥'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-900">{item.name}</Text>
                  <Text className="text-xs text-slate-500 mt-0.5">
                    {item.memberCount} member{item.memberCount !== 1 ? 's' : ''}
                  </Text>
                  {item.description && (
                    <Text className="text-xs text-slate-400 mt-1" numberOfLines={1}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <View className="items-end">
                  {item.role === 'CREATOR' && (
                    <View className="bg-indigo-50 px-2 py-1 rounded-lg mb-1">
                      <Text className="text-[10px] font-bold text-indigo-600">CREATOR</Text>
                    </View>
                  )}
                  {item.role === 'ADMIN' && (
                    <View className="bg-emerald-50 px-2 py-1 rounded-lg mb-1">
                      <Text className="text-[10px] font-bold text-emerald-600">ADMIN</Text>
                    </View>
                  )}
                  <Icon name="chevron-forward" size={20} color="#cbd5e1" />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}