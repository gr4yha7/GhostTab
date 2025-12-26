import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';

export default function InsightsScreen() {
  const monthlyData = [
    { month: 'Jan', height: 35, amount: '$1,750' },
    { month: 'Feb', height: 55, amount: '$2,750' },
    { month: 'Mar', height: 42, amount: '$2,100' },
    { month: 'Apr', height: 85, amount: '$4,250' },
    { month: 'May', height: 65, amount: '$3,250' },
  ];

  return (
    <View className="flex-1 bg-slate-50/50 pb-24">
      <View className="px-6 pt-12 pb-6">
        <Text className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">
          Insights
        </Text>
        <Text className="text-xs text-slate-500 font-medium">
          Your spending and social habits
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pb-6">
        <View className="flex-row gap-4 mb-8">
          <Card className="flex-1 p-4 items-center justify-center py-6">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Total Split
            </Text>
            <Text className="text-xl font-bold text-slate-900">$2,450</Text>
          </Card>
          <Card className="flex-1 p-4 items-center justify-center py-6">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Settle Time
            </Text>
            <Text className="text-xl font-bold text-indigo-600">2.4 Days</Text>
          </Card>
        </View>

        <View className="mb-8">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Spending by Category
          </Text>
          <Card className="p-6 items-center">
            <View className="relative w-40 h-40 rounded-full mb-6 items-center justify-center">
              <View className="absolute inset-0 rounded-full bg-indigo-600" />
              <View className="absolute inset-4 bg-white rounded-full items-center justify-center shadow-inner">
                <Text className="text-3xl">🍝</Text>
              </View>
            </View>
            <View className="flex-row flex-wrap justify-center gap-x-6 gap-y-2">
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-indigo-600" />
                <Text className="text-[10px] font-bold uppercase text-slate-500">Dining</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-emerald-500" />
                <Text className="text-[10px] font-bold uppercase text-slate-500">Travel</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-amber-500" />
                <Text className="text-[10px] font-bold uppercase text-slate-500">Grocery</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-pink-500" />
                <Text className="text-[10px] font-bold uppercase text-slate-500">Fun</Text>
              </View>
            </View>
          </Card>
        </View>

        <View className="mb-8">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Monthly Activity
          </Text>
          <View className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100/50">
            <View className="h-44 flex-row items-end justify-between gap-4 px-2">
              {monthlyData.map((data, i) => (
                <View key={i} className="flex-col items-center gap-3 flex-1">
                  <View
                    className="w-4 bg-indigo-500 rounded-full shadow-sm"
                    style={{ height: `${data.height}%` }}
                  />
                  <Text className="text-[11px] font-bold text-slate-400">{data.month}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Top Splitting Pals
          </Text>
          <View>
            <Card className="p-4 flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-4">
                <Avatar src="https://i.pravatar.cc/100?img=12" size={48} />
                <View>
                  <Text className="text-sm font-semibold text-slate-900">Alex Rivera</Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                    12 Shared Tabs
                  </Text>
                </View>
              </View>
              <Text className="text-base font-semibold text-slate-900 tracking-tight">$1,200</Text>
            </Card>
            <Card className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <Avatar src="https://i.pravatar.cc/100?img=59" size={48} />
                <View>
                  <Text className="text-sm font-semibold text-slate-900">Sam Wilson</Text>
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                    8 Shared Tabs
                  </Text>
                </View>
              </View>
              <Text className="text-base font-semibold text-slate-900 tracking-tight">$850</Text>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
