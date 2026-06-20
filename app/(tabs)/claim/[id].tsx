import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApi } from '../../../src/services/api';
import { useAuthStore } from '../../../src/store/authStore';
import { DirectoryListing } from '../../../src/types/schema';

export default function ClaimScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const api = useApi();
  const isDemo = useAuthStore((s) => s.isDemo());
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [listing, setListing] = useState<DirectoryListing | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (id) {
      api.getListingById(id as string).then(data => {
        setListing(data || null);
      });
    }
  }, [id]);

  const handleClaim = async () => {
    if (!listing) return;
    setClaiming(true);
    try {
      // TODO: Stripe Connect onboarding goes here before verifying.
      await api.claimListing(listing.id);
      await refreshProfile();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        isDemo ? 'Claimed (demo)' : 'Listing claimed!',
        'You can now manage this hive from your seller dashboard.',
        [{ text: 'Great', onPress: () => router.back() }]
      );
    } catch (e: any) {
      Alert.alert('Could not claim', e?.message ?? 'Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  if (!listing) return <View className="flex-1 bg-white justify-center"><ActivityIndicator color="#F4CA44" /></View>;

  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-between py-6">
      <View>
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Text className="text-honey-500 font-bold text-lg">← Back</Text>
        </TouchableOpacity>

        <Text className="text-earth-500 font-bold tracking-widest uppercase text-xs mb-2">
          Directory Listing
        </Text>
        <Text className="text-4xl font-bold text-earth-900 mb-2">
          {listing.businessName}
        </Text>
        <Text className="text-xl text-earth-500 mb-8">
          {listing.zipCode} • Maryland
        </Text>

        <View className="bg-gray-50 p-6 rounded-xl border-l-4 border-honey-400">
          <Text className="text-earth-900 font-semibold text-lg mb-2">
            Is this your apiary?
          </Text>
          <Text className="text-earth-500 leading-6">
            This listing was imported from public records. Claim this profile to manage inventory, set prices, and accept orders.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className={`py-5 rounded-2xl items-center shadow-lg active:scale-95 ${claiming ? 'bg-gray-300' : 'bg-black'}`}
        onPress={handleClaim}
        disabled={claiming}
      >
        {claiming ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">Claim & Verify Business</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
