// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/Avatar';
import { SummaryCard } from '@/components/SummaryCard';
import { ActiveTabItem } from '@/components/ActiveTabItem';
import { TrustScoreBadge } from '@/components/TrustScoreBadge';
import { CategoryFilter } from '@/components/CategoryFilter';
import { TabCategory, TAB_CATEGORIES } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useTabs } from '@/hooks/api';
import { useIdentityToken } from '@privy-io/expo';
import { Icon } from '@/components/Icon';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<TabCategory | undefined>();
  const { data: tabsData, isLoading, refetch, isRefetching } = useTabs(
    'OPEN',
    selectedCategory,
  );
  // Calculate totals
  const calculateBalances = () => {
    if (!tabsData?.data || !user) {
      return { owed: '0.00', owing: '0.00' };
    }

    let owed = 0;
    let owing = 0;

    tabsData.data.forEach((tab) => {
      // Check if user is the creator
      if (tab.creatorId === user.id) {
        // Calculate what others owe to user
        tab.participants.forEach((p) => {
          if (p.userId !== user.id && !p.paid) {
            owed += parseFloat(p.finalAmount || p.shareAmount);
          }
        });
      } else {
        // Calculate what user owes
        const userParticipant = tab.participants.find((p) => p.userId === user.id);
        if (userParticipant && !userParticipant.paid) {
          owing += parseFloat(userParticipant.finalAmount || userParticipant.shareAmount);
        }
      }
    });

    return {
      owed: owed.toFixed(2),
      owing: owing.toFixed(2),
    };
  };

  const balances = calculateBalances();
  // Check for tabs nearing deadline
  const getTabsNearingDeadline = () => {
    if (!tabsData?.data) return [];
    
    const now = new Date();
    return tabsData.data.filter((tab) => {
      if (!tab.settlementDeadline) return false;
      const deadline = new Date(tab.settlementDeadline);
      const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil > 0 && daysUntil <= 3; // 3 days or less
    });
  };

  const urgentTabs = getTabsNearingDeadline();

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50/50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50/50 pb-24"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4f46e5" />
      }
    >
      <View className="px-6 pt-12 pb-6">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-semibold text-slate-900 tracking-tight">
              Hello, {user?.username || 'there'} 👋
            </Text>
            {user && <TrustScoreBadge score={user.trustScore} size="small" />}
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
            <Avatar />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-4 mb-8">
          <SummaryCard title="Owed to you" amount={`$${balances.owed}`} type="owed" />
          <SummaryCard title="You owe" amount={`$${balances.owing}`} type="owe" />
        </View>

        {/* Urgent Tabs Alert */}
        {urgentTabs.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/detail', params: { id: urgentTabs[0].id } })}
            className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 flex-row items-center gap-3"
          >
            <View className="w-10 h-10 bg-orange-500 rounded-full items-center justify-center">
              <Text className="text-white text-lg">⏰</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-orange-900">
                {urgentTabs.length} tab{urgentTabs.length > 1 ? 's' : ''} due soon!
              </Text>
              <Text className="text-xs text-orange-700 mt-0.5">
                Settle before deadline to avoid penalties
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Category Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Active Tabs Section */}
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-lg font-semibold text-slate-900">
            {selectedCategory ? `${TAB_CATEGORIES[selectedCategory].label} Tabs` : 'Active Tabs'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)')}>
            <Text className="text-md font-medium text-indigo-600">See all</Text>
          </TouchableOpacity>
        </View>

        {!tabsData?.data || tabsData.data.length === 0 ? (
          <View className="bg-white rounded-2xl border border-slate-100 p-8 items-center">
            <Text className="text-slate-400 text-center mb-4">
              {selectedCategory ? 'No tabs in this category' : 'No active tabs yet'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/create')}
              className="bg-indigo-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-medium">Create Your First Tab</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {tabsData.data.slice(0, 5).map((tab) => {
              const isCreator = tab.creatorId === user?.id;
              const userParticipant = tab.participants.find((p) => p.userId === user?.id);
              
              // Calculate balance including penalties
              let balance = '$0.00';
              if (isCreator) {
                const owed = tab.participants
                  .filter((p) => p.userId !== user?.id && !p.paid)
                  .reduce((sum, p) => sum + parseFloat(p.finalAmount || p.shareAmount), 0);
                balance = owed > 0 ? `+$${owed.toFixed(2)}` : '$0.00';
              } else if (userParticipant && !userParticipant.paid) {
                balance = `-$${userParticipant.finalAmount || userParticipant.shareAmount}`;
              }

              const participantAvatars = tab.participants
                .filter((p) => p.userId !== user?.id)
                .slice(0, 3)
                .map((p) => p.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${p.user.id}`);

              // Check deadline urgency
              const daysUntilDeadline = tab.settlementDeadline 
                ? (new Date(tab.settlementDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                : null;

              return (
                <ActiveTabItem
                  key={tab.id}
                  title={tab.title}
                  icon={TAB_CATEGORIES[tab.category].icon}
                  icons={participantAvatars}
                  balance={balance}
                  status={tab.status === 'OPEN' ? 'Open' : 'Settled'}
                  deadline={tab.settlementDeadline}
                  isUrgent={daysUntilDeadline !== null && daysUntilDeadline < 3}
                  onClick={() => router.push({ pathname: '/detail', params: { id: tab.id } })}
                />
              );
            })}
          </View>
        )}

        {/* Quick Actions */}
        <View className="mt-8">
          <Text className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/create')}
              className="flex-1 bg-indigo-600 py-4 rounded-2xl items-center shadow-lg"
            >
              <Text className="text-white font-semibold text-sm">Create Tab</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/insights')}
              className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl items-center"
            >
              <Text className="text-slate-900 font-semibold text-sm">View Insights</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mt-8">
          <Text className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
            {tabsData?.data
              .filter((tab) => tab.status === 'SETTLED')
              .slice(0, 5)
              .map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => router.push({ pathname: '/detail', params: { id: tab.id } })}
                  className="w-[120px] h-32 bg-white rounded-2xl border border-slate-100 p-3 flex-col justify-between mr-3"
                >
                  <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                    <Text className="text-lg">{TAB_CATEGORIES[tab.category].icon}</Text>
                  </View>
                  <View>
                    <Text className="text-md font-semibold text-slate-900" numberOfLines={1}>
                      {tab.title}
                    </Text>
                    <Text className="text-sm text-slate-500">
                      {new Date(tab.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            {(!tabsData?.data || tabsData.data.filter((tab) => tab.status === 'SETTLED').length === 0) && (
              <View className="w-[120px] h-32 bg-white rounded-2xl border border-dashed border-slate-200 items-center justify-center">
                <Text className="text-slate-400 text-xs text-center px-2">
                  Settled tabs will appear here
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
}