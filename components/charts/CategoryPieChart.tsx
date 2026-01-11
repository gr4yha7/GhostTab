// components/charts/CategoryPieChart.tsx
import React from 'react';
import { View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

interface CategoryPieChartProps {
  data: Array<{
    category: string;
    spent: number;
    color: string;
  }>;
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const screenWidth = Dimensions.get('window').width;

  const chartData = data.map((item, index) => ({
    name: item.category,
    population: item.spent,
    color: item.color,
    legendFontColor: '#64748b',
    legendFontSize: 12,
  }));

  return (
    <View>
      <PieChart
        data={chartData}
        width={screenWidth - 48}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
}
