import React from 'react';
import { View, Text, Image } from 'react-native';

interface AvatarProps {
  src?: string;
  initials?: string;
  size?: number;
  badge?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ src, initials, size = 40, badge }) => (
  <View className="relative">
    {src ? (
      <Image
        source={{ uri: src }}
        className="rounded-full border border-slate-100"
        style={{ width: size, height: size }}
      />
    ) : (
      <View
        className="rounded-full bg-indigo-100 items-center justify-center border border-white shadow-sm"
        style={{ width: size, height: size }}
      >
        <Text className="text-indigo-600 font-semibold text-xs">{initials}</Text>
      </View>
    )}
    {badge && (
      <View className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white" />
    )}
  </View>
);