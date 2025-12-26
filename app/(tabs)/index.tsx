import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '../../components/Avatar';
import { SummaryCard } from '../../components/SummaryCard';
import { ActiveTabItem } from '../../components/ActiveTabItem';

export default function Dashboard() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-slate-50/50 pb-24">
      <View className="px-6 pt-12 pb-6">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            {/* <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
              Dashboard
            </Text> */}
            <Text className="text-2xl font-semibold text-slate-900 tracking-tight">
              Hello, Lena 👋
            </Text>
          </View>
          <Avatar src="https://i.pravatar.cc/100?img=33" size={44} />
        </View>

        <View className="flex-row gap-4 mb-8">
          <SummaryCard title="Owed to you" amount="$30.00" type="owed" />
          <SummaryCard title="You owe" amount="$100.00" type="owe" />
        </View>

        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-lg font-semibold text-slate-900">Active Tabs</Text>
          <TouchableOpacity>
            <Text className="text-md font-medium text-indigo-600">See all</Text>
          </TouchableOpacity>
        </View>

        <View>
          <ActiveTabItem
            title="Dinner"
            icon="🍝"
            icons={['https://i.pravatar.cc/100?img=12', 'https://i.pravatar.cc/100?img=59']}
            balance="+$30.00"
            status="Open"
            onClick={() => router.push('/detail')}
          />
          <ActiveTabItem
            title="Weekend Trip"
            icon="✈️"
            icons={['https://i.pravatar.cc/100?img=33', 'https://i.pravatar.cc/100?img=4']}
            balance="-$100.00"
            status="Open"
          />
        </View>

        <View className="mt-8">
          <Text className="text-lg font-semibold text-slate-900 mb-4">Past Memories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className="w-[120px] h-32 bg-white rounded-2xl border border-slate-100 p-3 flex-col justify-between mr-3"
              >
                <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                  <Text className="text-lg">📸</Text>
                </View>
                <View>
                  <Text className="text-md font-semibold text-slate-900">Napa Valley</Text>
                  <Text className="text-sm text-slate-500">Aug 2023</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
}