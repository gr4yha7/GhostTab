import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 22, color = '#64748b' }) => (
  <Ionicons name={name} size={size} color={color} />
);