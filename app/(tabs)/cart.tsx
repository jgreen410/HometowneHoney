import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../../src/store/cartStore';
import * as Haptics from 'expo-haptics';
import { useOrderStore } from '../../src/store/orderStore';
import { useAuthStore } from '../../src/store/authStore';

export default function CartScreen() {
  const router = useRouter();
  const { items, removeItem, getTotalPrice, clearCart } = useCartStore();
  const placeOrder = useOrderStore((state) => state.placeOrder);
  const customerName = useAuthStore((state) => state.profile?.name ?? 'A Honey Fan');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemove = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeItem(id);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const orderItems = [...items];
    const total = getTotalPrice();
    try {
      await placeOrder(orderItems, total, customerName);
      clearCart();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Order Placed!", "The beekeeper has been notified.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Checkout failed", e?.message ?? "Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-earth-900">Your Harvest</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-earth-500 text-lg">Close</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View className="flex-1 justify-center items-center opacity-50">
          <Text className="text-4xl mb-4">🍯</Text>
          <Text className="text-earth-500 font-bold">Your crate is empty.</Text>
        </View>
      ) : (
        <View className="flex-1">
          <FlatList
            data={items}
            keyExtractor={(item) => item.cartId}
            contentContainerStyle={{ padding: 24 }}
            renderItem={({ item }) => (
              <View className="flex-row items-center mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-honey-500 uppercase mb-1">
                    From: {item.sellerName}
                  </Text>
                  <Text className="text-lg font-bold text-earth-900">{item.name}</Text>
                  <Text className="text-earth-500">${(item.price / 100).toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(item.cartId)}
                  className="px-3 py-2"
                >
                  <Text className="text-red-400 font-bold text-xs">REMOVE</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Checkout Bar */}
          <View className="p-6 border-t border-gray-100">
            <View className="flex-row justify-between mb-4">
              <Text className="text-earth-500">Subtotal</Text>
              <Text className="font-bold text-lg">${(getTotalPrice() / 100).toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              className={`w-full py-5 rounded-2xl items-center shadow-sm ${isProcessing ? 'bg-gray-300' : 'bg-honey-400'}`}
              onPress={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-earth-900 font-bold text-lg">Checkout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
