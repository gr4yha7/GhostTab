// app/add-friend.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { useSearchUsers, useSendFriendRequest } from '../hooks/api';
import { useError } from '../context/ErrorContext';

export default function AddFriendScreen() {
  const router = useRouter();
  const { showError } = useError();
  const [searchQuery, setSearchQuery] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(
    searchQuery,
    searchQuery.length >= 2
  );
  const sendRequestMutation = useSendFriendRequest();

  const handleSendRequest = async (identifier: string) => {
    try {
      const result = await sendRequestMutation.mutateAsync(identifier);
      
      if (result.requiresOTP) {
        // Show OTP modal
        setSelectedUser(identifier);
        setShowOTPModal(true);
      } else {
        Alert.alert('Success', 'Friend request sent!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      showError(error as Error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 pb-4 bg-white border-b border-slate-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
          >
            <Icon name="chevron-back" size={22} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-slate-900">Add Friend</Text>
          <View className="w-10" />
        </View>

        <View className="relative">
          <View className="absolute left-3 top-3 z-10">
            <Icon name="search-outline" size={18} color="#94a3b8" />
          </View>
          <TextInput
            placeholder="Search by email or wallet address"
            placeholderTextColor="#94a3b8"
            className="w-full bg-slate-100 text-sm py-3 pl-11 pr-4 rounded-xl"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View className="flex-1 p-6">
        {searchQuery.length < 2 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-indigo-50 rounded-full items-center justify-center mb-4">
              <Icon name="person-add-outline" size={32} color="#4f46e5" />
            </View>
            <Text className="text-slate-400 text-center text-base mb-2">Search for friends</Text>
            <Text className="text-slate-400 text-center text-sm px-8">
              Enter an email address or wallet address to find and add friends
            </Text>
          </View>
        ) : searchLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text className="text-slate-400 text-sm mt-4">Searching...</Text>
          </View>
        ) : !searchResults?.users || searchResults.users.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-4">
              <Icon name="search-outline" size={32} color="#cbd5e1" />
            </View>
            <Text className="text-slate-400 text-center text-base mb-2">No users found</Text>
            <Text className="text-slate-400 text-center text-sm px-8">
              Try searching with a different email or wallet address
            </Text>
          </View>
        ) : (
          <View>
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Results ({searchResults.users.length})
            </Text>
            {searchResults.users.map((user) => (
              <Card key={user.id} className="p-4 flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3 flex-1">
                  <Avatar
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${user.id}`}
                    size={48}
                  />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900">
                      {user.username || user.email?.split('@')[0] || 'User'}
                    </Text>
                    <Text className="text-xs text-slate-400">
                      {user.email || `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleSendRequest(user.email || user.walletAddress)}
                  disabled={sendRequestMutation.isPending}
                  className="bg-indigo-600 px-4 py-2 rounded-lg"
                >
                  {sendRequestMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white text-xs font-semibold">Add</Text>
                  )}
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}
      </View>

      {showOTPModal && (
        <OTPModal
          visible={showOTPModal}
          onClose={() => {
            setShowOTPModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowOTPModal(false);
            setSelectedUser(null);
            Alert.alert('Success', 'Friend request sent!', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          }}
          userIdentifier={selectedUser || ''}
        />
      )}
    </SafeAreaView>
  );
}

// OTP Modal Component
function OTPModal({
  visible,
  onClose,
  onSuccess,
  userIdentifier,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userIdentifier: string;
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const { showError } = useError();
  const sendRequestMutation = useSendFriendRequest();

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showError('Please enter a valid 6-digit code');
      return;
    }

    try {
      // Note: This would need to be updated in the API service to accept OTP on initial request
      // For now, this is a placeholder for the flow
      onSuccess();
    } catch (error) {
      showError(error as Error);
    }
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
      <View className="bg-white rounded-3xl p-6 mx-6 w-full max-w-sm">
        <Text className="text-xl font-semibold text-slate-900 mb-2 text-center">Enter OTP Code</Text>
        <Text className="text-sm text-slate-500 text-center mb-6">
          We've sent a verification code to your email
        </Text>

        <View className="flex-row justify-between mb-6">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              value={digit}
              onChangeText={(value) => handleOTPChange(index, value)}
              keyboardType="number-pad"
              maxLength={1}
              className="w-12 h-14 bg-slate-50 rounded-xl text-center text-2xl font-semibold text-slate-900 border-2 border-slate-200"
            />
          ))}
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 bg-slate-100 py-3 rounded-xl"
          >
            <Text className="text-slate-700 font-medium text-center">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={otp.join('').length !== 6}
            className={`flex-1 py-3 rounded-xl ${
              otp.join('').length !== 6 ? 'bg-indigo-300' : 'bg-indigo-600'
            }`}
          >
            <Text className="text-white font-medium text-center">Verify</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}