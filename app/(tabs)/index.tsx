// app/(tabs)/index.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/Avatar';
import { SummaryCard } from '@/components/SummaryCard';
import { ActiveTabItem } from '@/components/ActiveTabItem';
import { TrustScoreBadge } from '@/components/TrustScoreBadge';
import { CategoryFilter } from '@/components/CategoryFilter';
import { TabCategory, TAB_CATEGORIES } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useTabs, useDashboardAnalytics, useUnreadNotificationCount, useUnreadMessagesCount, useUSDCBalance } from '@/hooks/api';
import { Icon } from '@/components/Icon';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<TabCategory | undefined>();
  const { data: tabsData, isLoading, refetch, isRefetching } = useTabs(
    undefined, // Fetch all tabs to populate both active and recent sections
    selectedCategory,
  );
  const { data: analyticsData } = useDashboardAnalytics();
  const { data: unreadNotificationsCount } = useUnreadNotificationCount();
  const { data: unreadMessagesCount } = useUnreadMessagesCount();
  const { data: usdcBalance, isLoading: isLoadingBalance } = useUSDCBalance(user?.walletAddress || '');

  // Calculate totals
  const calculateBalances = () => {
    // Prefer summary metrics from analytics if available
    if (analyticsData?.summary) {
      return {
        owed: analyticsData.summary.totalOwed.toFixed(2),
        owing: analyticsData.summary.totalSpent.toFixed(2),
      };
    }

    if (!tabsData?.data || !user) {
      return { owed: '0.00', owing: '0.00' };
    }

    let owed = 0;
    let owing = 0;

    tabsData.data.forEach((tab: any) => {
      // Use correct property path: tab.creator.id
      const creatorId = tab.creator?.id || tab.creatorId;

      if (creatorId === user.id) {
        // Calculate what others owe to user (only if participants array exists)
        if (tab.participants) {
          tab.participants.forEach((p: any) => {
            if (p.userId !== user.id && !p.paid) {
              owed += parseFloat(p.finalAmount || p.shareAmount || '0');
            }
          });
        }
        // Note: In simplified list, we don't have others' shares easily, 
        // so we rely on analyticsData for precision.
      } else {
        // Calculate what user owes this tab
        if (!tab.userPaid) {
          owing += parseFloat(tab.userShare || '0');
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
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-slate-50/50 pb-24"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4f46e5" />
        }
      >
        <View className="px-6 pt-20 pb-6">
          {/* Top Bar */}
          <View className="flex-row justify-between items-center mb-8">
            <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center">
              <SimpleLineIcons name="ghost" size={24} color="#4f46e5" />
            </View>

            {/* Chat, Notification and Profile Icons */}
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => router.push('/chats')}
                className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm border border-slate-100"
              >
                <Icon name="chatbubbles-outline" size={20} color="#64748b" />
                {unreadMessagesCount !== undefined && unreadMessagesCount > 0 && (
                  <View className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full border-2 border-white items-center justify-center">
                    <Text className="text-[10px] font-bold text-white">{unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/notifications')}
                className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm border border-slate-100"
              >
                <Icon name="notifications-outline" size={20} color="#64748b" />
                {unreadNotificationsCount !== undefined && unreadNotificationsCount > 0 && (
                  <View className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white items-center justify-center">
                    <Text className="text-[10px] font-bold text-white">{unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                <Avatar src={user?.avatarUrl || ''} size={34} />
              </TouchableOpacity>
            </View>
          </View>

          {/* User Section */}
          <View className="mb-6">
            <Text className="text-2xl font-semibold text-slate-900 tracking-tight">
              Hello, {user?.username || 'there'} 👋
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              {user && <TrustScoreBadge score={user.trustScore} size="small" />}
              <View className="bg-emerald-50 px-2 py-0.5 rounded-lg flex-row items-center gap-1">
                <Icon name="wallet" size={12} color="#10b981" />
                <Text className="text-[10px] font-bold text-emerald-700">
                  $ {isLoadingBalance ? '...' : usdcBalance?.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-4 mb-8">
            <SummaryCard
              title="Owed to you"
              amount={`$${analyticsData?.summary?.totalOwed?.toFixed(2) || balances.owed}`}
              type="owed"
            />
            <SummaryCard
              title="You owe"
              amount={`$${balances.owing}`}
              type="owe"
            />
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

          {/* Upcoming Deadlines Widget */}
          {analyticsData?.upcomingDeadlines && analyticsData.upcomingDeadlines.length > 0 && (
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-slate-900">Upcoming Deadlines</Text>
                <View className="bg-amber-100 px-2 py-1 rounded-md">
                  <Text className="text-[10px] font-bold text-amber-700 uppercase">Attention</Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
                {analyticsData.upcomingDeadlines.map((deadline) => (
                  <TouchableOpacity
                    key={deadline.tabId}
                    onPress={() => router.push({ pathname: '/detail', params: { id: deadline.tabId } })}
                    className="bg-white rounded-2xl border border-slate-100 p-4 mr-3 w-64 shadow-sm"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-sm font-semibold text-slate-900 flex-1 mr-2" numberOfLines={1}>
                        {deadline.title}
                      </Text>
                      <Text className="text-sm font-bold text-indigo-600">${deadline.amount}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Icon name="time-outline" size={14} color="#f59e0b" />
                      <Text className="text-xs font-medium text-amber-600">
                        {deadline.daysRemaining === 0 ? 'Due today' : `${deadline.daysRemaining} days remaining`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
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

          {(() => {
            const activeTabs = tabsData?.data?.filter(t => t.status === 'OPEN') || [];
            if (activeTabs.length === 0) {
              return (
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
              );
            }

            return (
              <View>
                {activeTabs.slice(0, 5).map((tab: any) => {
                  const creatorId = tab.creator?.id || tab.creatorId;
                  const isCreator = creatorId === user?.id;

                  // Use available participants if present, otherwise fallback to userShare/userPaid
                  const userParticipant = tab.participants?.find((p: any) => p.userId === user?.id);

                  // Calculate balance including penalties
                  let balance = '$0.00';
                  if (isCreator) {
                    if (tab.participants) {
                      const owed = tab.participants
                        .filter((p: any) => p.userId !== user?.id && !p.paid)
                        .reduce((sum: number, p: any) => sum + parseFloat(p.finalAmount || p.shareAmount || '0'), 0);
                      balance = owed > 0 ? `+$${owed.toFixed(2)}` : '$0.00';
                    } else {
                      // Fallback for creator in list view (we don't have others' shares in simplified list)
                      balance = '+$0.00*'; // Indicated as summary
                    }
                  } else {
                    // If we have userShare/userPaid directly (typical for simplified list)
                    if (!tab.userPaid && tab.userShare) {
                      balance = `-$${parseFloat(tab.userShare).toFixed(2)}`;
                    } else if (userParticipant && !userParticipant.paid) {
                      balance = `-$${parseFloat(userParticipant.finalAmount || userParticipant.shareAmount || '0').toFixed(2)}`;
                    }
                  }

                  // Participant avatars (fallback to creator if simplified)
                  const participantAvatars = tab.participants
                    ? tab.participants
                      .filter((p: any) => p.userId !== user?.id)
                      .slice(0, 3)
                      .map((p: any) => p.user?.avatarUrl || '')
                    : [tab.creator?.avatarUrl || ''];

                  // Check deadline urgency
                  const daysUntilDeadline = tab.settlementDeadline
                    ? (new Date(tab.settlementDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    : null;

                  return (
                    <ActiveTabItem
                      key={tab.id}
                      title={tab.title}
                      icon={TAB_CATEGORIES[tab.category as keyof typeof TAB_CATEGORIES]?.icon || '📄'}
                      icons={participantAvatars}
                      balance={balance}
                      status={tab.status === 'OPEN' ? 'Open' : 'Settled'}
                      deadline={tab.settlementDeadline}
                      penaltyRate={tab.penaltyRate}
                      onClick={() => router.push({ pathname: '/detail', params: { id: tab.id } })}
                    />
                  );
                })}
              </View>
            );
          })()}

          {/* Quick Actions */}
          {/* <View className="mt-8">
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
        </View> */}

          {/* Spending by Category */}
          {analyticsData?.topCategories && analyticsData.topCategories.length > 0 && (
            <View className="mt-8">
              <Text className="text-lg font-semibold text-slate-900 mb-4">Top Categories</Text>
              <View className="bg-white rounded-2xl border border-slate-100 p-4">
                {analyticsData.topCategories.slice(0, 3).map((cat, idx) => {
                  const category = TAB_CATEGORIES[cat.category as TabCategory];
                  return (
                    <View
                      key={cat.category}
                      className="flex-row items-center justify-between"
                      style={idx !== 0 ? { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' } : {}}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                          <Text className="text-lg">{category.icon}</Text>
                        </View>
                        <View>
                          <Text className="text-sm font-semibold text-slate-900">{category.label}</Text>
                          <Text className="text-xs text-slate-500">{cat.count} tabs</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm font-bold text-slate-900">${cat.totalAmount.toFixed(2)}</Text>
                        <Text className="text-[10px] text-slate-400 font-medium uppercase">{cat.percentage.toFixed(0)}% of total</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          <View className="mt-8">
            <Text className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
              {tabsData?.data?.filter((tab) => tab.status === 'SETTLED')
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
    </View>
  );
}