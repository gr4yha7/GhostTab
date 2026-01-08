// app/(tabs)/settings.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Toggle } from '../../components/Toggle';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { Avatar } from '../../components/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useUpdateAutoSettle } from '../../hooks/api';
import { useError } from '../../context/ErrorContext';
import { usePrivy } from '@privy-io/expo';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { user: privyUser, logout: privyLogout } = usePrivy();
  const { showError } = useError();
  const updateAutoSettleMutation = useUpdateAutoSettle();

  const [autoSettle, setAutoSettle] = useState(user?.autoSettle || false);
  const [limit, setLimit] = useState(15);

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
              router.replace('/');
            } catch (error) {
              showError(error as Error);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50/50 pb-24">
      <View className="px-6 pt-12 pb-6">
        <Text className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">Settings</Text>
        <Text className="text-xs text-slate-500 font-medium">
          Manage your GhostTab preferences
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pb-24">
        <TouchableOpacity
          onPress={() => router.push('/profile')}
          className="bg-white rounded-2xl border border-slate-100 p-4 flex-row items-center gap-4 mb-8 shadow-sm"
        >
          <Avatar
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.id}`}
            size={56}
          />
          <View className="flex-1">
            <Text className="text-base font-semibold text-slate-900">
              {user?.username || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text className="text-xs text-slate-400 mt-0.5">
              {user?.email || 'No email set'}
            </Text>
            <Text className="text-[10px] text-slate-400 mt-1">
              {user?.walletAddress.slice(0, 8)}...{user?.walletAddress.slice(-6)}
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Account
          </Text>
          <Card>
            <TouchableOpacity
              // onPress={() => router.push('/payment-methods')}
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

        <View className="mb-8">
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
                disabled={updateAutoSettleMutation.isPending}
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
                        style={{ width: `${((limit - 5) / 45) * 100}%` }}
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
            <Toggle checked={true} onChange={() => {}} />
          </Card>
        </View>

        <View className="mb-8">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Safety & Support
          </Text>
          <Card>
            <TouchableOpacity
              // onPress={() => router.push('/privacy')}
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
              // onPress={() => router.push('/help')}
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
    </View>
  );
}