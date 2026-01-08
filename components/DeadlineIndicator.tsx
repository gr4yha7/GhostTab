import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from './Icon';

interface DeadlineIndicatorProps {
  deadline: string;
  size?: 'small' | 'medium' | 'large';
}

export function DeadlineIndicator({ deadline, size = 'medium' }: DeadlineIndicatorProps) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const isOverdue = daysUntil < 0;
  const isUrgent = daysUntil >= 0 && daysUntil <= 3;
  const isNear = daysUntil > 3 && daysUntil <= 7;

  const getColor = () => {
    if (isOverdue) return { bg: '#fee2e2', text: '#dc2626', icon: '#ef4444' };
    if (isUrgent) return { bg: '#fed7aa', text: '#ea580c', icon: '#f97316' };
    if (isNear) return { bg: '#fef3c7', text: '#d97706', icon: '#f59e0b' };
    return { bg: '#e0e7ff', text: '#4f46e5', icon: '#6366f1' };
  };

  const colors = getColor();
  
  const getLabel = () => {
    if (isOverdue) return `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} overdue`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `${daysUntil} days left`;
  };

  const sizes = {
    small: { container: 'px-2 py-1', text: 'text-xs', icon: 12 },
    medium: { container: 'px-3 py-1.5', text: 'text-sm', icon: 14 },
    large: { container: 'px-4 py-2', text: 'text-base', icon: 16 },
  };

  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-lg ${sizes[size].container}`}
      style={{ backgroundColor: colors.bg }}
    >
      <Icon name="time-outline" size={sizes[size].icon} color={colors.icon} />
      <Text className={`font-bold ${sizes[size].text}`} style={{ color: colors.text }}>
        {getLabel()}
      </Text>
    </View>
  );
}