import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Icon } from './Icon';
import { TabCategory, TAB_CATEGORIES } from '../services/api';

interface CategoryPickerProps {
  visible: boolean;
  selectedCategory: TabCategory;
  onSelect: (category: TabCategory) => void;
  onClose: () => void;
}

export function CategoryPicker({ visible, selectedCategory, onSelect, onClose }: CategoryPickerProps) {
  const categories = Object.entries(TAB_CATEGORIES) as [TabCategory, typeof TAB_CATEGORIES[TabCategory]][];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 pb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-slate-900">Select Category</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <Icon name="close" size={20} />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap gap-3">
            {categories.map(([key, category]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  onSelect(key);
                  onClose();
                }}
                className={`flex-1 min-w-[45%] p-4 rounded-2xl border-2 ${
                  selectedCategory === key ? '' : 'border-slate-200'
                }`}
                style={{
                  backgroundColor: selectedCategory === key ? `${category.color}20` : '#fff',
                  borderColor: selectedCategory === key ? category.color : undefined,
                }}
              >
                <Text className="text-3xl mb-2">{category.icon}</Text>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: selectedCategory === key ? category.color : '#0f172a' }}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}