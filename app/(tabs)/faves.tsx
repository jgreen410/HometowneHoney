import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { HoneyImage } from '../../components/HoneyImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { useFavesStore } from '../../src/store/favesStore';
import { useTheme } from '../../src/store/themeStore';
import { getHoneyImage } from '../../src/constants/images';
import { HoneycombBackground } from '../../components/HoneycombBackground';

export default function FavesScreen() {
  const router = useRouter();
  const favorites = useFavesStore((s) => s.favorites);
  const hydrate = useFavesStore((s) => s.hydrate);
  const { C } = useTheme();

  useFocusEffect(useCallback(() => { hydrate(); }, [hydrate]));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <HoneycombBackground opacity={0.05} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16,
          borderBottomWidth: 1, borderBottomColor: C.divider,
        }}>
          <Text style={{
            fontFamily: 'DMSans_700Bold', fontSize: 10,
            letterSpacing: 2, textTransform: 'uppercase',
            color: C.textMuted, marginBottom: 4,
          }}>
            Your collection
          </Text>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, color: C.textPrimary }}>
            My Hives
          </Text>
        </View>

        {favorites.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>🐝</Text>
            <Text style={{
              fontFamily: 'PlayfairDisplay_700Bold',
              fontSize: 22, color: C.textPrimary, textAlign: 'center', marginBottom: 8,
            }}>
              No hives in your collection
            </Text>
            <Text style={{
              fontFamily: 'DMSans_400Regular',
              fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24,
            }}>
              Tap the heart on any beekeeper's page to keep their hive close.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/')}
              activeOpacity={0.88}
              style={{
                backgroundColor: C.amberDeep,
                paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20,
                shadowColor: '#C17B1A', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
              }}
            >
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 14, color: C.onAmber }}>
                Discover Local Hives
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
            renderItem={({ item, index }) => {
              const thumb = getHoneyImage(item.id, item.storeName || item.ownerName);
              return (
                <MotiView
                  from={{ opacity: 0, translateY: 12 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: index * 60 }}
                >
                  <TouchableOpacity
                    onPress={() => router.push(`/shop/${item.id}`)}
                    activeOpacity={0.88}
                    style={{
                      marginBottom: 12,
                      backgroundColor: C.surface,
                      borderRadius: 20, padding: 12,
                      flexDirection: 'row', alignItems: 'center',
                      borderWidth: 1, borderColor: C.border,
                      shadowColor: '#C17B1A', shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
                    }}
                  >
                    <View style={{
                      width: 64, height: 64, borderRadius: 14,
                      overflow: 'hidden', marginRight: 14,
                      borderWidth: 1, borderColor: C.border,
                    }}>
                      <HoneyImage uri={thumb} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: C.textPrimary }}>
                        {item.storeName || item.ownerName}
                      </Text>
                      <Text style={{
                        fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.textSecondary, marginTop: 4,
                      }}>
                        {item.fulfillmentMethods.join(' · ')}
                      </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={C.placeholder} />
                  </TouchableOpacity>
                </MotiView>
              );
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
