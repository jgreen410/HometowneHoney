import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useOrderStore } from '../../src/store/orderStore';
import { useAuthStore } from '../../src/store/authStore';

export default function SellerDashboardScreen() {
  const [isSellerMode, setIsSellerMode] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const toggleSellerRole = useAuthStore((s) => s.toggleSellerRole);
  const isSeller = profile?.isSeller ?? false;
  const hydrate = useOrderStore((s) => s.hydrate);

  // Refresh orders whenever this tab gains focus.
  useFocusEffect(
    useCallback(() => {
      hydrate();
    }, [hydrate])
  );

  const handleToggle = async (value: boolean) => {
    Haptics.selectionAsync();
    if (value && !isSeller) {
      // Becoming a seller for the first time.
      Alert.alert(
        'Become a seller?',
        'This turns on your seller storefront so you can list honey and accept orders.',
        [
          { text: 'Not now', style: 'cancel' },
          {
            text: 'Yes, start selling',
            onPress: async () => {
              await toggleSellerRole();
              setIsSellerMode(true);
            },
          },
        ]
      );
      return;
    }
    setIsSellerMode(value);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER & TOGGLE */}
      <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-black">
          {isSellerMode ? "Seller Console" : "My Profile"}
        </Text>
        <View className="flex-row items-center space-x-2">
          <Text className="text-xs font-bold text-gray-400 uppercase mr-2">
            {isSellerMode ? "Selling" : "Buying"}
          </Text>
          <Switch
            value={isSellerMode}
            onValueChange={handleToggle}
            trackColor={{ false: '#e5e5e5', true: '#F4CA44' }}
            thumbColor={isSellerMode ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <ScrollView className="flex-1">
        {isSellerMode ? (
          <SellerView />
        ) : (
          <BuyerView isSeller={isSeller} onBecomeSeller={() => handleToggle(true)} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- SUB-COMPONENTS ---

function BuyerView({ isSeller, onBecomeSeller }: { isSeller: boolean; onBecomeSeller: () => void }) {
  return (
    <View className="p-6">
      <View className="bg-honey-50 p-6 rounded-2xl mb-6 border border-honey-100">
        <Text className="text-honey-900 font-bold text-lg mb-2">My Impact</Text>
        <Text className="text-honey-900/80 leading-6">
          You've supported <Text className="font-bold">2 local apiaries</Text> this season.
          That's approx. 50,000 bees kept busy! 🐝
        </Text>
      </View>

      {!isSeller && (
        <TouchableOpacity
          onPress={onBecomeSeller}
          className="bg-black p-5 rounded-2xl mb-6 flex-row items-center justify-between active:scale-[0.99]"
        >
          <View className="flex-1 pr-3">
            <Text className="text-white font-bold text-lg mb-1">Sell your honey 🍯</Text>
            <Text className="text-gray-300 text-sm">
              Turn on a seller account to list batches and accept orders.
            </Text>
          </View>
          <Text className="text-honey-400 text-2xl font-bold">→</Text>
        </TouchableOpacity>
      )}

      <Text className="font-bold text-black text-lg mb-4">Recent Orders</Text>
      {/* Mock Order History */}
      <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-2">
        <View className="flex-row justify-between mb-2">
          <Text className="font-bold text-gray-800">Highland Hive Co.</Text>
          <Text className="text-green-600 font-bold text-xs">DELIVERED</Text>
        </View>
        <Text className="text-gray-500 text-sm">2x Spring Wildflower • $24.00</Text>
      </View>
    </View>
  );
}

function SellerView() {
  const router = useRouter();
  const { orders, markAsShipped } = useOrderStore();
  const revenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

  const handleShip = (orderId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markAsShipped(orderId).catch((e) => Alert.alert('Could not update', e?.message ?? ''));
  };

  return (
    <View className="p-6">
      {/* METRICS ROW */}
      <View className="flex-row gap-4 mb-8">
        <View className="flex-1 bg-black p-5 rounded-2xl shadow-sm">
          <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Total Revenue</Text>
          <Text className="text-white text-2xl font-bold">${(revenue / 100).toFixed(0)}</Text>
        </View>
        <View className="flex-1 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Pending Orders</Text>
          <Text className="text-black text-2xl font-bold">
            {orders.filter(o => o.status === 'pending').length}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/seller/add-product')}
        className="flex-row items-center justify-center bg-gray-50 py-4 rounded-xl border-2 border-dashed border-gray-300 mb-6 active:bg-gray-100"
      >
        <Text className="font-bold text-gray-500">+ Add New Honey Batch</Text>
      </TouchableOpacity>

      <Text className="font-bold text-black text-lg mb-4">Incoming Orders</Text>
      {orders.length === 0 ? (
        <View className="p-6 bg-gray-50 rounded-xl items-center border border-dashed border-gray-300 mb-6">
          <Text className="text-gray-400">No orders yet. Wait for the harvest!</Text>
        </View>
      ) : (
        orders.map((order) => (
          <MotiView
            key={order.id}
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-4 rounded-xl border border-gray-100 mb-3 shadow-sm"
          >
            <View className="flex-row justify-between mb-2">
              <Text className="font-bold text-black">Order #{order.id}</Text>
              <View className={`px-2 py-1 rounded text-xs ${order.status === 'pending' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <Text className={`font-bold text-xs ${order.status === 'pending' ? 'text-yellow-800' : 'text-green-800'}`}>
                  {order.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text className="text-gray-500 text-sm mb-3">
              {order.items.length} items • ${(order.totalAmount / 100).toFixed(2)}
            </Text>

            {order.status === 'pending' && (
              <TouchableOpacity
                onPress={() => handleShip(order.id)}
                className="bg-black py-2 rounded-lg items-center"
              >
                <Text className="text-white font-bold text-sm">Mark as Shipped</Text>
              </TouchableOpacity>
            )}
          </MotiView>
        ))
      )}
    </View>
  );
}
