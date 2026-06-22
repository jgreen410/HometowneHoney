import React from 'react';
import { Tabs } from 'expo-router';
import { AnimatedTabBar } from '../../components/AnimatedTabBar';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      backBehavior="history"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tabs.Screen name="faves" options={{ title: 'My Hives' }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart' }} />
      <Tabs.Screen name="index" options={{ title: 'Discover' }} />
      <Tabs.Screen name="seller-dashboard" options={{ title: 'My Batch' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="shop/[id]" options={{ href: null }} />
      <Tabs.Screen name="claim/[id]" options={{ href: null }} />
      <Tabs.Screen
        name="seller/add-product"
        options={{ href: null, title: 'Add Product' }}
      />
    </Tabs>
  );
}
