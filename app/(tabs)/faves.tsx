import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavesStore } from '../../src/store/favesStore';
import { getHoneyImage } from '../../src/constants/images';

export default function FavesScreen() {
  const router = useRouter();
  const favorites = useFavesStore((s) => s.favorites);
  const hydrate = useFavesStore((s) => s.hydrate);

  // Refresh favorites from the active backend whenever this tab gains focus.
  useFocusEffect(
    useCallback(() => {
      hydrate();
    }, [hydrate])
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 border-b border-gray-100">
        <Text className="text-3xl font-bold text-earth-900">My Hives</Text>
      </View>

      {favorites.length === 0 ? (
        <View className="flex-1 justify-center items-center opacity-50">
          <Ionicons name="heart-dislike-outline" size={64} color="#9ca3af" />
          <Text className="text-gray-500 font-bold mt-4">No favorite hives yet.</Text>
          <TouchableOpacity onPress={() => router.push('/')} className="mt-4">
            <Text className="text-honey-500 font-bold">Go Discover 🐝</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          renderItem={({ item }) => {
            const thumb = getHoneyImage(item.id);
            return (
              <TouchableOpacity
                onPress={() => router.push(`/shop/${item.id}`)}
                className="mb-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex-row items-center"
              >
                <View className="h-16 w-16 rounded-xl bg-gray-200 mr-4 overflow-hidden">
                  <Image source={{ uri: thumb }} className="h-full w-full" />
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-bold text-earth-900">{item.storeName || item.ownerName}</Text>
                  <Text className="text-xs text-gray-500">{item.fulfillmentMethods.join(' ? ')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
