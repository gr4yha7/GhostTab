import React from 'react';
import { View, Text, Image } from 'react-native';
import { Icon } from './Icon';

interface AvatarProps {
  src?: string;
  size?: number;
  badge?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ src, size = 40, badge }) => (
  <View className="relative">
    {src ? (
      <Image
        source={{ uri: src }}
        className="rounded-full border border-slate-100"
        style={{ width: size, height: size }}
      />
    ) : (
      <View
        className="rounded-full bg-white items-center justify-center border border-slate-100 shadow-sm"
        style={{ width: size, height: size }}
      >
        <Icon name={"person-outline"} color="#64748b" size={20} />
      </View>
    )}
    {badge && (
      <View className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white" />
    )}
  </View>
);