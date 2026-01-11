// src/hooks/api/index.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { apiService, ApiError, User, Tab, Friendship, Notification, Channel, Message, Group, TabCategory } from '../../services/api';

// ============================================================================
// Query Keys
// ============================================================================

export const queryKeys = {
  user: {
    me: ['user', 'me'] as const,
    profile: ['user', 'profile'] as const,
  },
  friends: {
    all: ['friends'] as const,
    list: (status?: string) => ['friends', 'list', status] as const,
    requests: ['friends', 'requests'] as const,
  },
  tabs: {
    all: ['tabs'] as const,
    list: (status?: string) => ['tabs', 'list', status] as const,
    detail: (id: string) => ['tabs', 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (read?: boolean) => ['notifications', 'list', read] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  chat: {
    all: ['chat'] as const,
    channels: ['chat', 'channels'] as const,
    channel: (tabId: string) => ['chat', 'channel', tabId] as const,
    messages: (channelId: string) => ['chat', 'messages', channelId] as const,
    unreadCount: ['chat', 'unread-count'] as const,
  },
  search: {
    users: (query: string) => ['search', 'users', query] as const,
  },
  groups: {
    all: ['groups'] as const,
    lists: () => ['groups', 'list'] as const,
    list: () => ['groups', 'list'] as const,
    details: () => ['groups', 'detail'] as const,
    detail: (id: string) => ['groups', 'detail', id] as const,
    tabs: (id: string) => [...queryKeys.groups.detail(id), 'tabs'] as const,
  }
};

// ============================================================================
// Auth & User Hooks
// ============================================================================

export const useMe = (options?: UseQueryOptions<User, ApiError>) => {
  return useQuery({
    queryKey: queryKeys.user.me,
    queryFn: () => apiService.getMe(),
    ...options,
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: () => apiService.getUserProfile(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<User>) => apiService.updateUserProfile(updates),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user.profile, data);
      queryClient.setQueryData(queryKeys.user.me, data);
    },
  });
};

export const useUpdateAutoSettle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ autoSettle, vaultAddress }: { autoSettle: boolean; vaultAddress?: string }) =>
      apiService.updateAutoSettle(autoSettle, vaultAddress),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user.profile, data);
      queryClient.setQueryData(queryKeys.user.me, data);
    },
  });
};

// ============================================================================
// Search Hooks
// ============================================================================

export const useSearchUsers = (query: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.search.users(query),
    queryFn: () => apiService.searchUsers(query),
    enabled: enabled && query.length > 0,
  });
};

// ============================================================================
// Friends Hooks
// ============================================================================

export const useFriends = (status?: 'PENDING' | 'ACCEPTED' | 'BLOCKED', page = 1, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.friends.list(status),
    queryFn: () => apiService.getFriends(status, page, limit),
  });
};

export const useFriendRequests = () => {
  return useQuery({
    queryKey: queryKeys.friends.requests,
    queryFn: () => apiService.getFriendRequests(),
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (toIdentifier: string) => apiService.sendFriendRequest(toIdentifier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: string) => apiService.acceptFriendRequest(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
};

export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: string) => apiService.declineFriendRequest(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendId: string) => apiService.removeFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
};

// ============================================================================
// Group Hooks
// ============================================================================
// Get all user's groups
export const useGroups = () => {
  return useQuery({
    queryKey: queryKeys.groups.list(),
    queryFn: () => apiService.getUserGroups(),
  });
};

// Get single group
export const useGroup = (groupId: string) => {
  return useQuery({
    queryKey: queryKeys.groups.detail(groupId),
    queryFn: () => apiService.getGroupById(groupId),
    enabled: !!groupId,
  });
};

// Create group
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      icon?: string;
      initialMembers?: string[];
    }) => apiService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
};

// Update group
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      updates,
    }: {
      groupId: string;
      updates: { name?: string; description?: string; icon?: string };
    }) => apiService.updateGroup(groupId, updates),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.groups.detail(variables.groupId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.list() });
    },
  });
};

// Add members
export const useAddGroupMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberIds }: { groupId: string; memberIds: string[] }) =>
      apiService.addGroupMembers(groupId, memberIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(variables.groupId) });
    },
  });
};

// Remove member
export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      apiService.removeGroupMember(groupId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(variables.groupId) });
    },
  });
};

// Make admin
export const useMakeGroupAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      apiService.makeGroupAdmin(groupId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(variables.groupId) });
    },
  });
};

// Remove admin
export const useRemoveGroupAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, adminId }: { groupId: string; adminId: string }) =>
      apiService.removeGroupAdmin(groupId, adminId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(variables.groupId) });
    },
  });
};

// Get group tabs
export const useGroupTabs = (groupId: string, status?: 'OPEN' | 'SETTLED' | 'CANCELLED') => {
  return useQuery({
    queryKey: [...queryKeys.groups.tabs(groupId), status],
    queryFn: () => apiService.getGroupTabs(groupId, status),
    enabled: !!groupId,
  });
};

// Create group tab
export const useCreateGroupTab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      tabData,
    }: {
      groupId: string;
      tabData: {
        title: string;
        description?: string;
        category?: TabCategory;
        totalAmount: string;
        currency: string;
        // participants: { userId: string; shareAmount?: string }[];
        settlementWallet?: string;
        settlementDeadline?: string;
        penaltyRate?: number;
        autoSettleEnabled?: boolean;
      };
    }) => apiService.createGroupTab(groupId, tabData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.tabs(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: ['tabs'] });
    },
  });
};

// Leave group
export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => apiService.leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
};

// Delete group
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => apiService.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
};

// ============================================================================
// Tab Hooks
// ============================================================================

export const useTabs = (status?: 'OPEN' | 'SETTLED' | 'CANCELLED', category?: TabCategory, page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...queryKeys.tabs.list(status), category],
    queryFn: () => apiService.getTabs(status, category, page, limit),
  });
};

export const useTab = (tabId: string) => {
  return useQuery({
    queryKey: queryKeys.tabs.detail(tabId),
    queryFn: () => apiService.getTabById(tabId),
    enabled: !!tabId,
  });
};

export const useCreateTab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tabData: {
      title: string;
      description?: string;
      category?: TabCategory;
      totalAmount: string;
      currency: string;
      participants: { userId: string; shareAmount?: string }[];
      settlementWallet?: string;
      settlementDeadline?: string;
      penaltyRate?: number;
      autoSettleEnabled?: boolean;
    }) => apiService.createTab(tabData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tabs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.channels });
    },
  });
};

export const useUpdateTab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tabId,
      updates,
    }: {
      tabId: string;
      updates: { title?: string; description?: string; icon?: string };
    }) => apiService.updateTab(tabId, updates),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.tabs.detail(variables.tabId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.tabs.list() });
    },
  });
};

export const useSettleTab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tabId, txHash, amount }: { tabId: string; txHash: string; amount: string }) =>
      apiService.settleTab(tabId, txHash, amount),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.tabs.detail(variables.tabId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.tabs.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
    },
  });
};

export const useCancelTab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tabId: string) => apiService.cancelTab(tabId),
    onSuccess: (_, tabId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tabs.list() });
      queryClient.removeQueries({ queryKey: queryKeys.tabs.detail(tabId) });
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: (tabId: string) => apiService.resendOTP(tabId),
  });
};

export const useVerifyParticipation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tabId, otpCode, accept }: { tabId: string; otpCode: string; accept: boolean }) =>
      apiService.verifyTabParticipation(tabId, otpCode, accept),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tabs.detail(variables.tabId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tabs.list() });
    },
  });
};

// ============================================================================
// Notification Hooks
// ============================================================================

export const useNotifications = (read?: boolean, page = 1, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(read),
    queryFn: () => apiService.getNotifications(read, undefined, page, limit),
  });
};

export const useGenerateSettlementHash = () => {
  return useMutation({
    mutationFn: ({ sender, amount }: { sender: string; amount: number }) =>
      apiService.generateTabSettlementHash(sender, amount),
  });
};

export const useSubmitSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rawTxnHex,
      publicKey,
      signature,
    }: {
      rawTxnHex: string;
      publicKey: string;
      signature: string;
    }) => apiService.submitTabSettlement(rawTxnHex, publicKey, signature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tabs.all });
    },
  });
};

export const useUSDCBalance = (address: string) => {
  return useQuery({
    queryKey: ['balance', address],
    queryFn: () => apiService.getUSDCBalance(address),
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => apiService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => apiService.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.setQueryData(queryKeys.notifications.unreadCount, 0);
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => apiService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

// ============================================================================
// Chat Hooks
// ============================================================================

export const useChannels = () => {
  return useQuery({
    queryKey: queryKeys.chat.channels,
    queryFn: () => apiService.getChannels(),
  });
};

export const useChannelByTabId = (tabId: string) => {
  return useQuery({
    queryKey: queryKeys.chat.channel(tabId),
    queryFn: () => apiService.getChannelByTabId(tabId),
    enabled: !!tabId,
  });
};

export const useChannelMessages = (channelId: string, limit = 50, offset = 0) => {
  return useQuery({
    queryKey: queryKeys.chat.messages(channelId),
    queryFn: () => apiService.getChannelMessages(channelId, limit, offset),
    enabled: !!channelId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      channelId,
      text,
      attachments,
    }: {
      channelId: string;
      text: string;
      attachments?: any[];
    }) => apiService.sendMessage(channelId, text, attachments),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(variables.channelId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.channels });
    },
  });
};

export const useMarkChannelAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => apiService.markChannelAsRead(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.channels });
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.unreadCount });
    },
  });
};

export const useUnreadMessagesCount = () => {
  return useQuery({
    queryKey: queryKeys.chat.unreadCount,
    queryFn: () => apiService.getUnreadMessagesCount(),
    refetchInterval: 30000,
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, messageId }: { channelId: string; messageId: string }) =>
      apiService.deleteMessage(channelId, messageId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(variables.channelId) });
    },
  });
};

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, text }: { messageId: string; text: string }) =>
      apiService.updateMessage(messageId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
    },
  });
};

// ============================================================================
// Analytics Hooks
// ============================================================================

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => apiService.getDashboardAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSpendingAnalytics = (params?: {
  period?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  groupBy?: 'day' | 'week' | 'month';
  category?: string;
}) => {
  return useQuery({
    queryKey: ['analytics', 'spending', params],
    queryFn: () => apiService.getSpendingAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePaymentBehaviorAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'payment-behavior'],
    queryFn: () => apiService.getPaymentBehaviorAnalytics(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useCategoryAnalytics = (params?: {
  period?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}) => {
  return useQuery({
    queryKey: ['analytics', 'categories', params],
    queryFn: () => apiService.getCategoryAnalytics(params),
    staleTime: 10 * 60 * 1000,
  });
};

export const useSocialAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'social'],
    queryFn: () => apiService.getSocialAnalytics(),
    staleTime: 15 * 60 * 1000,
  });
};

export const useTrendsAnalytics = (params?: {
  metric?: 'spending' | 'tabs' | 'trust_score';
  period?: 'week' | 'month' | 'quarter' | 'year';
}) => {
  return useQuery({
    queryKey: ['analytics', 'trends', params],
    queryFn: () => apiService.getTrendsAnalytics(params),
    staleTime: 10 * 60 * 1000,
  });
};

export interface InsightsAnalytics {
  totalSplit: number;
  totalOwed: number;
  averageSettleTime: number;
  categoryStats: Array<{
    category: string;
    totalAmount: string;
    spent: number;
    count: number;
    percentage: number;
  }>;
  monthlyActivity: Array<{
    month: string;
    amount: string;
  }>;
  timeline: any[];
  topSplittingPals: Array<{
    user: {
      id: string;
      username: string;
      avatarUrl?: string;
      email?: string;
    };
    sharedTabsCount: number;
    totalAmount: string;
  }>;
}

export const useInsightsAnalytics = () => {
  return useQuery<InsightsAnalytics>({
    queryKey: ['analytics', 'insights-aggregate'],
    queryFn: async () => {
      const [spending, behavior, social, categories] = await Promise.all([
        apiService.getSpendingAnalytics({ period: 'year', groupBy: 'month' }),
        apiService.getPaymentBehaviorAnalytics(),
        apiService.getSocialAnalytics(),
        apiService.getCategoryAnalytics({ period: 'year' }),
      ]);

      return {
        totalSplit: spending.totalSpent,
        totalOwed: spending.totalOwed,
        averageSettleTime: behavior.paymentStats.averageSettlementDays,
        categoryStats: spending.byCategory.map(c => ({
          category: c.category,
          totalAmount: String(c.spent),
          spent: Number(c.spent),
          count: c.count,
          percentage: (c.spent / spending.totalSpent) * 100 || 0,
        })),
        monthlyActivity: spending.timeline.map(t => ({
          month: new Date(t.date).toLocaleString('default', { month: 'short' }),
          amount: String(t.spent),
        })),
        timeline: spending.timeline,
        topSplittingPals: (social.topCollaborators || []).map((c: any) => ({
          user: {
            id: c.userId,
            username: c.username,
            avatarUrl: c.avatarUrl,
            email: c.email
          },
          sharedTabsCount: c.tabCount,
          totalAmount: String(c.totalAmount)
        })),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};