// components/TrustScoreBadge.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { apiService, TrustTier } from '../services/api';

interface TrustScoreBadgeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function TrustScoreBadge({ score, size = 'medium', showLabel = true }: TrustScoreBadgeProps) {
  const [tier, setTier] = useState<TrustTier | null>(null);

  // Safety check: if score is an object (from old backend responses), extract the numeric score
  const numericScore = typeof score === 'object' && score !== null ? (score as any).score : score;

  useEffect(() => {
    apiService.getTrustTier(numericScore).then(setTier);
  }, [numericScore]);

  if (!tier) return null;

  const sizes = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-2',
  };

  return (
    <View className={`flex-row items-center gap-2 mt-1`}>
      <View
        className={`rounded-lg ${sizes[size]}`}
        style={{ backgroundColor: `${tier.color}20` }}
      >
        <Text className="font-bold" style={{ color: tier.color }}>
          {numericScore} {showLabel && `• ${tier.label}`}
        </Text>
      </View>
    </View>
  );
}
