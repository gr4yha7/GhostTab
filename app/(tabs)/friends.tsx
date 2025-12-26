import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Icon } from '../../components/Icon';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/Card';

export default function FriendsScreen() {
  return (
    <View className="flex-1 bg-slate-50/50 pb-24">
      <View className="px-6 pt-12 pb-4 bg-white/80">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-semibold text-slate-900 tracking-tight">Friends</Text>
          <TouchableOpacity className="w-9 h-9 rounded-full bg-indigo-50 items-center justify-center">
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
          />
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="mb-8">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Pending Requests (1)
          </Text>
          <Card className="p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <Avatar src="https://i.pravatar.cc/100?img=8" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-900">Mike Thompson</Text>
                <Text className="text-xs text-indigo-500 font-medium">
                  @miket • 2 mutual friends
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity className="bg-indigo-600 px-3 py-1.5 rounded-lg">
                <Text className="text-white text-xs font-semibold">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-slate-100 px-3 py-1.5 rounded-lg">
                <Text className="text-slate-600 text-xs font-semibold">Skip</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        <View>
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            All Friends
          </Text>
          <View>
            {[
              { name: 'Alex Rivera', handle: '@alexr', img: '12', status: 'Always settles', color: 'emerald' },
              { name: 'Sam Wilson', handle: '@samw', img: '59', status: 'Usually settles quickly', color: 'blue' },
              { name: 'Jordan Lee', handle: '@jlee', img: '11', status: null, color: null },
            ].map((f, i) => (
              <Card key={i} className="p-4 flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3 flex-1">
                  <Avatar src={`https://i.pravatar.cc/100?img=${f.img}`} />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900">{f.name}</Text>
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-xs text-slate-400">{f.handle}</Text>
                      {f.status && (
                        <>
                          <View className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                          <Text
                            className={`text-[10px] font-medium ${
                              f.color === 'emerald' ? 'text-emerald-600' : 'text-indigo-600'
                            }`}
                          >
                            {f.status}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
                <View className="w-8 h-8 rounded-full items-center justify-center">
                  <Icon name="search-outline" size={16} color="#cbd5e1" />
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}