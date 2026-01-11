// app/accept-invite.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { OTPInput } from '../components/OTPInput';
import { useTab, useVerifyParticipation } from '../hooks/api';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import { apiService } from '../services/api';
import { TAB_CATEGORIES } from '../services/api';

export default function AcceptInviteScreen() {
  const router = useRouter();
  const { tabId } = useLocalSearchParams<{ tabId: string }>();
  const { user } = useAuth();
  const { showError } = useError();

  const { data: tab, isLoading, refetch } = useTab(tabId);
  const verifyMutation = useVerifyParticipation();
  const [otpCode, setOtpCode] = useState('');

  // Refetch when entering to ensure latest data
  React.useEffect(() => {
    refetch();
  }, [tabId]);

  const handleAccept = async () => {
    if (otpCode.length !== 6) {
      showError('Please enter the 6-digit verification code');
      return;
    }

    try {
      await verifyMutation.mutateAsync({ tabId, otpCode, accept: true });
      Alert.alert(
        'Success!',
        'You have successfully joined the tab.',
        [
          {
            text: 'View Tab',
            onPress: () => router.replace({ pathname: '/detail', params: { id: tabId } }),
          },
        ]
      );
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Invitation',
      'Are you sure you want to reject this tab invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await verifyMutation.mutateAsync({ tabId, otpCode: otpCode || '000000', accept: false });
              Alert.alert('Invitation Rejected', 'You have declined this tab invitation.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              showError(error as Error);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  if (!tab) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Text className="text-slate-400 text-center mb-4">Tab invitation not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-indigo-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const userParticipant = tab.participants?.find(p => p.userId === user?.id);
  const shareAmount = userParticipant?.shareAmount || '0.00';

  return (
    <View className="absolute inset-0 z-50 bg-slate-50">
      <SafeAreaView className="flex-1">
        <View className="px-4 pt-4 pb-4 bg-white flex-row items-center justify-between border-b border-slate-100">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <Icon name="close" size={18} />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-slate-900 tracking-tight">Tab Invitation</Text>
          </View>
        </View>

        <ScrollView className="flex-1 p-6">
          {/* Tab Details Card */}
          <View className="bg-white rounded-3xl border border-slate-100 p-6 mb-6 shadow-sm">
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-indigo-50 rounded-3xl items-center justify-center mb-4">
                <Text className="text-4xl">{TAB_CATEGORIES[tab.category]?.icon || '💸'}</Text>
              </View>
              <Text className="text-2xl font-bold text-slate-900 mb-2">{tab.title}</Text>
              {tab.description && (
                <Text className="text-sm text-slate-600 text-center">{tab.description}</Text>
              )}
            </View>

            <View className="border-t border-slate-100 pt-4">
              <View className="flex-row justify-between mb-3">
                <Text className="text-sm text-slate-500">Total Amount</Text>
                <Text className="text-sm font-semibold text-slate-900">${tab.totalAmount}</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-sm text-slate-500">Your Share</Text>
                <Text className="text-lg font-bold text-indigo-600">${shareAmount}</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-sm text-slate-500">Participants</Text>
                <Text className="text-sm font-semibold text-slate-900">{tab.participants?.length || 0} people</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-slate-500">Created by</Text>
                <Text className="text-sm font-semibold text-slate-900">
                  {tab.creator?.username || tab.creator?.email?.split('@')[0] || 'Unknown'}
                </Text>
              </View>
            </View>
          </View>

          {/* OTP Verification */}
          <View className="bg-white rounded-3xl border border-slate-100 p-6 mb-6">
            <View className="items-center mb-6">
              <View className="w-12 h-12 bg-indigo-50 rounded-full items-center justify-center mb-3">
                <Icon name="shield-checkmark" size={24} color="#6366f1" />
              </View>
              <Text className="text-lg font-bold text-slate-900 mb-2">Verification Required</Text>
              <Text className="text-sm text-slate-600 text-center">
                Enter the 6-digit code sent to your email to confirm your participation
              </Text>
            </View>

            <OTPInput
              length={6}
              onComplete={setOtpCode}
              onChangeText={setOtpCode}
            />
          </View>

          {/* Participants List */}
          <View className="bg-white rounded-3xl border border-slate-100 p-6">
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Other Participants
            </Text>
            {tab.participants
              ?.filter(p => p.userId !== user?.id)
              .map((participant, index) => (
                <View
                  key={participant.userId}
                  className={`flex-row items-center justify-between py-3 ${index !== (tab.participants?.length || 0) - 2 ? 'border-b border-slate-50' : ''
                    }`}
                >
                  <View className="flex-row items-center gap-3">
                    <Avatar
                      src={participant.user?.avatarUrl || ''}
                      size={36}
                    />
                    <Text className="text-sm font-medium text-slate-900">
                      {participant.user?.username || participant.user?.email?.split('@')[0] || 'Unknown'}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-slate-600">
                    ${participant.shareAmount}
                  </Text>
                </View>
              ))}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="p-4 bg-white border-t border-slate-100 pb-8">
          <TouchableOpacity
            onPress={handleAccept}
            disabled={verifyMutation.isPending || otpCode.length !== 6}
            style={{
              width: '100%',
              paddingVertical: 16,
              borderRadius: 16,
              marginBottom: 12,
              backgroundColor: verifyMutation.isPending || otpCode.length !== 6 ? '#a5b4fc' : '#4f46e5',
              shadowColor: '#4f46e5',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: verifyMutation.isPending || otpCode.length !== 6 ? 0 : 0.2,
              shadowRadius: 8,
              elevation: verifyMutation.isPending || otpCode.length !== 6 ? 0 : 4,
            }}
          >
            {verifyMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-center">Accept & Join Tab</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReject}
            disabled={verifyMutation.isPending}
            className="w-full py-4 rounded-2xl bg-slate-100"
          >
            <Text className="text-slate-700 font-medium text-center">Reject Invitation</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
