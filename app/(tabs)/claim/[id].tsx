import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useApi } from '../../../src/services/api';
import { useAuthStore } from '../../../src/store/authStore';
import { useTheme } from '../../../src/store/themeStore';
import { DirectoryListing } from '../../../src/types/schema';
import { HoneycombBackground } from '../../../components/HoneycombBackground';

export default function ClaimScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const api = useApi();
  const isDemo = useAuthStore((s) => s.isDemo());
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const { C } = useTheme();

  const [listing, setListing] = useState<DirectoryListing | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (id) api.getListingById(id as string).then(d => setListing(d || null));
  }, [id]);

  const handleClaim = async () => {
    if (!listing) return;
    setClaiming(true);
    try {
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

  if (!listing) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#C17B1A" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <HoneycombBackground opacity={0.05} />
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingVertical: 24 }}>
        <View>
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 32 }}
          >
            <Ionicons name="arrow-back" size={20} color={C.amberDeep} />
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 14, color: C.amberDeep }}>
              Back
            </Text>
          </TouchableOpacity>

          {/* Label */}
          <Text style={{
            fontFamily: 'DMSans_700Bold', fontSize: 10,
            letterSpacing: 2, textTransform: 'uppercase',
            color: C.textMuted, marginBottom: 8,
          }}>
            Directory Listing
          </Text>

          {/* Business name */}
          <Text style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 36, color: C.textPrimary, lineHeight: 42, marginBottom: 4,
          }}>
            {listing.businessName}
          </Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 16, color: C.textSecondary, marginBottom: 36 }}>
            {listing.zipCode} · Maryland
          </Text>

          {/* Info card */}
          <View style={{
            backgroundColor: C.surface, borderRadius: 20, padding: 20,
            borderWidth: 1, borderColor: C.border,
            borderLeftWidth: 4, borderLeftColor: '#C17B1A',
          }}>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: C.textPrimary, marginBottom: 8 }}>
              Is this your apiary?
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: C.textSecondary, lineHeight: 22 }}>
              This listing was imported from public records. Claim this profile to manage inventory, set prices, and accept orders from local honey lovers.
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={handleClaim} disabled={claiming} activeOpacity={0.88}>
          <LinearGradient
            colors={claiming ? ['#D4A84A', '#B88830'] : ['#F4CA44', '#C17B1A']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 18, paddingVertical: 18, alignItems: 'center',
              shadowColor: '#C17B1A', shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
            }}
          >
            {claiming ? (
              <ActivityIndicator color="#2B1800" />
            ) : (
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 16, color: '#2B1800' }}>
                Claim & Verify Business
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
