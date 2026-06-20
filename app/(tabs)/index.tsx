import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Keyboard, LayoutAnimation, Platform, UIManager, Image } from 'react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useApi } from '../../src/services/api';
import { MapPin } from '../../src/types/schema';
import { useAuthStore } from '../../src/store/authStore';
import { useSettingsStore, RADIUS_PRESETS } from '../../src/store/settingsStore';
import { regionForRadius } from '../../src/utils/geo';
import { getHoneyImage } from '../../src/constants/images';

// Center the map on the phone's location only once per app session, so that
// navigating away and back to Discovery doesn't snap the view around.
let hasCenteredThisSession = false;

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const api = useApi();
  const mapRef = useRef<MapView>(null);
  const userZip = useAuthStore(state => state.profile?.defaultZip ?? '');
  const discoveryRadiusMiles = useSettingsStore(s => s.discoveryRadiusMiles);
  const setDiscoveryRadius = useSettingsStore(s => s.setDiscoveryRadius);

  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locating, setLocating] = useState(false);

  const [viewMode, setViewMode] = useState<'collapsed' | 'half'>('half');
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  // Last known phone location + current map center, used when changing radius.
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const centerRef = useRef<{ lat: number; lng: number }>({ lat: 39.8283, lng: -98.5795 });

  const INITIAL_REGION = {
    latitude: 39.8283,
    longitude: -98.5795,
    latitudeDelta: 40,
    longitudeDelta: 40,
  };

  // Move the map to the phone's location at the saved radius. Falls back to the
  // user's home ZIP (if set) when location permission is unavailable.
  const centerOnUser = async (opts: { fallbackZip?: boolean } = {}) => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = pos.coords;
        userLocationRef.current = { lat: latitude, lng: longitude };
        const radius = useSettingsStore.getState().discoveryRadiusMiles;
        mapRef.current?.animateToRegion(regionForRadius(latitude, longitude, radius), 800);
        return;
      }
    } catch {
      // ignore and fall back below
    } finally {
      setLocating(false);
    }
    if (opts.fallbackZip && userZip && userZip.length === 5) {
      handleSearch(userZip);
    }
  };

  // One-time auto-center when Discovery first mounts this session.
  useEffect(() => {
    if (hasCenteredThisSession) return;
    hasCenteredThisSession = true;
    centerOnUser({ fallbackZip: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocate = () => {
    Haptics.selectionAsync();
    centerOnUser();
  };

  const cycleRadius = () => {
    Haptics.selectionAsync();
    const idx = RADIUS_PRESETS.indexOf(discoveryRadiusMiles as (typeof RADIUS_PRESETS)[number]);
    const next = RADIUS_PRESETS[(idx + 1) % RADIUS_PRESETS.length];
    setDiscoveryRadius(next);
    const c = userLocationRef.current ?? centerRef.current;
    mapRef.current?.animateToRegion(regionForRadius(c.lat, c.lng, next), 500);
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      const delaySearch = setTimeout(() => {
        handleSearch(searchQuery);
      }, 800);

      return () => clearTimeout(delaySearch);
    }
  }, [searchQuery]);

  const geocodeLocation = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=us&limit=1`,
        { headers: { 'User-Agent': 'HometownHoneyApp/1.0' } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
    } catch (error) {
      console.log("Geocoding failed:", error);
    }
    return null;
  };

  const handleSearch = async (query: string) => {
    if (query.length <= 2) return;

    const location = await geocodeLocation(query);
    if (location) {
      Keyboard.dismiss();
      mapRef.current?.animateToRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.4,
        longitudeDelta: 0.4,
      }, 1000);
    }
  };

  const fetchHivesInView = async (region: any) => {
    setLoading(true);
    setIsFallbackMode(false);

    const box = {
      minLat: region.latitude - (region.latitudeDelta / 2),
      maxLat: region.latitude + (region.latitudeDelta / 2),
      minLng: region.longitude - (region.longitudeDelta / 2),
      maxLng: region.longitude + (region.longitudeDelta / 2),
    };

    let data = await api.getMapPins(box);

    if (data.length === 0) {
      data = await api.findClosestHives(region.latitude, region.longitude);
      setIsFallbackMode(true);
    }

    setPins(data);
    setLoading(false);
  };

  const onRegionChangeComplete = (region: any) => {
    centerRef.current = { lat: region.latitude, lng: region.longitude };
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchHivesInView(region);
    }, 600);
  };

  const handlePress = (item: MapPin) => {
    Haptics.selectionAsync();
    Keyboard.dismiss();
    if (item.isClaimed && item.sellerProfile) {
      router.push(`/shop/${item.sellerProfile.id}`);
    } else {
      router.push(`/claim/${item.id}`);
    }
  };

  const toggleViewMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewMode(viewMode === 'half' ? 'collapsed' : 'half');
  };

  return (
    <View className="flex-1 bg-white">
      <View className={`w-full bg-gray-200 relative ${viewMode === 'collapsed' ? 'h-[85%]' : 'h-[40%]'}`}>
        <MapView
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
          initialRegion={INITIAL_REGION}
          provider={PROVIDER_DEFAULT}
          showsUserLocation
          onRegionChangeComplete={onRegionChangeComplete}
        >
          {pins.map((pin) => (
            <Marker
              key={pin.id}
              coordinate={{ latitude: pin.lat ?? 0, longitude: pin.lng ?? 0 }}
              title={pin.businessName}
              onPress={() => handlePress(pin)}
            >
              <View className={`items-center justify-center h-10 w-10 rounded-full border-2 shadow-sm ${
                pin.isClaimed ? 'bg-honey-400 border-white' : 'bg-gray-400 border-white'
              }`}>
                <Text style={{ fontSize: 20 }}>{pin.isClaimed ? '🐝' : '❔'}</Text>
              </View>
              <View className="items-center -mt-1">
                <View className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${
                  pin.isClaimed ? 'border-t-honey-400' : 'border-t-gray-400'
                }`} />
              </View>
            </Marker>
          ))}
        </MapView>

        {loading && (
          <View className="absolute bottom-6 self-center bg-white px-4 py-2 rounded-full shadow-lg">
            <Text className="text-xs font-bold text-honey-500 uppercase tracking-widest">Scanning...</Text>
          </View>
        )}

        {/* Adjustable radius pill — tap to cycle presets; persists across loads */}
        <TouchableOpacity
          onPress={cycleRadius}
          className="absolute top-14 right-3 bg-white/95 px-3 py-2 rounded-full shadow-md flex-row items-center"
        >
          <Ionicons name="resize-outline" size={15} color="#D9AA18" style={{ marginRight: 5 }} />
          <Text className="text-xs font-bold text-earth-900">{discoveryRadiusMiles} mi</Text>
        </TouchableOpacity>

        {/* Re-center on the phone's location */}
        <TouchableOpacity
          onPress={handleLocate}
          disabled={locating}
          className="absolute bottom-10 right-3 bg-white w-12 h-12 rounded-full shadow-md items-center justify-center"
        >
          <Ionicons
            name={locating ? 'locate-outline' : 'locate'}
            size={22}
            color={locating ? '#9ca3af' : '#D9AA18'}
          />
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-white rounded-t-3xl -mt-6 shadow-xl overflow-hidden flex-col">
        <TouchableOpacity
          onPress={toggleViewMode}
          activeOpacity={0.9}
          className="items-center pt-3 pb-2 bg-white w-full border-b border-gray-50 z-20"
        >
          <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-1" />
          <Text className="text-[10px] text-gray-400 font-bold uppercase">
            {viewMode === 'half' ? "Tap to Expand Map" : "Tap to See List"}
          </Text>
        </TouchableOpacity>

        <View className="px-6 pb-2 pt-2 bg-white z-10 shadow-sm border-b border-gray-50">
          <Text className="text-2xl font-bold text-earth-900 mb-3 mt-1">
            {isFallbackMode ? "Nearby Hives" : "Local Hives"}
          </Text>

          <View className="bg-white flex-row items-center p-3 rounded-xl border border-gray-300 shadow-sm mb-2">
            <Ionicons name="search" size={20} color="#000" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 font-semibold text-black text-base h-full"
              placeholder="Search ZIP or City..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={pins}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: 100 }}
          renderItem={({ item, index }) => {
            const thumb = getHoneyImage(item.id);

            return (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 50 }}
              >
                <TouchableOpacity
                  onPress={() => handlePress(item)}
                  className={`mb-4 p-3 rounded-2xl border flex-row items-center ${
                    item.isClaimed
                      ? 'bg-white border-honey-100 shadow-sm'
                      : 'bg-gray-50 border-gray-200 border-dashed'
                  }`}
                >
                  <View className="h-16 w-16 rounded-xl bg-gray-200 mr-4 overflow-hidden border border-gray-100">
                    <Image source={{ uri: thumb }} className="h-full w-full" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-lg font-bold text-earth-900">{item.businessName}</Text>
                    <Text className="text-xs text-earth-500 mt-1">
                      {item.zipCode} ? {isFallbackMode ? '~ Nearby' : (item.isClaimed ? 'Verified' : 'Directory')}
                    </Text>
                  </View>

                  <View className={`h-10 w-10 rounded-full items-center justify-center ${
                    item.isClaimed ? 'bg-honey-50' : 'bg-gray-200'
                  }`}>
                    {item.isClaimed ? (
                      <MaterialCommunityIcons name="basket" size={20} color="#D9AA18" />
                    ) : (
                      <Ionicons name="help" size={24} color="#9ca3af" />
                    )}
                  </View>
                </TouchableOpacity>
              </MotiView>
            );
          }}
        />
      </View>
    </View>
  );
}
