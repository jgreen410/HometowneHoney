import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useOrderStore } from '../../src/store/orderStore';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/store/themeStore';
import { HoneycombBackground } from '../../components/HoneycombBackground';
import type { ThemePalette } from '../../src/constants/theme';

export default function SellerDashboardScreen() {
  const [isSellerMode, setIsSellerMode] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const toggleSellerRole = useAuthStore((s) => s.toggleSellerRole);
  const isSeller = profile?.isSeller ?? false;
  const hydrate = useOrderStore((s) => s.hydrate);
  const { isDark, C } = useTheme();

  useFocusEffect(useCallback(() => { hydrate(); }, [hydrate]));

  const handleToggle = async (value: boolean) => {
    Haptics.selectionAsync();
    if (value && !isSeller) {
      Alert.alert(
        'Become a seller?',
        'This turns on your seller storefront so you can list honey and accept orders.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Yes, start selling', onPress: async () => { await toggleSellerRole(); setIsSellerMode(true); } },
        ]
      );
      return;
    }
    setIsSellerMode(value);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <HoneycombBackground opacity={0.05} />
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
              {isSellerMode ? 'Seller console' : 'Buyer view'}
            </Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, color: C.textPrimary }}>
              {isSellerMode ? 'My Batch' : 'My Impact'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{
              fontFamily: 'DMSans_700Bold', fontSize: 11,
              color: isSellerMode ? C.amberDeep : C.textMuted,
            }}>
              {isSellerMode ? 'Selling' : 'Buying'}
            </Text>
            <Switch
              value={isSellerMode}
              onValueChange={handleToggle}
              trackColor={{ false: C.surfaceAlt, true: '#F4CA44' }}
              thumbColor={isSellerMode ? '#C17B1A' : (isDark ? '#5C4020' : '#D4A84A')}
            />
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
          {isSellerMode
            ? <SellerView isDark={isDark} C={C} />
            : <BuyerView isSeller={isSeller} onBecomeSeller={() => handleToggle(true)} isDark={isDark} C={C} />}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function BuyerView({ isSeller, onBecomeSeller, C }: { isSeller: boolean; onBecomeSeller: () => void; isDark: boolean; C: ThemePalette }) {
  return (
    <View style={{ padding: 24 }}>
      {/* Impact card */}
      <View style={{
        backgroundColor: C.surface,
        borderRadius: 20, padding: 20, marginBottom: 16,
        borderWidth: 1, borderColor: C.border,
        borderLeftWidth: 4, borderLeftColor: '#C17B1A',
      }}>
        <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: C.textPrimary, marginBottom: 8 }}>
          My Impact
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: C.textSecondary, lineHeight: 22 }}>
          You've supported{' '}
          <Text style={{ fontFamily: 'DMSans_700Bold', color: C.amberDeep }}>2 local apiaries</Text>
          {' '}this season — that's roughly 50,000 bees kept busy. 🐝
        </Text>
      </View>

      {!isSeller && (
        <TouchableOpacity onPress={onBecomeSeller} activeOpacity={0.88}>
          <LinearGradient
            colors={['#2B1800', '#1A0D02']}
            style={{
              borderRadius: 20, padding: 20, marginBottom: 16,
              flexDirection: 'row', alignItems: 'center',
              borderWidth: 1, borderColor: '#5C4020',
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: '#FFF8E8', marginBottom: 4 }}>
                Sell your honey 🍯
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#D4A84A', lineHeight: 20 }}>
                Turn on a seller account to list batches and accept orders.
              </Text>
            </View>
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: '#C17B1A', alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="arrow-forward" size={20} color="#FFF8E8" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: C.textPrimary, marginBottom: 12 }}>
        Recent Orders
      </Text>
      <View style={{
        backgroundColor: C.surface, padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: C.border,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, color: C.textPrimary }}>
            Highland Hive Co.
          </Text>
          <View style={{ backgroundColor: C.surfaceAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 9, color: C.grove, letterSpacing: 1 }}>
              DELIVERED
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textSecondary }}>
          2× Spring Wildflower · $24.00
        </Text>
      </View>
    </View>
  );
}

function SellerView({ isDark, C }: { isDark: boolean; C: ThemePalette }) {
  const router = useRouter();
  const { orders, markAsShipped } = useOrderStore();
  const revenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const pending = orders.filter(o => o.status === 'pending').length;

  const handleShip = (orderId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markAsShipped(orderId).catch((e) => Alert.alert('Could not update', e?.message ?? ''));
  };

  return (
    <View style={{ padding: 24 }}>
      {/* Metrics */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <LinearGradient
          colors={['#2B1800', '#1A0D02']}
          style={{ flex: 1, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#5C4020' }}
        >
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8C6520', marginBottom: 6 }}>
            Total Revenue
          </Text>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: '#F4CA44' }}>
            ${(revenue / 100).toFixed(0)}
          </Text>
        </LinearGradient>

        <View style={{
          flex: 1, padding: 18, borderRadius: 20,
          backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
        }}>
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>
            Pending
          </Text>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: C.textPrimary }}>
            {pending}
          </Text>
        </View>
      </View>

      {/* Add batch button */}
      <TouchableOpacity
        onPress={() => router.push('/seller/add-product')}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          borderRadius: 16, paddingVertical: 16, marginBottom: 24,
          borderWidth: 2, borderColor: isDark ? '#5C4020' : '#D4A84A',
          borderStyle: 'dashed',
        }}
      >
        <MaterialCommunityIcons name="plus" size={18} color={C.amberDeep} />
        <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 14, color: C.amberDeep }}>
          Add New Honey Batch
        </Text>
      </TouchableOpacity>

      <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: C.textPrimary, marginBottom: 12 }}>
        Incoming Orders
      </Text>

      {orders.length === 0 ? (
        <View style={{
          padding: 24, borderRadius: 16, alignItems: 'center',
          backgroundColor: C.surface,
          borderWidth: 1.5, borderColor: C.border, borderStyle: 'dashed',
        }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🐝</Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: C.textSecondary, textAlign: 'center' }}>
            No orders yet. The bees are still working!
          </Text>
        </View>
      ) : (
        orders.map((order, index) => (
          <MotiView
            key={order.id}
            from={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 60 }}
            style={{
              backgroundColor: C.surface, padding: 16, borderRadius: 18, marginBottom: 10,
              borderWidth: 1, borderColor: C.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, color: C.textPrimary }}>
                Order #{order.id.slice(-6)}
              </Text>
              <View style={{
                paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                backgroundColor: order.status === 'pending'
                  ? C.surfaceAlt
                  : (isDark ? '#0A2005' : '#D9EDD0'),
              }}>
                <Text style={{
                  fontFamily: 'DMSans_700Bold', fontSize: 9, letterSpacing: 1,
                  color: order.status === 'pending' ? C.amberDeep : C.grove,
                }}>
                  {order.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textSecondary, marginBottom: 12 }}>
              {order.items.length} items · ${(order.totalAmount / 100).toFixed(2)}
            </Text>

            {order.status === 'pending' && (
              <TouchableOpacity onPress={() => handleShip(order.id)} activeOpacity={0.88}>
                <LinearGradient
                  colors={['#F4CA44', '#C17B1A']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}
                >
                  <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 13, color: '#2B1800' }}>
                    Mark as Shipped
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </MotiView>
        ))
      )}
    </View>
  );
}
