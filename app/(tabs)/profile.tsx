// app/(tabs)/profile.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { TrustScoreBadge } from '@/components/TrustScoreBadge';
import { Toggle } from '@/components/Toggle';
import { Card } from '@/components/Card';
import { useAuth } from '@/context/AuthContext';
import { useUpdateProfile, useUpdateAutoSettle, useUSDCBalance } from '@/hooks/api';
import { useError } from '@/context/ErrorContext';
import { usePrivy } from '@privy-io/expo';
import * as Clipboard from 'expo-clipboard';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, refreshAuth, logout } = useAuth();
  const { logout: privyLogout } = usePrivy();
  const { showError } = useError();
  const updateProfileMutation = useUpdateProfile();
  const updateAutoSettleMutation = useUpdateAutoSettle();
  const { data: usdcBalance, isLoading: isLoadingBalance } = useUSDCBalance(user?.walletAddress || '');

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [autoSettle, setAutoSettle] = useState(user?.autoSettle || false);
  const [limit, setLimit] = useState(15);

  const handleSave = async () => {
    if (!username.trim()) {
      showError('Username cannot be empty');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        username: username.trim(),
      });
      await refreshAuth();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleAutoSettleToggle = async (value: boolean) => {
    try {
      setAutoSettle(value);
      await updateAutoSettleMutation.mutateAsync({
        autoSettle: value,
        vaultAddress: user?.vaultAddress,
      });
    } catch (error) {
      setAutoSettle(!value); // Revert on error
      showError(error as Error);
    }
  };

  const handleCopyWallet = async () => {
    if (user?.walletAddress) {
      await Clipboard.setStringAsync(user.walletAddress);
      Alert.alert('Copied', 'Wallet address copied to clipboard');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await privyLogout();
              await logout();
              router.replace('/onboarding');
            } catch (error) {
              showError(error as Error);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center pb-24">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const onTimeRate = user.totalSettlements > 0
    ? ((user.settlementsOnTime / user.totalSettlements) * 100).toFixed(0)
    : '0';

  return (
    <View className="flex-1 bg-slate-50/50 pb-24">
      <View className="px-6 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-2xl font-semibold text-slate-900 tracking-tight">Profile</Text>
          {!isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-50 rounded-xl"
            >
              <Text className="text-indigo-600 font-medium text-sm">Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text className="text-xs text-slate-500 font-medium">
          Manage your account and preferences
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pb-24">
        {/* Profile Header */}
        <View className="bg-white rounded-3xl border border-slate-100 p-6 mb-6 items-center shadow-sm">
          <View className="mb-4">
            <Avatar
              src={user.avatarUrl || ''}
              size={100}
            />
          </View>

          {isEditing ? (
            <View className="w-full">
              <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Username
              </Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 mb-4"
              />
              <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Email
              </Text>
              <View className="w-full bg-slate-50 rounded-xl px-4 py-3 mb-4">
                <Text className="text-sm text-slate-500">{user.email}</Text>
                <Text className="text-xs text-slate-400 mt-1">Email cannot be changed</Text>
              </View>
            </View>
          ) : (
            <View className="items-center">
              <Text className="text-2xl font-bold text-slate-900 mb-1">
                {user.username || 'Anonymous'}
              </Text>
              <Text className="text-sm text-slate-500 mb-3">{user.email}</Text>

              <View className="bg-emerald-50 px-4 py-2 rounded-2xl flex-row items-center gap-2 mb-4">
                <Icon name="wallet" size={16} color="#10b981" />
                <Text className="text-lg font-bold text-emerald-700">
                  {isLoadingBalance ? '...' : usdcBalance?.toFixed(2)} USDC
                </Text>
              </View>
            </View>
          )}

          <TrustScoreBadge score={user.trustScore} size="large" />
        </View>

        {/* Wallet Address */}
        <View className="bg-white rounded-3xl border border-slate-100 p-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Wallet Address
            </Text>
            <TouchableOpacity onPress={handleCopyWallet} className="flex-row items-center gap-1">
              <Icon name="copy-outline" size={16} color="#6366f1" />
              <Text className="text-xs font-medium text-indigo-600">Copy</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-slate-50 rounded-xl p-3">
            <Text className="text-xs font-mono text-slate-700" numberOfLines={1}>
              {user.walletAddress}
            </Text>
          </View>
        </View>

        {/* Statistics */}
        <View className="bg-white rounded-3xl border border-slate-100 p-6 mb-6">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Statistics
          </Text>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-indigo-600">{user.totalSettlements}</Text>
              <Text className="text-xs text-slate-500 mt-1">Total Tabs</Text>
            </View>
            <View className="w-px bg-slate-100" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-emerald-600">{user.settlementsOnTime}</Text>
              <Text className="text-xs text-slate-500 mt-1">On Time</Text>
            </View>
            <View className="w-px bg-slate-100" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-orange-600">{user.settlementsLate}</Text>
              <Text className="text-xs text-slate-500 mt-1">Late</Text>
            </View>
          </View>

          <View className="border-t border-slate-100 pt-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-slate-600">On-Time Payment Rate</Text>
              <Text className="text-sm font-semibold text-slate-900">{onTimeRate}%</Text>
            </View>
            <View className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${onTimeRate}%` as any }}
              />
            </View>
          </View>

          {user.avgSettlementDays !== undefined && (
            <View className="mt-4 pt-4 border-t border-slate-100">
              <View className="flex-row justify-between">
                <Text className="text-sm text-slate-600">Average Settlement Time</Text>
                <Text className="text-sm font-semibold text-slate-900">
                  {user.avgSettlementDays.toFixed(1)} days
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Automation Settings (Commented out as requested) */}
        {/* <View className="mb-6">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Automation
          </Text>
          <Card className="p-5 mb-3">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                  <Icon name="flash" size={16} color="#4f46e5" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-900">
                    Auto-Settle Small Tabs
                  </Text>
                  <Text className="text-[10px] font-medium text-slate-400 uppercase">
                    Great for coffee & snacks
                  </Text>
                </View>
              </View>
              <Toggle
                checked={autoSettle}
                onChange={handleAutoSettleToggle}
              />
            </View>
            {autoSettle && (
              <View className="pt-2">
                <View className="flex-row items-center gap-4">
                  <Text className="text-xs font-semibold text-slate-400">$5</Text>
                  <View className="flex-1 h-6 justify-center">
                    <View className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-indigo-500"
                        style={{ width: `${((limit - 5) / 45) * 100}%` as any }}
                      />
                    </View>
                  </View>
                  <Text className="text-xs font-semibold text-slate-400">$50</Text>
                </View>
                <Text className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-2 self-center">
                  Settle up to ${limit}
                </Text>
              </View>
            )}
          </Card>

          <Card className="p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-8 h-8 rounded-lg bg-emerald-50 items-center justify-center">
                <Icon name="notifications" size={16} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-900">Push Notifications</Text>
                <Text className="text-[10px] font-medium text-slate-400 uppercase">
                  Stay updated on tabs
                </Text>
              </View>
            </View>
            <Toggle checked={true} onChange={() => { }} />
          </Card>
        </View> */}

        {/* Account Settings */}
        <View className="mb-6">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Account
          </Text>
          <Card>
            <TouchableOpacity
              className="p-4 flex-row items-center justify-between border-b border-slate-100"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-slate-100 items-center justify-center">
                  <Icon name="card-outline" size={16} />
                </View>
                <Text className="text-sm font-medium text-slate-900">Payment Methods</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-[10px] text-slate-400 font-medium">Privy Wallet</Text>
                <Icon name="chevron-forward" size={16} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Safety & Support */}
        <View className="mb-6">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Safety & Support
          </Text>
          <Card>
            <TouchableOpacity
              className="p-4 flex-row items-center justify-between border-b border-slate-100"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-slate-100 items-center justify-center">
                  <Icon name="shield-checkmark-outline" size={16} />
                </View>
                <Text className="text-sm font-medium text-slate-900">Privacy & Policy</Text>
              </View>
              <Icon name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-slate-100 items-center justify-center">
                  <Icon name="help-circle-outline" size={16} />
                </View>
                <Text className="text-sm font-medium text-slate-900">Help Center</Text>
              </View>
              <Icon name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Logout Button */}
        <View className="pt-2 pb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full bg-orange-50 py-4 rounded-2xl flex-row items-center justify-center gap-2"
          >
            <Icon name="log-out-outline" size={18} color="#ea580c" />
            <Text className="text-orange-600 font-semibold">Log Out</Text>
          </TouchableOpacity>
          <Text className="text-[10px] font-bold text-slate-300 text-center uppercase tracking-widest mt-8 mb-2">
            GhostTab v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <View className="p-4 bg-white border-t border-slate-100 pb-8 flex-row gap-3">
          <TouchableOpacity
            onPress={() => {
              setUsername(user.username || '');
              setIsEditing(false);
            }}
            className="flex-1 py-4 rounded-2xl bg-slate-100"
          >
            <Text className="text-slate-700 font-medium text-center">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={updateProfileMutation.isPending}
            className={`flex-1 py-4 rounded-2xl ${updateProfileMutation.isPending ? 'bg-indigo-400' : 'bg-indigo-600 shadow-lg'
              }`}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-center">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
