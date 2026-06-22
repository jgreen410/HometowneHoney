import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Keyboard, LayoutAnimation, Platform, UIManager } from 'react-native';
import { HoneyImage } from '../../components/HoneyImage';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// react-native-maps is not available on web - imported conditionally below only when needed

import { useApi } from '../../src/services/api';
import { MapPin } from '../../src/types/schema';
import { useAuthStore } from '../../src/store/authStore';
import { useSettingsStore, RADIUS_PRESETS } from '../../src/store/settingsStore';
import { useTheme } from '../../src/store/themeStore';
import { LIGHT } from '../../src/constants/theme';
import { regionForRadius } from '../../src/utils/geo';
import { getHoneyImage } from '../../src/constants/images';
import { HoneycombBackground } from '../../components/HoneycombBackground';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const api = useApi();
  const mapRef = useRef<any>(null);
  const profile = useAuthStore(state => state.profile);
  const userZip = profile?.defaultZip ?? '';
  const discoveryRadiusMiles = useSettingsStore(s => s.discoveryRadiusMiles);
  const setDiscoveryRadius = useSettingsStore(s => s.setDiscoveryRadius);
  const { isDark, C } = useTheme();

  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [viewMode, setViewMode] = useState<'collapsed' | 'half'>('half');
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const centerRef = useRef<{ lat: number; lng: number }>({ lat: 39.8283, lng: -98.5795 });
  const hasCenteredRef = useRef(false);

  const INITIAL_REGION = {
    latitude: 39.8283, longitude: -98.5795,
    latitudeDelta: 40, longitudeDelta: 40,
  };

  const fetchHivesInView = async (region: any) => {
    setLoading(true);
    setIsFallbackMode(false);
    const box = {
      minLat: region.latitude - region.latitudeDelta / 2,
      maxLat: region.latitude + region.latitudeDelta / 2,
      minLng: region.longitude - region.longitudeDelta / 2,
      maxLng: region.longitude + region.longitudeDelta / 2,
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
    searchTimeout.current = setTimeout(() => fetchHivesInView(region), 600);
  };

  const geocodeLocation = async (query: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=us&limit=1`,
        { headers: { 'User-Agent': 'HometownHoneyApp/1.0' } }
      );
      const data = await res.json();
      if (data?.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch { /* ignore */ }
    return null;
  };

  const handleSearch = async (query: string) => {
    if (query.length <= 2) return;
    const location = await geocodeLocation(query);
    if (location) {
      Keyboard.dismiss();
      if (Platform.OS === 'web') {
        await fetchHivesInView({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.4,
          longitudeDelta: 0.4,
        });
      } else {
        mapRef.current?.animateToRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.4,
          longitudeDelta: 0.4,
        }, 1000);
      }
    }
  };

  const centerOnUser = async (opts: { fallbackZip?: boolean } = {}) => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = pos.coords;
        userLocationRef.current = { lat: latitude, lng: longitude };
        const radius = useSettingsStore.getState().discoveryRadiusMiles;
        if (Platform.OS === 'web') {
          await fetchHivesInView({
            latitude,
            longitude,
            latitudeDelta: 0.4,
            longitudeDelta: 0.4,
          });
        } else {
          mapRef.current?.animateToRegion(regionForRadius(latitude, longitude, radius), 800);
        }
        return;
      }
    } catch { /* fall through */ }
    finally { setLocating(false); }
    if (opts.fallbackZip && userZip?.length === 5) await handleSearch(userZip);
  };

  useEffect(() => {
    if (hasCenteredRef.current) return;

    // If on Mobile and map is not ready yet, wait for the map to be ready
    if (Platform.OS !== 'web' && !mapReady) return;

    const runInitialization = async () => {
      setLocating(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const { latitude, longitude } = pos.coords;
          userLocationRef.current = { lat: latitude, lng: longitude };
          const radius = useSettingsStore.getState().discoveryRadiusMiles;
          
          hasCenteredRef.current = true;
          if (Platform.OS === 'web') {
            await fetchHivesInView({
              latitude,
              longitude,
              latitudeDelta: 0.4,
              longitudeDelta: 0.4,
            });
          } else {
            mapRef.current?.animateToRegion(regionForRadius(latitude, longitude, radius), 800);
          }
          return;
        }
      } catch { /* fall through */ }
      finally {
        setLocating(false);
      }

      // If profile is not loaded yet, wait for it
      if (!profile) return;

      // GPS location is not available. Try fallback zip.
      if (userZip?.length === 5) {
        hasCenteredRef.current = true;
        await handleSearch(userZip);
      } else {
        // If zip is not available (either empty or fully loaded as empty), and we are on Web, load default center
        hasCenteredRef.current = true;
        if (Platform.OS === 'web') {
          await fetchHivesInView({
            latitude: INITIAL_REGION.latitude,
            longitude: INITIAL_REGION.longitude,
            latitudeDelta: INITIAL_REGION.latitudeDelta,
            longitudeDelta: INITIAL_REGION.longitudeDelta,
          });
        }
      }
    };

    runInitialization();
  }, [profile, userZip, mapReady]);

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
      const t = setTimeout(() => handleSearch(searchQuery), 800);
      return () => clearTimeout(t);
    }
  }, [searchQuery]);

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
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Map area */}
      <View style={{
        width: '100%',
        height: Platform.OS === 'web' ? '100%' : (viewMode === 'collapsed' ? '85%' : '42%'),
        backgroundColor: '#D4A84A',
      }}>
        {Platform.OS === 'web' ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 16, color: C.textPrimary }}>Map view unavailable on web</Text>
          </View>
        ) : (
          <NativeMapView ref={mapRef} pins={pins} onRegionChangeComplete={onRegionChangeComplete} initialRegion={INITIAL_REGION} handlePress={handlePress} onMapReady={() => setMapReady(true)} />
        )}

        {loading && (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={{
              position: 'absolute', bottom: 16, alignSelf: 'center',
              backgroundColor: C.surface,
              paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
              shadowColor: '#C17B1A', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
              borderWidth: 1, borderColor: C.border,
            }}
          >
            <Text style={{
              fontFamily: 'DMSans_700Bold', fontSize: 10, letterSpacing: 2,
              textTransform: 'uppercase', color: C.amberDeep,
            }}>
              Scanning the hive…
            </Text>
          </MotiView>
        )}

        {/* Radius pill */}
        <TouchableOpacity
          onPress={cycleRadius}
          activeOpacity={0.85}
          style={{
            position: 'absolute', top: 52, right: 12,
            backgroundColor: isDark ? 'rgba(44,26,6,0.95)' : 'rgba(255,248,232,0.95)',
            paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
            flexDirection: 'row', alignItems: 'center',
            shadowColor: '#C17B1A', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
            borderWidth: 1, borderColor: C.border,
          }}
        >
          <Ionicons name="resize-outline" size={14} color={C.amberDeep} style={{ marginRight: 4 }} />
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 12, color: C.amberDeep }}>
            {discoveryRadiusMiles} mi
          </Text>
        </TouchableOpacity>

        {/* Locate button */}
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); centerOnUser(); }}
          disabled={locating}
          activeOpacity={0.85}
          style={{
            position: 'absolute', bottom: 40, right: 12,
            backgroundColor: C.surface,
            width: 48, height: 48, borderRadius: 24,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#C17B1A', shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
            borderWidth: 1, borderColor: C.border,
          }}
        >
          <Ionicons
            name={locating ? 'locate-outline' : 'locate'}
            size={22}
            color={locating ? C.placeholder : C.amberDeep}
          />
        </TouchableOpacity>
      </View>

      {/* List panel */}
      <View style={{
        flex: 1,
        backgroundColor: C.surface,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        marginTop: -24,
        shadowColor: '#2B1800', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
        overflow: 'hidden',
      }}>
        <HoneycombBackground opacity={0.04} />

        {/* Pull handle + toggle */}
        <TouchableOpacity
          onPress={toggleViewMode}
          activeOpacity={0.85}
          style={{
            alignItems: 'center', paddingTop: 10, paddingBottom: 8,
            borderBottomWidth: 1, borderBottomColor: C.divider,
          }}
        >
          <View style={{
            width: 40, height: 4, borderRadius: 2,
            backgroundColor: isDark ? C.border : C.placeholder, marginBottom: 4,
          }} />
          <Text style={{
            fontFamily: 'DMSans_700Bold', fontSize: 9, letterSpacing: 1.5,
            textTransform: 'uppercase', color: C.textMuted,
          }}>
            {viewMode === 'half' ? 'Expand map' : 'See list'}
          </Text>
        </TouchableOpacity>

        {/* Header + search */}
        <View style={{
          paddingHorizontal: 24, paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: C.divider,
        }}>
          <Text style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 28, color: C.textPrimary, marginBottom: 10,
          }}>
            {isFallbackMode ? 'Nearby Hives' : 'Local Hives'}
          </Text>

          <View style={{
            backgroundColor: C.surfaceAlt,
            flexDirection: 'row', alignItems: 'center',
            borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10,
            borderWidth: 1, borderColor: C.border,
          }}>
            <Ionicons name="search" size={18} color={C.amberDeep} style={{ marginRight: 8 }} />
            <TextInput
              style={{ flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 15, color: C.textPrimary }}
              placeholder="Search ZIP or City…"
              placeholderTextColor={C.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={C.placeholder} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={pins}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          renderItem={({ item, index }) => {
            const thumb = getHoneyImage(item.id, item.businessName);

            const cardBg = isDark
              ? (item.isClaimed ? LIGHT.surface : LIGHT.surfaceAlt)
              : (item.isClaimed ? C.surface : C.surfaceAlt);

            const cardBorderColor = isDark
              ? (item.isClaimed ? LIGHT.border : LIGHT.divider)
              : (item.isClaimed ? C.border : C.divider);

            const cardTitleColor = isDark ? LIGHT.textPrimary : C.textPrimary;
            const cardMutedColor = isDark ? LIGHT.textSecondary : C.textMuted;

            const badgeBg = isDark
              ? (item.isClaimed ? LIGHT.amberSoft : LIGHT.surface)
              : (item.isClaimed ? C.amberSoft : C.surface);

            const badgeIconColor = isDark
              ? (item.isClaimed ? LIGHT.amberDeep : LIGHT.placeholder)
              : (item.isClaimed ? C.amberDeep : C.placeholder);

            const thumbBorderColor = isDark ? LIGHT.border : C.border;

            return (
              <MotiView
                from={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 60 }}
              >
                <TouchableOpacity
                  onPress={() => handlePress(item)}
                  activeOpacity={0.88}
                  style={{
                    marginBottom: 12, padding: 12, borderRadius: 20,
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: cardBg,
                    borderWidth: 1,
                    borderColor: cardBorderColor,
                    borderStyle: item.isClaimed ? 'solid' : 'dashed',
                    shadowColor: '#C17B1A', shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: item.isClaimed ? (isDark ? 0.22 : 0.12) : 0,
                    shadowRadius: 6, elevation: item.isClaimed ? 3 : 0,
                  }}
                >
                  <View style={{
                    height: 64, width: 64, borderRadius: 14,
                    overflow: 'hidden', marginRight: 14,
                    borderWidth: 1, borderColor: thumbBorderColor,
                  }}>
                    <HoneyImage uri={thumb} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontFamily: 'PlayfairDisplay_700Bold',
                      fontSize: 17, color: cardTitleColor,
                    }}>
                      {item.businessName}
                    </Text>
                    <Text style={{
                      fontFamily: 'DMSans_400Regular',
                      fontSize: 12, color: cardMutedColor, marginTop: 3, letterSpacing: 0.3,
                    }}>
                      {item.zipCode} · {isFallbackMode ? 'Nearby' : (item.isClaimed ? 'Verified' : 'Directory')}
                    </Text>
                  </View>

                  <View style={{
                    width: 38, height: 38, borderRadius: 19,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: badgeBg,
                  }}>
                    {item.isClaimed
                      ? <MaterialCommunityIcons name="basket" size={20} color={badgeIconColor} />
                      : <Ionicons name="help" size={20} color={badgeIconColor} />
                    }
                  </View>
                </TouchableOpacity>
              </MotiView>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 48 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🐝</Text>
              <Text style={{
                fontFamily: 'PlayfairDisplay_700Bold',
                fontSize: 18, color: C.textPrimary, marginBottom: 4,
              }}>
                No hives in sight
              </Text>
              <Text style={{
                fontFamily: 'DMSans_400Regular',
                fontSize: 13, color: C.textMuted, textAlign: 'center',
              }}>
                Pan the map to scout a new patch of clover
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

// Separate native component to avoid importing react-native-maps on web
const NativeMapView = React.forwardRef<any, any>(
  ({ pins, onRegionChangeComplete, initialRegion, handlePress, onMapReady }, ref) => {
    try {
      const RNMaps = require('react-native-maps');
      const MapView = RNMaps.default;
      const Marker = RNMaps.Marker;
      const PROVIDER_DEFAULT = RNMaps.PROVIDER_DEFAULT;

      return (
        <MapView
          ref={ref}
          style={{ width: '100%', height: '100%' }}
          initialRegion={initialRegion}
          provider={PROVIDER_DEFAULT}
          showsUserLocation
          onRegionChangeComplete={onRegionChangeComplete}
          onMapReady={onMapReady}
        >
          {pins.map((pin: MapPin) => (
            <Marker
              key={pin.id}
              coordinate={{ latitude: pin.lat ?? 0, longitude: pin.lng ?? 0 }}
              title={pin.businessName}
              onPress={() => handlePress(pin)}
            >
              <View style={{
                alignItems: 'center', justifyContent: 'center',
                height: 40, width: 40, borderRadius: 20,
                borderWidth: 2, borderColor: '#FFF8E8',
                backgroundColor: pin.isClaimed ? '#C17B1A' : '#7A5930',
                shadowColor: '#2B1800',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4, shadowRadius: 4, elevation: 4,
              }}>
                <Text style={{ fontSize: 18 }}>{pin.isClaimed ? '🐝' : '❔'}</Text>
              </View>
              <View style={{ alignItems: 'center', marginTop: -1 }}>
                <View style={{
                  width: 0, height: 0,
                  borderLeftWidth: 5, borderLeftColor: 'transparent',
                  borderRightWidth: 5, borderRightColor: 'transparent',
                  borderTopWidth: 6,
                  borderTopColor: pin.isClaimed ? '#C17B1A' : '#7A5930',
                }} />
              </View>
            </Marker>
          ))}
        </MapView>
      );
    } catch (e) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'DMSans_400Regular' }}>Map unavailable</Text>
        </View>
      );
    }
  }
);
