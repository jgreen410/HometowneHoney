import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center">
      <Text className="text-2xl font-bold text-gray-500">Favorites</Text>
      <Text className="text-gray-400 mt-2">Wishlist coming soon!</Text>
    </SafeAreaView>
  );
}
