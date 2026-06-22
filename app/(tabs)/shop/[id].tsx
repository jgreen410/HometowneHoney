import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { HoneyImage } from '../../../components/HoneyImage';
import { HoneycombBackground } from '../../../components/HoneycombBackground';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { useApi } from '../../../src/services/api';
import { SellerProfile, Product } from '../../../src/types/schema';
import { useCartStore } from '../../../src/store/cartStore';
import { useFavesStore } from '../../../src/store/favesStore';
import { useTheme } from '../../../src/store/themeStore';
import { getHoneyImage } from '../../../src/constants/images';

export default function ShopScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const api = useApi();
  const addToCartStore = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.items.length);
  const { toggleFavorite, isFavorite } = useFavesStore();
  const { isDark, C } = useTheme();

  const [shop, setShop] = useState<SellerProfile | null>(null);
  const isLiked = shop ? isFavorite(shop.id) : false;

  useEffect(() => {
    if (id) api.getSellerById(id as string).then(d => setShop(d || null));
  }, [id]);

  const handleAddToCart = (item: Product) => {
    if (!shop) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCartStore(item, shop);
  };

  const handleToggleLike = () => {
    if (!shop) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(shop);
  };

  if (!shop) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  const headerImage = getHoneyImage(shop.id, shop.storeName || shop.ownerName);
  const floatBg = isDark ? 'rgba(44,26,6,0.9)' : 'rgba(255,248,232,0.92)';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <HoneycombBackground />

      {/* ── Floating header buttons ── */}
      <SafeAreaView style={{ position: 'absolute', zIndex: 10, width: '100%', top: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            style={{
              backgroundColor: floatBg, padding: 10, borderRadius: 20,
              borderWidth: 1, borderColor: C.border,
            }}
          >
            <Ionicons name="arrow-back" size={22} color={C.textPrimary} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={handleToggleLike}
              activeOpacity={0.85}
              style={{
                backgroundColor: floatBg, padding: 10, borderRadius: 20,
                borderWidth: 1, borderColor: isLiked ? C.amberDeep : C.border,
              }}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={isLiked ? C.amberDeep : C.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/cart')}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
                backgroundColor: '#C17B1A',
                shadowColor: '#C17B1A', shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.45, shadowRadius: 8, elevation: 6,
              }}
            >
              <Ionicons name="cart" size={16} color="#FFF8E8" />
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 13, color: '#FFF8E8' }}>
                {cartCount}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* ── Hero image ── */}
        <View style={{ height: 300, position: 'relative' }}>
          <HoneyImage uri={headerImage} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          <LinearGradient
            colors={['transparent', C.bg]}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 28 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {shop.fulfillmentMethods.map((m) => (
                <View key={m} style={{
                  backgroundColor: isDark ? 'rgba(193,123,26,0.85)' : '#FFF0C0',
                  paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
                  borderWidth: 1, borderColor: isDark ? 'rgba(244,202,68,0.5)' : '#E8C97A',
                }}>
                  <Text style={{
                    fontFamily: 'DMSans_700Bold', fontSize: 9,
                    letterSpacing: 1.5, textTransform: 'uppercase',
                    color: isDark ? '#FFF8E8' : '#7A4508',
                  }}>
                    {m}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={{
              fontFamily: 'PlayfairDisplay_700Bold',
              fontSize: 30,
              color: isDark ? '#FFF8E8' : C.textPrimary,
              lineHeight: 36
            }}>
              {shop.storeName || shop.ownerName}
            </Text>
            <Text style={{
              fontFamily: 'DMSans_400Regular',
              fontSize: 13,
              color: isDark ? 'rgba(245,223,160,0.78)' : C.textSecondary,
              marginTop: 4,
            }}>
              Tended by {shop.ownerName}
            </Text>
          </View>
        </View>

        {/* ── Story ── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
          <Text style={{
            fontFamily: 'PlayfairDisplay_700BoldItalic',
            fontSize: 16, color: C.textSecondary, lineHeight: 26,
          }}>
            "{shop.story}"
          </Text>
        </View>

        {/* ── Products ── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: C.textPrimary, marginBottom: 16 }}>
            Fresh Harvest
          </Text>

          {shop.inventory.map((item, index) => {
            const productImg = item.images && item.images.length > 0 ? item.images[0] : getHoneyImage(item.id, item.name);
            return (
              <MotiView
                key={item.id}
                from={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 100 }}
                style={{ marginBottom: 16, borderRadius: 24, overflow: 'hidden', height: 180 }}
              >
                <HoneyImage uri={productImg} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(26,13,2,0.88)']}
                  style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />

                <View style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16,
                  flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
                }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <View style={{
                      backgroundColor: 'rgba(193,123,26,0.7)', alignSelf: 'flex-start',
                      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginBottom: 6,
                      borderWidth: 1, borderColor: 'rgba(244,202,68,0.4)',
                    }}>
                      <Text style={{
                        fontFamily: 'DMSans_700Bold', fontSize: 9,
                        letterSpacing: 1.2, textTransform: 'uppercase', color: '#FFF8E8',
                      }}>
                        {item.batchType}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: '#FFF8E8' }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 16, color: '#F4CA44', marginTop: 2 }}>
                      ${(item.price / 100).toFixed(2)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleAddToCart(item)}
                    activeOpacity={0.85}
                    style={{
                      width: 48, height: 48, borderRadius: 24,
                      backgroundColor: '#F4CA44',
                      alignItems: 'center', justifyContent: 'center',
                      shadowColor: '#F4CA44', shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.55, shadowRadius: 10, elevation: 8,
                    }}
                  >
                    <Ionicons name="add" size={28} color="#2B1800" />
                  </TouchableOpacity>
                </View>
              </MotiView>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
