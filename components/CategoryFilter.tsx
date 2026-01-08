import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { TabCategory, TAB_CATEGORIES } from '../services/api';

interface CategoryFilterProps {
  selectedCategory?: TabCategory;
  onSelectCategory: (category?: TabCategory) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const categories = Object.entries(TAB_CATEGORIES) as [TabCategory, typeof TAB_CATEGORIES[TabCategory]][];

  return (
    <View className="mb-6">
      <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
        Filter by Category
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
        <TouchableOpacity
          onPress={() => onSelectCategory(undefined)}
          className={`mr-3 px-4 py-2 rounded-xl ${
            !selectedCategory ? 'bg-indigo-600' : 'bg-white border border-slate-200'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              !selectedCategory ? 'text-white' : 'text-slate-600'
            }`}
          >
            All
          </Text>
        </TouchableOpacity>
        {categories.map(([key, category]) => (
          <TouchableOpacity
            key={key}
            onPress={() => onSelectCategory(key)}
            className={`mr-3 px-4 py-2 rounded-xl flex-row items-center gap-2 ${
              selectedCategory === key
                ? 'border-2'
                : 'bg-white border border-slate-200'
            }`}
            style={{
              backgroundColor: selectedCategory === key ? `${category.color}20` : undefined,
              borderColor: selectedCategory === key ? category.color : undefined,
            }}
          >
            <Text className="text-base">{category.icon}</Text>
            <Text
              className="text-sm font-medium"
              style={{ color: selectedCategory === key ? category.color : '#64748b' }}
            >
              {category.label.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}