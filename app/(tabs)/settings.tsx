import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Toggle } from '../../components/Toggle';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';

export default function SettingsScreen() {
  const [autoSettle, setAutoSettle] = useState(true);
  const [reminder, setReminder] = useState(true);
  const [limit, setLimit] = useState(15);

  return (
    <View className="flex-1 bg-slate-50/50 pb-24">
      <View className="px-6 pt-12 pb-6">
        <Text className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">Settings</Text>
        <Text className="text-xs text-slate-500 font-medium">
          Manage your GhostTab preferences
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pb-24">
        <View className="mb-8">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Account
          </Text>
          <Card>
            <TouchableOpacity className="p-4 flex-row items-center justify-between border-b border-slate-100">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-slate-100 items-center justify-center">
                  <Icon name="card-outline" size={16} />
                </View>
                <Text className="text-sm font-medium text-slate-900">Payment Methods</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-[10px] text-slate-400 font-medium">Visa •••• 4242</Text>
                <Icon name="chevron-forward" size={16} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-slate-100 items-center justify-center">
                  <Icon name="phone-portrait-outline" size={16} />
                </View>
                <Text className="text-sm font-medium text-slate-900">Connected Apps</Text>
              </View>
              <Icon name="chevron-forward" size={16} color="#cbd5e1" />
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
              <Toggle checked={autoSettle} onChange={setAutoSettle} />
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
                <Text className="text-sm font-semibold text-slate-900">Gentle Reminders</Text>
                <Text className="text-[10px] font-medium text-slate-400 uppercase">
                  We'll nudge, not nag
                </Text>
              </View>
            </View>
            <Toggle checked={reminder} onChange={setReminder} />
          </Card>
        </View>

        <View className="mb-8">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Safety & Support
          </Text>
          <Card>
            <TouchableOpacity className="p-4 flex-row items-center justify-between border-b border-slate-100">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-slate-100 items-center justify-center">
                  <Icon name="shield-checkmark-outline" size={16} />
                </View>
                <Text className="text-sm font-medium text-slate-900">Privacy & Policy</Text>
              </View>
              <Icon name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>
            <TouchableOpacity className="p-4 flex-row items-center justify-between">
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

        <View className="pt-2">
          <TouchableOpacity className="w-full bg-orange-50 py-4 rounded-2xl flex-row items-center justify-center gap-2">
            <Icon name="log-out-outline" size={18} color="#ea580c" />
            <Text className="text-orange-600 font-semibold">Log Out</Text>
          </TouchableOpacity>
          <Text className="text-[10px] font-bold text-slate-300 text-center uppercase tracking-widest mt-8 mb-2">
            GhostTab v2.4.1 (2405)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}