import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';

export default function CreateScreen() {
  const router = useRouter();
  const [selectedIcon, setSelectedIcon] = useState(3);
  const [participants, setParticipants] = useState([
    { name: 'Alex Rivera', handle: '@alexr', img: '12', selected: true },
    { name: 'Sam Wilson', handle: '@samw', img: '59', selected: true },
    { name: 'Jordan Lee', handle: '@jlee', img: '11', selected: false },
  ]);

  const toggleParticipant = (index: number) => {
    const updated = [...participants];
    updated[index].selected = !updated[index].selected;
    setParticipants(updated);
  };

  return (
    <View className="absolute inset-0 z-50 bg-slate-50">
      <SafeAreaView className="flex-1">
        <View className="px-4 pt-4 pb-4 bg-white flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-slate-900 tracking-tight">
            New Tab
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
          >
            <Icon name="close" size={18} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-6">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            What is it for?
          </Text>
          <View className="bg-white rounded-2xl border border-slate-200 p-1 flex-row items-center shadow-sm mb-6">
            <View className="w-10 h-10 items-center justify-center">
              <Icon name="happy-outline" size={22} />
            </View>
            <TextInput
              placeholder="E.g. Dinner at Luca's"
              placeholderTextColor="#cbd5e1"
              className="flex-1 h-10 text-sm font-medium text-slate-900"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
            {[
              'cafe-outline',
              'airplane-outline',
              'bag-handle-outline',
              'restaurant-outline',
              'car-outline',
              'ticket-outline',
              'gift-outline',
            ].map((iconName, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedIcon(i)}
                className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                  selectedIcon === i
                    ? 'bg-indigo-600 shadow-lg'
                    : 'bg-white border border-slate-100'
                }`}
              >
                <Icon name={iconName as any} size={20} color={selectedIcon === i ? '#fff' : '#94a3b8'} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Total Amount
          </Text>
          <View className="relative mb-2">
            <Text
              className="absolute left-0 text-3xl font-medium text-emerald-500"
              style={{ top: 10 }}
            >
              $
            </Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#e2e8f0"
              keyboardType="numeric"
              className="w-full text-5xl font-semibold text-slate-900 pl-8"
              autoFocus
            />
          </View>
          <Text className="text-[10px] font-medium text-indigo-600 mb-8">
            YOU'LL SPLIT THIS EVENLY AMONG PARTICIPANTS
          </Text>

          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            With whom?
          </Text>
          <View>
            {participants.map((p, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => toggleParticipant(i)}
                className={`bg-white p-3 rounded-2xl border flex-row items-center justify-between mb-2 ${
                  p.selected ? 'border-indigo-600 bg-indigo-50/10' : 'border-slate-100'
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <Avatar src={`https://i.pravatar.cc/100?img=${p.img}`} />
                  <View>
                    <Text className="text-sm font-semibold text-slate-900">{p.name}</Text>
                    <Text className="text-xs text-slate-400">{p.handle}</Text>
                  </View>
                </View>
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    p.selected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'
                  }`}
                >
                  {p.selected && <Icon name="checkmark" size={14} color="#fff" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View className="p-4 bg-white border-t border-slate-100 pb-8">
          <TouchableOpacity className="w-full bg-indigo-600 py-4 rounded-2xl shadow-lg">
            <Text className="text-white font-medium text-sm text-center">Create Tab</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}