// app/settle.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { useSettleTab } from '../hooks/api';
import { useError } from '../context/ErrorContext';

export default function SettleScreen() {
  const router = useRouter();
  const { tabId, amount, title } = useLocalSearchParams<{
    tabId: string;
    amount: string;
    title: string;
  }>();
  const { showError } = useError();
  const [isProcessing, setIsProcessing] = useState(false);
  const settleTabMutation = useSettleTab();

  const handleSettle = async () => {
    try {
      setIsProcessing(true);

      // In a real app, this would:
      // 1. Connect to Privy wallet
      // 2. Initiate Movement Network transaction
      // 3. Wait for transaction confirmation
      // 4. Send tx hash to backend

      // For now, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock transaction hash (in production, this comes from Movement Network)
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;

      // Call backend to record settlement
      await settleTabMutation.mutateAsync({
        tabId,
        txHash: mockTxHash,
        amount,
      });

      setIsProcessing(false);

      Alert.alert(
        'Payment Successful! 🎉',
        `You've settled $${amount} for "${title}"`,
        [
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      setIsProcessing(false);
      showError(error as Error);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Payment', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1">
        <View className="px-4 pt-4 pb-4 bg-white border-b border-slate-100">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleCancel}
              disabled={isProcessing}
              className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
            >
              <Icon name="close" size={22} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-slate-900">Settle Payment</Text>
            <View className="w-10" />
          </View>
        </View>

        <View className="flex-1 px-6 py-8">
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl items-center justify-center mb-6 shadow-lg">
              <Icon name="wallet" size={40} color="#fff" />
            </View>
            <Text className="text-sm text-slate-500 mb-2">You're settling</Text>
            <Text className="text-5xl font-bold text-slate-900 mb-2">${amount}</Text>
            <Text className="text-sm text-slate-500">for {title}</Text>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
            <View className="flex-row items-start gap-3 mb-4">
              <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                <Icon name="shield-checkmark" size={20} color="#4f46e5" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-900 mb-1">
                  Secure Payment
                </Text>
                <Text className="text-xs text-slate-500">
                  Your payment is secured on the Movement Network blockchain
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3 mb-4">
              <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center">
                <Icon name="flash" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-900 mb-1">
                  Instant Settlement
                </Text>
                <Text className="text-xs text-slate-500">
                  Transaction completes in seconds via Privy wallet
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 bg-amber-50 rounded-full items-center justify-center">
                <Icon name="eye-off" size={20} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-900 mb-1">
                  Privacy First
                </Text>
                <Text className="text-xs text-slate-500">
                  Only transaction participants can view details
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-indigo-50 rounded-2xl p-4">
            <Text className="text-xs text-indigo-600 font-medium text-center">
              💡 This will connect to your Privy wallet and execute a transaction on the Movement
              Network
            </Text>
          </View>
        </View>

        <View className="px-6 pb-8 bg-white border-t border-slate-100">
          <TouchableOpacity
            onPress={handleSettle}
            disabled={isProcessing}
            className={`w-full py-4 rounded-2xl shadow-lg mb-3 ${
              isProcessing ? 'bg-indigo-400' : 'bg-indigo-600'
            }`}
          >
            {isProcessing ? (
              <View className="flex-row items-center justify-center gap-2">
                <ActivityIndicator color="#fff" />
                <Text className="text-white font-semibold text-base">Processing...</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-base text-center">
                Pay ${amount} Now
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCancel}
            disabled={isProcessing}
            className="w-full py-4"
          >
            <Text className="text-slate-400 font-medium text-sm text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}