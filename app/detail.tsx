import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';

export default function DetailScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 pb-2 bg-white border-b border-slate-50">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
          >
            <Icon name="chevron-back" size={22} />
          </TouchableOpacity>
          <Text className="text-sm font-bold text-slate-900">Dinner 🍝</Text>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
            <Icon name="ellipsis-horizontal" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="items-center justify-center py-10 bg-white border-b border-slate-100">
          <View className="w-20 h-20 bg-orange-50 rounded-3xl items-center justify-center mb-4 shadow-sm">
            <Text className="text-4xl">🍝</Text>
          </View>
          <Text className="text-3xl font-semibold text-slate-900 tracking-tight">$90.00</Text>
          <Text className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">
            Total Spent
          </Text>
        </View>

        <View className="p-6">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Participants
          </Text>

          <View className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <View className="p-4 flex-row items-center justify-between border-b border-slate-50">
              <View className="flex-row items-center gap-3">
                <Avatar src="https://i.pravatar.cc/100?img=33" size={40} />
                <View>
                  <Text className="text-sm font-semibold text-slate-900">You</Text>
                  <Text className="text-[10px] text-slate-400 font-medium uppercase">
                    Owed to them
                  </Text>
                </View>
              </View>
              <Text className="text-emerald-500 font-semibold text-sm">$30.00</Text>
            </View>
            <View className="p-4 flex-row items-center justify-between border-b border-slate-50">
              <View className="flex-row items-center gap-3">
                <Avatar src="https://i.pravatar.cc/100?img=12" size={40} />
                <View>
                  <Text className="text-sm font-semibold text-slate-900">Alex Rivera</Text>
                  <Text className="text-[10px] text-slate-400 font-medium uppercase">
                    Owes to Tab
                  </Text>
                </View>
              </View>
              <Text className="text-emerald-500 font-semibold text-sm">$0.00</Text>
            </View>
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Avatar src="https://i.pravatar.cc/100?img=59" size={40} />
                <View>
                  <Text className="text-sm font-semibold text-slate-900">Sam Wilson</Text>
                  <Text className="text-[10px] text-slate-400 font-medium uppercase">
                    Owes to Tab
                  </Text>
                </View>
              </View>
              <Text className="text-orange-500 font-semibold text-sm">$30.00</Text>
            </View>
          </View>

          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-8 mb-4">
            Timeline
          </Text>
          <View className="pl-4 ml-2 border-l-2 border-slate-200">
            <View className="mb-6 relative">
              <View
                className="absolute w-3 h-3 bg-orange-500 rounded-full border-4 border-white"
                style={{ left: -21, top: 6 }}
              />
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-sm font-medium text-slate-900">Main course</Text>
                  <Text className="text-xs text-slate-400 mt-0.5">Paid by you • May 10</Text>
                </View>
                <Text className="text-sm font-semibold text-slate-900">$60.00</Text>
              </View>
            </View>
            <View className="mb-6 relative">
              <View
                className="absolute w-3 h-3 bg-slate-300 rounded-full border-4 border-white"
                style={{ left: -21, top: 6 }}
              />
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-sm font-medium text-slate-900">Appetizers</Text>
                  <Text className="text-xs text-slate-400 mt-0.5">Paid by Alex • May 10</Text>
                </View>
                <Text className="text-sm font-semibold text-slate-900">$30.00</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-slate-100 flex-row gap-3 pb-8">
        <TouchableOpacity className="flex-1 bg-indigo-600 py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-lg">
          <Icon name="send" size={16} color="#fff" />
          <Text className="text-white font-medium text-sm">Settle Now</Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-14 bg-white border border-slate-200 rounded-xl items-center justify-center shadow-sm">
          <Icon name="notifications-outline" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
