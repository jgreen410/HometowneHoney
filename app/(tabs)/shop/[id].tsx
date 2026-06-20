import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
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
import { getHoneyImage } from '../../../src/constants/images';

export default function ShopScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const api = useApi();
  const [shop, setShop] = useState<SellerProfile | null>(null);
  const addToCartStore = useCartStore((state) => state.addItem);
  const cartCount = useCartStore((state) => state.items.length);
  const { toggleFavorite, isFavorite } = useFavesStore();
  const isLiked = shop ? isFavorite(shop.id) : false;

  useEffect(() => {
    if (id) {
      api.getSellerById(id as string).then(data => {
        setShop(data || null);
      });
    }
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

  if (!shop) return <View className="flex-1 bg-white" />;

  const headerImage = getHoneyImage(shop.id);

  return (
    <View className="flex-1 bg-white">
      {/* STICKY HEADER */}
      <SafeAreaView className="absolute z-10 w-full flex-row justify-between px-6 top-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white/90 p-2 rounded-full shadow-sm"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleToggleLike}
            className="bg-white/90 p-2 rounded-full shadow-sm"
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#ef4444" : "black"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              router.push('/cart');
            }}
            className="bg-black px-4 py-2 rounded-full shadow-sm flex-row items-center"
          >
            <Ionicons name="cart" size={16} color="white" style={{ marginRight: 4 }} />
            <Text className="text-white font-bold text-xs">{cartCount}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* HERO IMAGE */}
        <ImageBackground
          source={{ uri: headerImage }}
          className="h-72 justify-end"
          resizeMode="cover"
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <View className="p-6 pb-8">
            <View className="bg-honey-400 self-start px-2 py-1 rounded mb-2">
              <Text className="text-earth-900 font-bold uppercase tracking-widest text-[10px]">
                {shop.fulfillmentMethods.join(' / ')}
              </Text>
            </View>
            <Text className="text-3xl font-bold text-white leading-tight shadow-sm">
              {shop.storeName || shop.ownerName}
            </Text>
            <Text className="text-white/80 font-medium text-sm mt-1">
              Run by {shop.ownerName}
            </Text>
          </View>
        </ImageBackground>

        <View className="px-6 py-6">
          <Text className="text-lg text-earth-500 leading-8 mb-8 font-medium italic">
            "{shop.story}"
          </Text>

          <Text className="text-2xl font-bold text-earth-900 mb-6">Fresh Harvest</Text>

          {/* PRODUCT LIST */}
          {shop.inventory.map((item, index) => {
            const productImg = getHoneyImage(item.id);

            return (
              <MotiView
                key={item.id}
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 100 }}
                className="mb-6 h-48 rounded-3xl overflow-hidden shadow-sm"
              >
                <ImageBackground
                  source={{ uri: productImg }}
                  className="flex-1 justify-end p-4"
                  resizeMode="cover"
                >
                  <View className="absolute inset-0 bg-black/10" />
                  <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <View className="flex-row justify-between items-end">
                    <View className="flex-1 mr-4">
                      <View className="bg-white/20 self-start px-2 py-1 rounded-md mb-2 border border-white/30">
                        <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                          {item.batchType}
                        </Text>
                      </View>
                      <Text className="text-2xl font-bold text-white shadow-sm">{item.name}</Text>
                      <Text className="text-honey-400 font-bold text-lg mt-1">
                        ${(item.price / 100).toFixed(2)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleAddToCart(item)}
                      className="h-12 w-12 bg-white rounded-full items-center justify-center shadow-lg active:scale-95"
                    >
                      <Text className="text-black text-2xl font-bold pb-1">+</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </MotiView>
            );
          })}

        </View>
      </ScrollView>
    </View>
  );
}
