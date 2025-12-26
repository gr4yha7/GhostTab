import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'slate' | 'indigo' | 'emerald' | 'orange' | 'rose';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'slate' }) => {
  const colors = {
    slate: 'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <View className={`px-2 py-0.5 rounded ${colors[color]}`}>
      <Text className="text-[10px] font-bold uppercase tracking-wider">{children}</Text>
    </View>
  );
};