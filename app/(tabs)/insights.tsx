// app/(tabs)/insights.tsx - COMPLETE WITH API INTEGRATION
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { TrustScoreBadge } from '../../components/TrustScoreBadge';
import { useInsights } from '../../hooks/api';
import { useAuth } from '../../context/AuthContext';
import { TAB_CATEGORIES } from '../../services/api';

export default function InsightsScreen() {
  const { user } = useAuth();
  const { data: insights, isLoading } = useInsights();

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50/50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!insights) {
    return (
      <View className="flex-1 bg-slate-50/50 items-center justify-center px-6">
        <Text className="text-slate-400 text-center">
          No insights available yet. Create some tabs to see your insights!
        </Text>
      </View>
    );
  }

  // Calculate max amount for chart scaling
  const maxAmount = Math.max(...insights.monthlyActivity.map((m) => parseFloat(m.amount)));

  return (
    <View className="flex-1 bg-slate-50/50 pb-24">
      <View className="px-6 pt-12 pb-6">
        <Text className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">
          Insights
        </Text>
        <Text className="text-xs text-slate-500 font-medium">
          Your spending and social habits
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pb-6">
        {/* Trust Score Card */}
        {user && (
          <Card className="p-6 mb-6">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Your Trust Score
            </Text>
            <View className="items-center">
              <View className="relative w-32 h-32 items-center justify-center mb-4">
                <View 
                  className="absolute inset-0 rounded-full border-8"
                  style={{ 
                    borderColor: user.trustScore >= 120 ? '#10b981' : 
                                 user.trustScore >= 100 ? '#3b82f6' : 
                                 user.trustScore >= 70 ? '#f59e0b' : '#ef4444'
                  }}
                />
                <Text className="text-4xl font-bold text-slate-900">{user.trustScore}</Text>
              </View>
              <TrustScoreBadge score={user.trustScore} size="large" />
              <View className="flex-row gap-8 mt-6">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-emerald-500">{user.settlementsOnTime}</Text>
                  <Text className="text-xs text-slate-500 mt-1">On Time</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-orange-500">{user.settlementsLate}</Text>
                  <Text className="text-xs text-slate-500 mt-1">Late</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-slate-900">{user.totalSettlements}</Text>
                  <Text className="text-xs text-slate-500 mt-1">Total</Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Summary Stats */}
        <View className="flex-row gap-4 mb-8">
          <Card className="flex-1 p-4 items-center justify-center py-6">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Total Split
            </Text>
            <Text className="text-xl font-bold text-slate-900">
              ${insights.totalSplit}
            </Text>
          </Card>
          <Card className="flex-1 p-4 items-center justify-center py-6">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Avg. Settle Time
            </Text>
            <Text className="text-xl font-bold text-indigo-600">
              {insights.averageSettleTime.toFixed(1)} Days
            </Text>
          </Card>
        </View>

        {/* Category Breakdown */}
        <View className="mb-8">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Spending by Category
          </Text>
          <Card className="p-6">
            {insights.categoryStats.length > 0 ? (
              <>
                {/* Pie Chart Visualization */}
                <View className="items-center mb-6">
                  <View className="relative w-40 h-40 rounded-full">
                    {insights.categoryStats.map((stat, index) => {
                      const category = TAB_CATEGORIES[stat.category];
                      return (
                        <View
                          key={stat.category}
                          className="absolute inset-0 items-center justify-center"
                        >
                          <View
                            className="w-32 h-32 rounded-full items-center justify-center"
                            style={{ backgroundColor: `${category.color}40` }}
                          >
                            <Text className="text-4xl">{category.icon}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Category List */}
                <View className="gap-3">
                  {insights.categoryStats.map((stat) => {
                    const category = TAB_CATEGORIES[stat.category];
                    return (
                      <View key={stat.category} className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3 flex-1">
                          <View
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <Text className="text-sm text-slate-900">{category.label}</Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-sm font-semibold text-slate-900">
                            ${stat.totalAmount}
                          </Text>
                          <Text className="text-xs text-slate-500">
                            {stat.percentage.toFixed(0)}% • {stat.count} tab{stat.count !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : (
              <Text className="text-slate-400 text-center py-8">
                No category data yet
              </Text>
            )}
          </Card>
        </View>

        {/* Monthly Activity Chart */}
        <View className="mb-8">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Monthly Activity
          </Text>
          <Card className="p-8">
            {insights.monthlyActivity.length > 0 ? (
              <View className="h-44 flex-row items-end justify-between gap-4 px-2">
                {insights.monthlyActivity.slice(-6).map((data, index) => {
                  const height = (parseFloat(data.amount) / maxAmount) * 100;
                  return (
                    <View key={index} className="flex-col items-center gap-3 flex-1">
                      <View
                        className="w-4 bg-indigo-500 rounded-full shadow-sm"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                      <Text className="text-[11px] font-bold text-slate-400">
                        {data.month}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text className="text-slate-400 text-center py-8">
                No activity data yet
              </Text>
            )}
          </Card>
        </View>

        {/* Top Splitting Pals */}
        <View>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Top Splitting Pals
          </Text>
          {insights.topSplittingPals.length > 0 ? (
            <View>
              {insights.topSplittingPals.slice(0, 5).map((pal, index) => (
                <Card key={pal.user.id} className="p-4 flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-4">
                    <View className="relative">
                      <Avatar
                        src={
                          pal.user.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/png?seed=${pal.user.id}`
                        }
                        size={48}
                      />
                      {index < 3 && (
                        <View
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
                          style={{
                            backgroundColor:
                              index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#d97706',
                          }}
                        >
                          <Text className="text-xs font-bold text-white">{index + 1}</Text>
                        </View>
                      )}
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-slate-900">
                        {pal.user.username || pal.user.email?.split('@')[0]}
                      </Text>
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                        {pal.sharedTabsCount} Shared Tab{pal.sharedTabsCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base font-semibold text-slate-900 tracking-tight">
                    ${pal.totalAmount}
                  </Text>
                </Card>
              ))}
            </View>
          ) : (
            <Card className="p-8 items-center">
              <Text className="text-slate-400 text-center">
                No friends data yet. Add friends and create tabs together!
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}