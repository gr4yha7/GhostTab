import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrivy } from '@privy-io/expo';
import { useSignRawHash } from "@privy-io/expo/extended-chains";
import { Icon } from '../components/Icon';
import { useSettleTab, useGenerateSettlementHash, useSubmitSettlement } from '../hooks/api';
import { useError } from '../context/ErrorContext';

export default function SettleScreen() {
  const router = useRouter();
  const { user } = usePrivy();
  const { signRawHash } = useSignRawHash();

  const { tabId, amount, title } = useLocalSearchParams<{
    tabId: string;
    amount: string;
    title: string;
  }>();
  const { showError } = useError();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');

  const settleTabMutation = useSettleTab();
  const generateHashMutation = useGenerateSettlementHash();
  const submitSettlementMutation = useSubmitSettlement();

  const handleSettle = async () => {
    try {
      const movementWallet = user?.linked_accounts?.find(
        (account: any) => account.type === "wallet" && account.chain_type === "aptos"
      ) as any;

      if (!movementWallet) {
        throw new Error('Movement wallet not found. Please ensure you have a wallet set up.');
      }

      setIsProcessing(true);

      // Step 1: Generate Hash from Backend
      setStatus('Generating transaction...');
      const numericalAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
      // BlockchainService uses it directly in functionArguments. 
      // Standard USDC is 6 decimals.
      const amountInBaseUnits = Math.round(numericalAmount * 1_000_000);

      const hashData = await generateHashMutation.mutateAsync({
        sender: movementWallet.address,
        amount: amountInBaseUnits,
      });

      if (!hashData.success) {
        throw new Error('Failed to generate settlement hash');
      }

      // Step 2: Sign Hash with Privy
      setStatus('Waiting for signature...');
      const { signature } = await signRawHash({
        address: movementWallet.address,
        chainType: "aptos",
        hash: hashData.hash as `0x${string}`,
      });

      // Step 3: Submit Signed Transaction to Backend
      setStatus('Submitting to Movement...');
      const submitResult = await submitSettlementMutation.mutateAsync({
        rawTxnHex: hashData.rawTxnHex,
        publicKey: movementWallet.public_key || '',
        signature,
      });

      if (!submitResult.success) {
        throw new Error(`Transaction failed: ${submitResult.vmStatus || 'Unknown error'}`);
      }

      const txHash = submitResult.transactionHash;

      // Step 4: Record Settlement in Database
      setStatus('Finalizing payment...');
      await settleTabMutation.mutateAsync({
        tabId,
        txHash,
        amount,
      });

      setIsProcessing(false);
      setStatus('');

      Alert.alert(
        'Payment Successful! 🎉',
        `You've settled $${amount} for "${title}"`,
        [
          {
            text: 'View Transaction',
            onPress: () => Linking.openURL(`https://explorer.movementnetwork.xyz/txn/${txHash}?network=bardock+testnet`),
          },
          {
            text: 'Done',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Settlement Error:', error);
      setIsProcessing(false);
      setStatus('');
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
                  Your payment is secured on the Movement Network
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
                <Icon name="flame" size={20} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-900 mb-1">
                  Sponsored Gas Fees
                </Text>
                <Text className="text-xs text-slate-500">
                  Shinami sponsors your transactions for free
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
            className={`w-full py-4 rounded-2xl shadow-lg mb-3 ${isProcessing ? 'bg-indigo-400' : 'bg-indigo-600'
              }`}
          >
            {isProcessing ? (
              <View className="items-center justify-center">
                <ActivityIndicator color="#fff" />
                {status && (
                  <Text className="text-white font-medium text-xs mt-1">{status}</Text>
                )}
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