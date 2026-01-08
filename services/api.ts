// src/services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  phone?: string;
  autoSettle: boolean;
  vaultAddress?: string;
  trustScore: number;
  settlementsOnTime: number;
  settlementsLate: number;
  totalSettlements: number;
  avgSettlementDays?: number;
  createdAt?: string;
}

export interface TrustTier {
  tier: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  color: string;
  benefits: string[];
}

export interface Tab {
  id: string;
  title: string;
  description?: string;
  category: TabCategory;
  totalAmount: string;
  currency: string;
  status: 'OPEN' | 'SETTLED' | 'CANCELLED';
  streamChannelId: string;
  creatorId: string;
  creator: User;
  participants: TabParticipant[];
  summary: TabSummary;
  settlementWallet?: string;
  settlementDeadline?: string;
  penaltyRate: number;
  autoSettleEnabled: boolean;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export type TabCategory = 
  | 'DINING'
  | 'TRAVEL'
  | 'GROCERIES'
  | 'ENTERTAINMENT'
  | 'UTILITIES'
  | 'GIFTS'
  | 'TRANSPORTATION'
  | 'ACCOMMODATION'
  | 'OTHER';

export const TAB_CATEGORIES: Record<TabCategory, { label: string; icon: string; color: string }> = {
  DINING: { label: 'Dining & Restaurants', icon: '🍽️', color: '#f59e0b' },
  TRAVEL: { label: 'Travel & Trips', icon: '✈️', color: '#3b82f6' },
  GROCERIES: { label: 'Groceries', icon: '🛒', color: '#10b981' },
  ENTERTAINMENT: { label: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  UTILITIES: { label: 'Utilities & Bills', icon: '💡', color: '#06b6d4' },
  GIFTS: { label: 'Gifts', icon: '🎁', color: '#ec4899' },
  TRANSPORTATION: { label: 'Transportation', icon: '🚗', color: '#6366f1' },
  ACCOMMODATION: { label: 'Accommodation', icon: '🏠', color: '#14b8a6' },
  OTHER: { label: 'Other', icon: '📝', color: '#64748b' },
};

export interface TabParticipant {
  userId: string;
  user: User;
  shareAmount: string;
  paid: boolean;
  paidAt?: string;
  txHash?: string;
  settledEarly: boolean;
  daysLate: number;
  penaltyAmount: string;
  finalAmount: string;
  // OTP verification
  verified: boolean;
  otpSentAt?: string;
  verificationDeadline?: string;
}

export interface CategoryStats {
  category: TabCategory;
  count: number;
  totalAmount: string;
  percentage: number;
}

export interface InsightsData {
  totalSplit: string;
  averageSettleTime: number; // in days
  categoryStats: CategoryStats[];
  monthlyActivity: MonthlyActivity[];
  topSplittingPals: TopPal[];
}

export interface MonthlyActivity {
  month: string;
  amount: string;
  tabCount: number;
}

export interface TopPal {
  user: User;
  sharedTabsCount: number;
  totalAmount: string;
}

export interface TabSummary {
  totalPaid: string;
  remaining: string;
  allSettled: boolean;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  user: User;
  friend: User;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'TAB_CREATED'
  | 'TAB_UPDATED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_REMINDER'
  | 'TAB_SETTLED'
  | 'TAB_PARTICIPATION'
  | 'MESSAGE_RECEIVED';

export interface Channel {
  channelId: string;
  channelType: string;
  name: string;
  tabId: string;
  memberCount: number;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt?: string;
  attachments?: any[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  streamChannelId?: string;
  createdAt: string;
  updatedAt: string;
  creator: User;
  members: GroupMember[];
  memberCount: number;
  role?: 'CREATOR' | 'ADMIN' | 'MEMBER';
  joinedAt?: string;
}

export interface GroupMember {
  id: string;
  role: 'CREATOR' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: User;
}


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  TOKEN: '@ghosttab_token',
  USER: '@ghosttab_user',
  STREAM_TOKEN: '@ghosttab_stream_token',
};

// ============================================================================
// API Error Class
// ============================================================================

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// API Service Class
// ============================================================================

class ApiService {
  private token: string | null = null;

  // --------------------------------------------------------------------------
  // Storage Methods
  // --------------------------------------------------------------------------

  async getStoredToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      this.token = token;
      return token;
    } catch (error) {
      console.error('Failed to get stored token', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get stored user', error);
      return null;
    }
  }

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  async getStreamToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.STREAM_TOKEN);
    } catch (error) {
      console.error('Failed to get stream token', error);
      return null;
    }
  }

  async setStreamToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.STREAM_TOKEN, token);
  }

  async clearAuth(): Promise<void> {
    this.token = null;
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.STREAM_TOKEN,
    ]);
  }

  // --------------------------------------------------------------------------
  // HTTP Request Method
  // --------------------------------------------------------------------------

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token && !url.includes('/auth/login')) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        throw new ApiError(
          data.error?.code || 'UNKNOWN_ERROR',
          data.error?.message || 'An error occurred',
          data.error?.details,
          response.status
        );
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'NETWORK_ERROR',
        'Network request failed. Please check your connection.',
        error
      );
    }
  }

  // private async requestWithRetry(url: string, options: RequestInit, retries = 1) {
  //   try {
  //     return await this.request(url, options);
  //   } catch (error) {
  //     if (error.status === 401 && retries > 0) {
  //       // Token expired, get fresh one from Privy
  //       const freshToken = await getAccessToken();
  //       this.setToken(freshToken);
        
  //       // Retry request
  //       return this.requestWithRetry(url, options, retries - 1);
  //     }
  //     throw error;
  //   }
  // }

  // --------------------------------------------------------------------------
  // Auth Service Methods
  // --------------------------------------------------------------------------

  async login(privyToken: string): Promise<{
    token: string;
    user: User;
    streamToken: string;
    isNewUser: boolean;
  }> {
    const data = await this.request<{
      token: string;
      user: User;
      streamToken: string;
      isNewUser: boolean;
    }>(`${API_CONFIG.AUTH_SERVICE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ privyToken }),
    });

    await this.setToken(data.token);
    await this.setUser(data.user);
    await this.setStreamToken(data.streamToken);

    return data;
  }

  async refreshToken(): Promise<string> {
    const data = await this.request<{ token: string }>(
      `${API_CONFIG.AUTH_SERVICE}/auth/refresh`,
      {
        method: 'POST',
        body: JSON.stringify({ token: this.token }),
      }
    );

    await this.setToken(data.token);
    return data.token;
  }

  async getMe(): Promise<User> {
    const data = await this.request<{ user: User }>(
      `${API_CONFIG.AUTH_SERVICE}/auth/me`
    );
    await this.setUser(data.user);
    return data.user;
  }

  // --------------------------------------------------------------------------
  // User Service Methods
  // --------------------------------------------------------------------------

  async getUserProfile(): Promise<User> {
    return this.request<User>(`${API_CONFIG.USER_SERVICE}/users/profile`);
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    return this.request<User>(`${API_CONFIG.USER_SERVICE}/users/profile`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async updateAutoSettle(
    autoSettle: boolean,
    vaultAddress?: string
  ): Promise<User> {
    return this.request<User>(`${API_CONFIG.USER_SERVICE}/users/auto-settle`, {
      method: 'PATCH',
      body: JSON.stringify({ autoSettle, vaultAddress }),
    });
  }

  async searchUsers(query: string): Promise<{ users: User[]; total: number }> {
    return this.request<{ users: User[]; total: number }>(
      `${API_CONFIG.USER_SERVICE}/users/search?q=${encodeURIComponent(query)}`
    );
  }

  async getFriends(
    status?: 'PENDING' | 'ACCEPTED' | 'BLOCKED',
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Friendship>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    return this.request<PaginatedResponse<Friendship>>(
      `${API_CONFIG.USER_SERVICE}/users/friends?${params}`
    );
  }

  async getFriendRequests(): Promise<Friendship[]> {
    return this.request<Friendship[]>(
      `${API_CONFIG.USER_SERVICE}/users/friends/requests`
    );
  }

  async sendFriendRequest(toIdentifier: string): Promise<{
    message: string;
    friendRequestId: string;
    requiresOTP: boolean;
  }> {
    return this.request<{
      message: string;
      friendRequestId: string;
      requiresOTP: boolean;
    }>(`${API_CONFIG.USER_SERVICE}/users/friends/request`, {
      method: 'POST',
      body: JSON.stringify({ toIdentifier }),
    });
  }

  async acceptFriendRequest(
    friendshipId: string,
    otpCode?: string
  ): Promise<Friendship> {
    return this.request<Friendship>(
      `${API_CONFIG.USER_SERVICE}/users/friends/${friendshipId}/accept`,
      {
        method: 'POST',
        body: JSON.stringify({ otpCode }),
      }
    );
  }

  async declineFriendRequest(friendshipId: string): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.USER_SERVICE}/users/friends/${friendshipId}/decline`,
      {
        method: 'DELETE',
      }
    );
  }

  async removeFriend(friendId: string): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.USER_SERVICE}/users/friends/${friendId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // --------------------------------------------------------------------------
  // User Insights Methods
  // --------------------------------------------------------------------------

  async getInsights(): Promise<InsightsData> {
    return this.request<InsightsData>(
      `${API_CONFIG.USER_SERVICE}/users/insights`
    );
  }

  async getTrustTier(score: number): Promise<TrustTier> {
    if (score >= 120) {
      return {
        tier: 'Excellent',
        color: '#10b981',
        benefits: ['Lower penalty rates', 'Priority support', 'Extended deadlines'],
      };
    } else if (score >= 100) {
      return {
        tier: 'Good',
        color: '#3b82f6',
        benefits: ['Standard rates', 'Normal deadlines'],
      };
    } else if (score >= 70) {
      return {
        tier: 'Fair',
        color: '#f59e0b',
        benefits: ['Standard rates', 'Payment reminders'],
      };
    } else {
      return {
        tier: 'Poor',
        color: '#ef4444',
        benefits: ['Higher penalty rates', 'Stricter deadlines'],
      };
    }
  }

  // --------------------------------------------------------------------------
  // Group Service Methods
  // --------------------------------------------------------------------------

  async createGroup(data: {
    name: string;
    description?: string;
    icon?: string;
    initialMembers?: string[];
  }): Promise<Group> {
    return this.request<Group>(`${API_CONFIG.USER_SERVICE}/users/groups`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserGroups(): Promise<Group[]> {
    return this.request<Group[]>(`${API_CONFIG.USER_SERVICE}/users/groups`);
  }

  async getGroupById(groupId: string): Promise<Group> {
    return this.request<Group>(`${API_CONFIG.USER_SERVICE}/users/groups/${groupId}`);
  }

  async updateGroup(
    groupId: string,
    updates: { name?: string; description?: string; icon?: string }
  ): Promise<Group> {
    return this.request<Group>(`${API_CONFIG.USER_SERVICE}/users/groups/${groupId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async addGroupMembers(groupId: string, memberIds: string[]): Promise<void> {
    await this.request<void>(`${API_CONFIG.USER_SERVICE}/users/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ memberIds }),
    });
  }

  async removeGroupMember(groupId: string, memberId: string): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.USER_SERVICE}/users/groups/${groupId}/members/${memberId}`,
      { method: 'DELETE' }
    );
  }

  async makeGroupAdmin(groupId: string, memberId: string): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.USER_SERVICE}/users/groups/${groupId}/admins/${memberId}`,
      { method: 'POST' }
    );
  }

  async removeGroupAdmin(groupId: string, adminId: string): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.USER_SERVICE}/users/groups/${groupId}/admins/${adminId}`,
      { method: 'DELETE' }
    );
  }

  async getGroupTabs(
    groupId: string,
    status?: 'OPEN' | 'SETTLED' | 'CANCELLED',
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Tab>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    return this.request<PaginatedResponse<Tab>>(
      `${API_CONFIG.USER_SERVICE}/users/groups/${groupId}/tabs?${params}`
    );
  }

  async leaveGroup(groupId: string): Promise<void> {
    await this.request<void>(`${API_CONFIG.USER_SERVICE}/users/groups/${groupId}/leave`, {
      method: 'POST',
    });
  }

  async deleteGroup(groupId: string): Promise<void> {
    await this.request<void>(`${API_CONFIG.USER_SERVICE}/users/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  // --------------------------------------------------------------------------
  // Tab Service Methods
  // --------------------------------------------------------------------------

  async createTab(tabData: {
    title: string;
    description?: string;
    category: TabCategory;
    totalAmount: string;
    currency: string;
    participants: { userId: string; shareAmount?: string }[];
    settlementWallet?: string;
    settlementDeadline?: string;
    penaltyRate?: number;
    autoSettleEnabled?: boolean;
  }): Promise<{ tab: Tab }> {
    return this.request<{ tab: Tab }>(`${API_CONFIG.TAB_SERVICE}/tabs`, {
      method: 'POST',
      body: JSON.stringify(tabData),
    });
  }

  async createGroupTab(
    groupId: string,
    tabData: {
      title: string;
      description?: string;
      category: string;
      totalAmount: string;
      currency: string;
      participants: { userId: string; shareAmount?: string }[];
      settlementWallet?: string;
      settlementDeadline?: string;
      penaltyRate?: number;
      autoSettleEnabled?: boolean;
    }
  ): Promise<{ tab: Tab }> {
    return this.request<{ tab: Tab }>(
      `${API_CONFIG.TAB_SERVICE}/tabs/group/${groupId}`,
      {
        method: 'POST',
        body: JSON.stringify(tabData),
      }
    );
  }

  async getTabs(
    status?: 'OPEN' | 'SETTLED' | 'CANCELLED',
    category?: TabCategory,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Tab>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(category && { category }),
    });
    return this.request<PaginatedResponse<Tab>>(
      `${API_CONFIG.TAB_SERVICE}/tabs?${params}`
    );
  }

  async getTabById(tabId: string): Promise<Tab> {
    return this.request<Tab>(`${API_CONFIG.TAB_SERVICE}/tabs/${tabId}`);
  }

  async verifyTabParticipation(
    tabId: string,
    otpCode: string,
    accept: boolean
  ): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.TAB_SERVICE}/tabs/${tabId}/verify-participation`,
      {
        method: 'POST',
        body: JSON.stringify({ otpCode, accept }),
      }
    );
  }

  async updateTab(
    tabId: string,
    updates: { title?: string; description?: string; icon?: string }
  ): Promise<Tab> {
    return this.request<Tab>(`${API_CONFIG.TAB_SERVICE}/tabs/${tabId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async settleTab(tabId: string, txHash: string, amount: string): Promise<Tab> {
    return this.request<Tab>(`${API_CONFIG.TAB_SERVICE}/tabs/${tabId}/settle`, {
      method: 'POST',
      body: JSON.stringify({ txHash, amount }),
    });
  }

  async cancelTab(tabId: string): Promise<void> {
    await this.request<void>(`${API_CONFIG.TAB_SERVICE}/tabs/${tabId}`, {
      method: 'DELETE',
    });
  }

  async getCategoryStats(): Promise<CategoryStats[]> {
    return this.request<CategoryStats[]>(
      `${API_CONFIG.TAB_SERVICE}/tabs/stats/categories`
    );
  }

  // --------------------------------------------------------------------------
  // Notification Service Methods
  // --------------------------------------------------------------------------

  async getNotifications(
    read?: boolean,
    type?: NotificationType,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(read !== undefined && { read: read.toString() }),
      ...(type && { type }),
    });
    return this.request<PaginatedResponse<Notification>>(
      `${API_CONFIG.NOTIFICATION_SERVICE}/notifications?${params}`
    );
  }

  async getUnreadCount(): Promise<number> {
    const data = await this.request<{ count: number }>(
      `${API_CONFIG.NOTIFICATION_SERVICE}/notifications/unread-count`
    );
    return data.count;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.NOTIFICATION_SERVICE}/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
      }
    );
  }

  async markAllAsRead(): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.NOTIFICATION_SERVICE}/notifications/read-all`,
      {
        method: 'PATCH',
      }
    );
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.NOTIFICATION_SERVICE}/notifications/${notificationId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async deleteAllNotifications(): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.NOTIFICATION_SERVICE}/notifications`,
      {
        method: 'DELETE',
      }
    );
  }

  // --------------------------------------------------------------------------
  // Chat Service Methods
  // --------------------------------------------------------------------------

  async getChatToken(): Promise<string> {
    const data = await this.request<{ token: string }>(
      `${API_CONFIG.CHAT_SERVICE}/chat/token`
    );
    return data.token;
  }

  async getChannels(): Promise<{ channels: Channel[]; total: number }> {
    return this.request<{ channels: Channel[]; total: number }>(
      `${API_CONFIG.CHAT_SERVICE}/chat/channels`
    );
  }

  async getChannelByTabId(tabId: string): Promise<Channel> {
    return this.request<Channel>(
      `${API_CONFIG.CHAT_SERVICE}/chat/tabs/${tabId}/channel`
    );
  }

  async getChannelMessages(
    channelId: string,
    limit = 50,
    offset = 0
  ): Promise<{ messages: Message[]; total: number }> {
    return this.request<{ messages: Message[]; total: number }>(
      `${API_CONFIG.CHAT_SERVICE}/chat/channels/${channelId}/messages?limit=${limit}&offset=${offset}`
    );
  }

  async sendMessage(
    channelId: string,
    text: string,
    attachments?: any[]
  ): Promise<Message> {
    return this.request<Message>(
      `${API_CONFIG.CHAT_SERVICE}/chat/channels/${channelId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ text, attachments }),
      }
    );
  }

  async markChannelAsRead(channelId: string): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.CHAT_SERVICE}/chat/channels/${channelId}/read`,
      {
        method: 'POST',
      }
    );
  }

  async getUnreadMessagesCount(): Promise<number> {
    const data = await this.request<{ count: number }>(
      `${API_CONFIG.CHAT_SERVICE}/chat/unread`
    );
    return data.count;
  }

  async searchMessages(
    channelId: string,
    query: string
  ): Promise<{ messages: Message[] }> {
    return this.request<{ messages: Message[] }>(
      `${API_CONFIG.CHAT_SERVICE}/chat/channels/${channelId}/search?q=${encodeURIComponent(query)}`
    );
  }

  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.CHAT_SERVICE}/chat/channels/${channelId}/messages/${messageId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async updateMessage(messageId: string, text: string): Promise<Message> {
    return this.request<Message>(
      `${API_CONFIG.CHAT_SERVICE}/chat/messages/${messageId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ text }),
      }
    );
  }

  async addReaction(messageId: string, reactionType: string): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.CHAT_SERVICE}/chat/messages/${messageId}/reactions`,
      {
        method: 'POST',
        body: JSON.stringify({ reactionType }),
      }
    );
  }

  async removeReaction(messageId: string): Promise<void> {
    await this.request<void>(
      `${API_CONFIG.CHAT_SERVICE}/chat/messages/${messageId}/reactions`,
      {
        method: 'DELETE',
      }
    );
  }
}

export const apiService = new ApiService();