// app/edit-tab.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { useTab, useUpdateTab } from '../hooks/api';
import { useError } from '../context/ErrorContext';

export default function EditTabScreen() {
  const router = useRouter();
  const { tabId } = useLocalSearchParams<{ tabId: string }>();
  const { showError } = useError();

  const { data: tab, isLoading } = useTab(tabId);
  const updateTabMutation = useUpdateTab();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (tab) {
      setTitle(tab.title);
      setDescription(tab.description || '');
    }
  }, [tab]);

  const handleSave = async () => {
    if (!title.trim()) {
      showError('Please enter a title for the tab');
      return;
    }

    try {
      await updateTabMutation.mutateAsync({
        tabId,
        updates: {
          title: title.trim(),
          description: description.trim() || undefined,
        },
      });
      router.back();
    } catch (error) {
      showError(error as Error);
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
            <Text className="text-xl font-semibold text-slate-900 tracking-tight">Edit Tab</Text>
          </View>
        </View>

        <ScrollView className="flex-1 p-6">
          <View className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 flex-row items-start gap-3">
            <Icon name="information-circle" size={20} color="#f97316" />
            <View className="flex-1">
              <Text className="text-sm font-medium text-orange-900 mb-1">
                Limited Editing
              </Text>
              <Text className="text-xs text-orange-700">
                You can only edit the title and description. Amount and participants cannot be changed after creation.
              </Text>
            </View>
          </View>

          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Tab Title
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

          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Description (Optional)
          </Text>
          <View className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
            <TextInput
              placeholder="Add any additional details..."
              placeholderTextColor="#cbd5e1"
              className="text-sm text-slate-900 min-h-[80px]"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 p-4">
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Cannot Be Changed
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-slate-500">Total Amount</Text>
              <Text className="text-xs font-medium text-slate-900">${tab.totalAmount}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-slate-500">Participants</Text>
              <Text className="text-xs font-medium text-slate-900">{tab.participants?.length || 0} people</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-slate-500">Category</Text>
              <Text className="text-xs font-medium text-slate-900">{tab.category}</Text>
            </View>
          </View>
        </ScrollView>

        <View className="p-4 bg-white border-t border-slate-100 pb-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={updateTabMutation.isPending}
            className={`w-full py-4 rounded-2xl shadow-lg ${updateTabMutation.isPending ? 'bg-indigo-400' : 'bg-indigo-600'
              }`}
          >
            {updateTabMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-medium text-sm text-center">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
