import { Tabs } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { Icon } from '../../components/Icon';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const router = useRouter();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9',
            paddingBottom: 32,
            paddingTop: 16,
            height: 90,
          },
          tabBarActiveTintColor: '#4f46e5',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            marginTop: 6,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Icon 
                name={focused ? 'home' : 'home-outline'} 
                size={22} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            title: 'Friends',
            tabBarIcon: ({ color, focused }) => (
              <Icon 
                name={focused ? 'people' : 'people-outline'} 
                size={22} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, focused }) => (
              <Icon 
                name={focused ? 'pie-chart' : 'pie-chart-outline'} 
                size={22} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <Icon 
                name={focused ? 'settings' : 'settings-outline'} 
                size={22} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>

      {/* Floating Action Button */}
      <View className="absolute bottom-24 right-6 z-50">
        <TouchableOpacity
          onPress={() => router.push('/create')}
          className="w-16 h-16 bg-indigo-600 rounded-full shadow-lg items-center justify-center"
          activeOpacity={0.8}
        >
          <Icon name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );
}