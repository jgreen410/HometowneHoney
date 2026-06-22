import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

import { useCartStore } from '../../src/store/cartStore';
import { useOrderStore } from '../../src/store/orderStore';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/store/themeStore';
import { HoneycombBackground } from '../../components/HoneycombBackground';

export default function CartScreen() {
  const router = useRouter();
  const { items, removeItem, getTotalPrice, clearCart } = useCartStore();
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const customerName = useAuthStore((s) => s.profile?.name ?? 'A Honey Fan');
  const { C } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemove = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeItem(id);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      await placeOrder([...items], getTotalPrice(), customerName);
      clearCart();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Order Placed!', 'The beekeeper has been notified.', [
        { text: 'Sweet!', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Checkout failed', e?.message ?? 'Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <HoneycombBackground opacity={0.04} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16,
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
          borderBottomWidth: 1, borderBottomColor: C.divider,
        }}>
          <View>
            <Text style={{
              fontFamily: 'DMSans_700Bold', fontSize: 10,
              letterSpacing: 2, textTransform: 'uppercase',
              color: C.textMuted, marginBottom: 4,
            }}>
              {items.length} {items.length === 1 ? 'jar' : 'jars'}
            </Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, color: C.textPrimary }}>
              Your Harvest
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>🍯</Text>
            <Text style={{
              fontFamily: 'PlayfairDisplay_700Bold',
              fontSize: 22, color: C.textPrimary, textAlign: 'center', marginBottom: 8,
            }}>
              Your crate is empty
            </Text>
            <Text style={{
              fontFamily: 'DMSans_400Regular',
              fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 22,
            }}>
              Find a local beekeeper and ladle some honey into your harvest.
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              data={items}
              keyExtractor={(item) => item.cartId}
              contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
              renderItem={({ item, index }) => (
                <MotiView
                  from={{ opacity: 0, translateX: -12 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: index * 60 }}
                >
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    marginBottom: 10, padding: 16,
                    backgroundColor: C.surface,
                    borderRadius: 18,
                    borderWidth: 1, borderColor: C.border,
                  }}>
                    <View style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: C.amberSoft,
                      alignItems: 'center', justifyContent: 'center', marginRight: 14,
                      borderWidth: 1, borderColor: C.border,
                    }}>
                      <Text style={{ fontSize: 22 }}>🍯</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontFamily: 'DMSans_700Bold', fontSize: 10,
                        letterSpacing: 1.2, textTransform: 'uppercase',
                        color: C.amberDeep, marginBottom: 3,
                      }}>
                        {item.sellerName}
                      </Text>
                      <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: C.textPrimary }}>
                        {item.name}
                      </Text>
                      <Text style={{
                        fontFamily: 'DMSans_500Medium', fontSize: 14, color: C.amberDeep, marginTop: 2,
                      }}>
                        ${(item.price / 100).toFixed(2)}
                      </Text>
                    </View>

                    <TouchableOpacity onPress={() => handleRemove(item.cartId)} style={{ padding: 8 }} hitSlop={6}>
                      <Ionicons name="trash-outline" size={18} color={C.placeholder} />
                    </TouchableOpacity>
                  </View>
                </MotiView>
              )}
            />

            {/* Checkout bar */}
            <View style={{
              padding: 20,
              borderTopWidth: 1, borderTopColor: C.divider,
              backgroundColor: C.surface,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: C.textSecondary }}>
                  Subtotal
                </Text>
                <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: C.textPrimary }}>
                  ${(getTotalPrice() / 100).toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity onPress={handleCheckout} disabled={isProcessing} activeOpacity={0.88}>
                <LinearGradient
                  colors={isProcessing ? ['#D4A84A', '#B88830'] : ['#F4CA44', '#C17B1A']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 18, paddingVertical: 18, alignItems: 'center',
                    shadowColor: '#C17B1A', shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
                  }}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#2B1800" />
                  ) : (
                    <Text style={{
                      fontFamily: 'DMSans_700Bold', fontSize: 16, color: '#2B1800', letterSpacing: 0.3,
                    }}>
                      Place Order
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
