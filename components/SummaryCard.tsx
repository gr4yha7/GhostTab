import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from './Icon';

interface SummaryCardProps {
  title: string;
  amount: string;
  type: 'owed' | 'owe';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type }) => (
  <View
    className={`relative overflow-hidden rounded-3xl p-5 flex-1 shadow-lg ${
      type === 'owe' ? 'bg-orange-500' : 'bg-emerald-500'
    }`}
  >
    <View className="relative z-10">
      <Text className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1">
        {title}
      </Text>
      <Text className="text-2xl font-semibold tracking-tight text-white">{amount}</Text>
    </View>
    <View className="absolute -bottom-4 -right-4 w-20 h-20 bg-white opacity-10 rounded-full" />
    <View className="absolute top-0 right-0 p-3 opacity-20">
      <Icon name={type === 'owe' ? 'arrow-up' : 'arrow-down'} size={32} color="#ffffff" />
    </View>
  </View>
);