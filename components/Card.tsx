import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onPress }) => {
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className={`bg-white rounded-[20px] border border-slate-100/80 ${className}`}
    >
      {children}
    </Component>
  );
};