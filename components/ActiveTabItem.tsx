import React from 'react';
import { View, Text, Image } from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { Icon } from './Icon';

interface ActiveTabItemProps {
  title: string;
  icon: string;
  icons: string[];
  balance: string;
  status?: string;
  deadline?: string;
  penaltyRate?: number;
  onClick?: () => void;
}

export const ActiveTabItem: React.FC<ActiveTabItemProps> = ({
  title,
  icon,
  icons,
  balance,
  status,
  deadline,
  penaltyRate,
  onClick,
}) => {
  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <Card onPress={onClick} className="p-4 mb-3">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-4 flex-1">
          <View className="w-16 h-16 rounded-2xl bg-slate-50 items-center justify-center shadow-sm border border-slate-100">
            <Text className="text-4xl">{icon}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="font-semibold text-slate-900 text-md">{title}</Text>
              {status === 'Open' && <Badge color="emerald">Open</Badge>}
            </View>
            <View className="flex-row" style={{ marginLeft: -8 }}>
              {icons.filter(src => !!src).map((src, i) => (
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
            className={`text-md font-semibold tracking-tight ${balance.startsWith('+') ? 'text-emerald-600' : 'text-orange-600'
              }`}
          >
            {balance}
          </Text>
          <Text className="text-sm text-slate-400 font-medium mt-0.5">Net balance</Text>
        </View>
      </View>

      {(deadline || penaltyRate) && (
        <View className="flex-row items-center gap-3 pt-3 border-t border-slate-100">
          {deadline && (
            <View className="flex-row items-center gap-1.5">
              <Icon name="time-outline" size={14} color="#64748b" />
              <Text className="text-xs text-slate-600">{formatDeadline(deadline)}</Text>
            </View>
          )}
          {penaltyRate && penaltyRate > 0 && (
            <View className="flex-row items-center gap-1.5">
              <Icon name="warning-outline" size={14} color="#f97316" />
              <Text className="text-xs text-orange-600">{penaltyRate}% penalty</Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
};