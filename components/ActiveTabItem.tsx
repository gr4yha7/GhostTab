import React from 'react';
import { View, Text, Image } from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';

interface ActiveTabItemProps {
  title: string;
  icon: string;
  icons: string[];
  balance: string;
  status?: string;
  onClick?: () => void;
}

export const ActiveTabItem: React.FC<ActiveTabItemProps> = ({
  title,
  icon,
  icons,
  balance,
  status,
  onClick,
}) => (
  <Card onPress={onClick} className="p-4 mb-3 flex-row items-center justify-between">
    <View className="flex-row items-center gap-4">
      <View className="w-16 h-16 rounded-2xl bg-slate-50 items-center justify-center shadow-sm border border-slate-100">
        <Text className="text-4xl">{icon}</Text>
      </View>
      <View>
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="font-semibold text-slate-900 text-md">{title}</Text>
          {status === 'Open' && <Badge color="emerald">Open</Badge>}
        </View>
        <View className="flex-row" style={{ marginLeft: -8 }}>
          {icons.map((src, i) => (
            <Image
              key={i}
              source={{ uri: src }}
              className="w-8 h-8 rounded-full border border-white"
              style={{ marginLeft: 8 }}
            />
          ))}
        </View>
      </View>
    </View>
    <View className="items-end">
      <Text
        className={`text-md font-semibold tracking-tight ${
          balance.startsWith('+') ? 'text-emerald-600' : 'text-orange-600'
        }`}
      >
        {balance}
      </Text>
      <Text className="text-sm text-slate-400 font-medium mt-0.5">Net balance</Text>
    </View>
  </Card>
);