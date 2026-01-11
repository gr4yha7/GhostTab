// app/create.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';
import { useFriends, useCreateTab, useGroups, useCreateGroupTab } from '../hooks/api';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import { TAB_CATEGORIES, TabCategory } from '../services/api';

const CATEGORIES = Object.entries(TAB_CATEGORIES).map(([key, value]) => ({
  key: key as TabCategory,
  ...value,
}));

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showError } = useError();
  const { data: friendsData, isLoading: friendsLoading } = useFriends('ACCEPTED');
  const { data: groupsData } = useGroups();
  const createTabMutation = useCreateTab();
  const createGroupTabMutation = useCreateGroupTab();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TabCategory>('DINING');
  const [totalAmount, setTotalAmount] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());

  // New fields
  const [settlementDeadline, setSettlementDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  // const [customWallet, setCustomWallet] = useState('');
  // const [useCustomWallet, setUseCustomWallet] = useState(false);
  const [penaltyRate, setPenaltyRate] = useState('5');
  const [enablePenalty, setEnablePenalty] = useState(false);
  const [isGroupTab, setIsGroupTab] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const toggleParticipant = (userId: string) => {
    const updated = new Set(selectedParticipants);
    if (updated.has(userId)) {
      updated.delete(userId);
    } else {
      updated.add(userId);
    }
    setSelectedParticipants(updated);
  };

  const handleCreate = async () => {
    // Validation
    if (!title.trim()) {
      showError('Please enter a title for the tab');
      return;
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    if (!isGroupTab && selectedParticipants.size === 0) {
      showError('Please select at least one participant');
      return;
    }

    if (isGroupTab && !selectedGroup) {
      showError('Please select a group');
      return;
    }

    // Validate custom wallet if enabled
    // if (useCustomWallet && customWallet) {
    //   if (!customWallet.startsWith('0x') || customWallet.length < 10) {
    //     showError('Please enter a valid wallet address (0x...)');
    //     return;
    //   }
    // }

    // Validate penalty rate if enabled
    if (enablePenalty) {
      const rate = parseFloat(penaltyRate);
      if (isNaN(rate) || rate < 0 || rate > 20) {
        showError('Penalty rate must be between 0% and 20%');
        return;
      }
    }

    try {
      if (isGroupTab && selectedGroup) {
        // Create group tab
        await createGroupTabMutation.mutateAsync({
          groupId: selectedGroup,
          tabData: {
            title: title.trim(),
            category: selectedCategory,
            totalAmount,
            currency: 'USDC',
            settlementDeadline: settlementDeadline?.toISOString(),
            // settlementWallet: user?.walletAddress,
            penaltyRate: enablePenalty ? parseFloat(penaltyRate) : undefined,
          },
        });
      } else {
        // Create regular tab
        const participants = Array.from(selectedParticipants).map((userId) => ({
          userId,
        }));


        await createTabMutation.mutateAsync({
          title: title.trim(),
          category: selectedCategory,
          totalAmount,
          currency: 'USDC',
          participants,
          settlementDeadline: settlementDeadline?.toISOString(),
          // settlementWallet: user?.walletAddress,
          penaltyRate: enablePenalty ? parseFloat(penaltyRate) : undefined,
        });
      }

      // Navigate back on success
      router.back();
    } catch (error) {
      showError(error as Error);
    }
  };

  const splitAmount = totalAmount
    ? (parseFloat(totalAmount) / (selectedParticipants.size + 1)).toFixed(2)
    : '0.00';

  if (friendsLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="absolute inset-0 z-50 bg-slate-50">
      <SafeAreaView className="flex-1">
        <View className="px-4 pt-4 pb-4 bg-white flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-slate-900 tracking-tight">New Tab</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
          >
            <Icon name="close" size={18} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-6">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            What is it for?
          </Text>
          <View className="bg-white rounded-2xl border border-slate-200 p-1 flex-row items-center mb-6">
            <View className="w-10 h-10 items-center justify-center">
              <Icon name="happy-outline" size={22} />
            </View>
            <TextInput
              placeholder="E.g. Dinner at Luca's"
              placeholderTextColor="#cbd5e1"
              className="flex-1 h-10 text-sm font-medium text-slate-900"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Participants Section - Only show for regular tabs */}
          {!isGroupTab && (
            <>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Split With
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
                {friendsData?.data?.map((friendship) => {
                  const friend = friendship.friend?.id === user?.id ? friendship.user : friendship.friend;
                  if (!friend) return null;
                  return (
                    <TouchableOpacity
                      key={friendship.id}
                      onPress={() => toggleParticipant(friend.id)}
                      className="mr-3 items-center"
                      style={{ opacity: selectedParticipants.has(friend.id) ? 1 : 0.5 }}
                    >
                      <Avatar src={friend.avatarUrl || ''} size={60} />
                      <Text className="text-xs font-medium text-slate-700 mt-1">
                        {friend.username?.split(' ')[0] || friend.email?.split('@')[0] || 'Unknown'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                onPress={() => setSelectedCategory(category.key)}
                className="px-4 py-3 rounded-2xl items-center justify-center mr-3"
                style={{
                  backgroundColor: selectedCategory === category.key ? category.color : '#ffffff',
                  borderWidth: selectedCategory === category.key ? 0 : 1,
                  borderColor: '#f1f5f9',
                  ...(selectedCategory === category.key ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5,
                  } : {})
                }}
              >
                <Text className="text-2xl mb-1">{category.icon}</Text>
                <Text
                  className="text-xs font-medium"
                  style={{ color: selectedCategory === category.key ? 'white' : '#475569' }}
                >
                  {category.label.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Total Amount
          </Text>
          <View className="relative my-2">
            <Text className="absolute left-0 text-3xl font-medium text-emerald-500">
              $
            </Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#e2e8f0"
              keyboardType="numeric"
              className="w-full text-5xl font-medium text-emerald-500 pl-8"
              value={totalAmount}
              onChangeText={setTotalAmount}
            />
          </View>
          <Text className="text-[10px] font-medium text-indigo-600 mb-2">
            SPLIT EVENLY AMONG {selectedParticipants.size + 1} PEOPLE
          </Text>
          <Text className="text-sm text-slate-600 mb-8">
            Each person pays: ${splitAmount}
          </Text>

          {/* Group Tab Toggle */}
          <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-900 mb-1">Create as Group Tab</Text>
                <Text className="text-xs text-slate-500">
                  Split with all members of a group
                </Text>
              </View>
              <Switch
                value={isGroupTab}
                onValueChange={(value) => {
                  if (value && (!groupsData || groupsData.data.length === 0)) {
                    Alert.alert(
                      'No Groups',
                      'You haven\'t created any groups yet. Create a group first to use this feature.',
                      [{ text: 'OK' }]
                    );
                    return;
                  }
                  setIsGroupTab(value);
                  if (!value) {
                    setSelectedGroup(null);
                  }
                }}
                trackColor={{ false: '#cbd5e1', true: '#6366f1' }}
                thumbColor={isGroupTab ? '#fff' : '#f4f4f5'}
              />
            </View>

            {isGroupTab && groupsData && groupsData.data.length > 0 && (
              <View className="mt-3 pt-3 border-t border-slate-100">
                <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Select Group
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {groupsData.data.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      onPress={() => setSelectedGroup(group.id)}
                      className="mr-3 px-4 py-3 rounded-xl flex-row items-center gap-2"
                      style={{
                        backgroundColor: selectedGroup === group.id ? '#4f46e5' : '#f8fafc',
                        borderWidth: 1,
                        borderColor: selectedGroup === group.id ? '#4f46e5' : '#e2e8f0',
                        ...(selectedGroup === group.id ? {
                          shadowColor: '#4f46e5',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.2,
                          shadowRadius: 8,
                          elevation: 4,
                        } : {})
                      }}
                    >
                      <Text className="text-2xl">{group.icon || '👥'}</Text>
                      <Text
                        className={`text-sm font-medium ${selectedGroup === group.id ? 'text-white' : 'text-slate-900'
                          }`}
                      >
                        {group.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Settlement Deadline Section */}
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Settlement Deadline (Optional)
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white rounded-2xl border border-slate-200 p-4 flex-row items-center justify-between mb-6"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="calendar-outline" size={20} color="#6366f1" />
              <Text className={`text-sm font-medium ${settlementDeadline ? 'text-slate-900' : 'text-slate-400'}`}>
                {settlementDeadline
                  ? settlementDeadline.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                  : 'Set deadline (1-30 days)'}
              </Text>
            </View>
            {settlementDeadline && (
              <TouchableOpacity onPress={() => setSettlementDeadline(null)}>
                <Icon name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={settlementDeadline || new Date(Date.now() + 24 * 60 * 60 * 1000)}
              mode="date"
              display={'default'}
              minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
              maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setSettlementDeadline(selectedDate);
                }
              }}
            />
          )}

          {/* Penalty Rate Section */}
          {settlementDeadline && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Late Payment Penalty
                </Text>
                <Switch
                  value={enablePenalty}
                  onValueChange={setEnablePenalty}
                  trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
                  thumbColor={enablePenalty ? '#6366f1' : '#f1f5f9'}
                />
              </View>

              {enablePenalty && (
                <View className="bg-white rounded-2xl border border-slate-200 p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-slate-900">Penalty Rate</Text>
                    <Text className="text-lg font-semibold text-indigo-600">{penaltyRate}%</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => setPenaltyRate(Math.max(0, parseFloat(penaltyRate) - 1).toString())}
                      className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
                    >
                      <Icon name="remove" size={20} color="#64748b" />
                    </TouchableOpacity>
                    <View className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${(parseFloat(penaltyRate) / 20) * 100}%` }}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => setPenaltyRate(Math.min(20, parseFloat(penaltyRate) + 1).toString())}
                      className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
                    >
                      <Icon name="add" size={20} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-xs text-slate-500 mt-2">
                    Late payments will incur a {penaltyRate}% penalty per day
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Custom Settlement Wallet Section */}
          {/* <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Custom Settlement Wallet
              </Text>
              <Switch
                value={useCustomWallet}
                onValueChange={setUseCustomWallet}
                trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
                thumbColor={useCustomWallet ? '#6366f1' : '#f1f5f9'}
              />
            </View>

            {useCustomWallet && (
              <View className="bg-white rounded-2xl border border-slate-200 p-1 flex-row items-center">
                <View className="w-10 h-10 items-center justify-center">
                  <Icon name="wallet-outline" size={22} color="#6366f1" />
                </View>
                <TextInput
                  placeholder="0x..."
                  placeholderTextColor="#cbd5e1"
                  className="flex-1 h-10 text-sm font-medium text-slate-900"
                  value={customWallet}
                  onChangeText={setCustomWallet}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}
          </View> */}

          {/* Participants Section - Only for regular tabs */}
          {!isGroupTab && (
            <>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                With whom?
              </Text>

              {!friendsData?.data || friendsData.data.length === 0 ? (
                <View className="bg-white rounded-2xl border border-slate-100 p-6 items-center">
                  <Text className="text-slate-400 text-center mb-4">
                    You don't have any friends added yet
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/search-friends')}
                    className="bg-indigo-600 px-6 py-3 rounded-xl"
                  >
                    <Text className="text-white font-medium">Add Friends</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                friendsData.data.map((friendship) => {
                  const friend = friendship.friend?.id === user?.id ? friendship.user : friendship.friend;
                  if (!friend) return null;
                  const isSelected = selectedParticipants.has(friend.id);

                  return (
                    <TouchableOpacity
                      key={friendship.id}
                      onPress={() => toggleParticipant(friend.id)}
                      className="bg-white rounded-2xl border border-slate-100 p-4 mb-3 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-3">
                        <Avatar
                          src={friend.avatarUrl || ''}
                        />
                        <View>
                          <Text className="text-sm font-semibold text-slate-900">
                            {friend.username || friend.email?.split('@')[0]}
                          </Text>
                          <Text className="text-xs text-slate-500 mt-0.5">
                            ${splitAmount} each
                          </Text>
                        </View>
                      </View>
                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                          }`}
                      >
                        {isSelected && <Icon name="checkmark" size={14} color="#fff" />}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          )}
        </ScrollView>

        <View className="p-4 bg-white border-t border-slate-100 pb-8">
          <TouchableOpacity
            onPress={handleCreate}
            disabled={createTabMutation.isPending}
            className={`w-full py-4 rounded-2xl shadow-lg ${createTabMutation.isPending ? 'bg-indigo-400' : 'bg-indigo-600'
              }`}
          >
            {createTabMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-medium text-sm text-center">Create Tab</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}