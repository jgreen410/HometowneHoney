import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, Keyboard,
} from 'react-native';
import { HoneyImage } from '../../components/HoneyImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/store/themeStore';
import { getHoneyImage } from '../../src/constants/images';
import { HoneycombBackground } from '../../components/HoneycombBackground';

export default function ProfileScreen() {
  const profile = useAuthStore((s) => s.profile);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const signOut = useAuthStore((s) => s.signOut);
  const exitDemo = useAuthStore((s) => s.exitDemo);
  const isDemo = useAuthStore((s) => s.isDemo());
  const profileImage = getHoneyImage('user-profile-seed-123');

  const { isDark, C, toggle } = useTheme();

  const [tempName, setTempName] = useState(profile?.name ?? '');
  const [tempZip, setTempZip] = useState(profile?.defaultZip ?? '');

  const handleSave = async () => {
    Keyboard.dismiss();
    try {
      await updateProfile({ name: tempName, defaultZip: tempZip });
      Alert.alert('Profile Updated', "You're all set!");
    } catch (e: any) {
      Alert.alert('Could not save', e?.message ?? 'Please try again.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      isDemo ? 'Leave demo?' : 'Log out?',
      isDemo ? 'Return to the login screen.' : 'You will need to log in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: isDemo ? 'Leave' : 'Log out', style: 'destructive', onPress: () => (isDemo ? exitDemo() : signOut()) },
      ]
    );
  };

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
            Your account
          </Text>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, color: C.textPrimary }}>
            Profile
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Avatar */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <View style={{ position: 'relative' }}>
              <View style={{
                width: 96, height: 96, borderRadius: 48, overflow: 'hidden',
                borderWidth: 3, borderColor: '#C17B1A',
                shadowColor: '#C17B1A', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
              }}>
                <HoneyImage uri={profileImage} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              </View>
              <TouchableOpacity style={{
                position: 'absolute', bottom: 0, right: 0,
                backgroundColor: '#C17B1A', padding: 8, borderRadius: 16,
                borderWidth: 2, borderColor: C.bg,
              }}>
                <Ionicons name="camera" size={14} color="#FFF8E8" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: C.textPrimary, marginTop: 14 }}>
              {tempName || 'Honey Fan'}
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.textSecondary, marginTop: 2 }}>
              Based in {tempZip || 'The World'}
            </Text>
          </View>

          {/* Fields */}
          <View style={{ gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Display Name', value: tempName, onChange: setTempName, placeholder: 'Your name' },
              { label: 'Home ZIP Code', value: tempZip, onChange: setTempZip, placeholder: '12345', keyboardType: 'number-pad' as const, maxLength: 5 },
            ].map(({ label, value, onChange, placeholder, keyboardType, maxLength }) => (
              <View key={label}>
                <Text style={{
                  fontFamily: 'DMSans_700Bold', fontSize: 10,
                  letterSpacing: 1.5, textTransform: 'uppercase',
                  color: C.textMuted, marginBottom: 6,
                }}>
                  {label}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: C.surfaceAlt,
                    borderWidth: 1, borderColor: C.border,
                    borderRadius: 14, padding: 14,
                    fontFamily: 'DMSans_400Regular', fontSize: 16, color: C.textPrimary,
                  }}
                  value={value}
                  onChangeText={onChange}
                  placeholder={placeholder}
                  placeholderTextColor={C.placeholder}
                  keyboardType={keyboardType}
                  maxLength={maxLength}
                />
              </View>
            ))}

            <TouchableOpacity onPress={handleSave} activeOpacity={0.88}>
              <LinearGradient
                colors={['#F4CA44', '#C17B1A']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 14, paddingVertical: 14, alignItems: 'center',
                  shadowColor: '#C17B1A', shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
                }}
              >
                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#2B1800' }}>
                  Save Changes
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Dark / Light mode toggle */}
          <View style={{
            backgroundColor: C.surface,
            borderRadius: 18, padding: 18, marginBottom: 16,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            borderWidth: 1, borderColor: C.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: C.amberSoft,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? '#F4CA44' : '#C17B1A'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: C.textPrimary }}>
                  {isDark ? 'Dark Hive Mode' : 'Golden Light Mode'}
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.textSecondary }}>
                  Tap to switch theme
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={toggle}
              activeOpacity={0.85}
              style={{
                width: 56, height: 32, borderRadius: 16,
                backgroundColor: isDark ? '#C17B1A' : '#FFF0C0',
                justifyContent: 'center', paddingHorizontal: 3,
                borderWidth: 1, borderColor: isDark ? '#F4CA44' : '#E8C97A',
              }}
            >
              <MotiView
                animate={{ translateX: isDark ? 24 : 0 }}
                transition={{ type: 'spring', damping: 16, stiffness: 220 }}
                style={{
                  width: 26, height: 26, borderRadius: 13,
                  backgroundColor: isDark ? '#F4CA44' : '#C17B1A',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={13} color={isDark ? '#2B1800' : '#FFF8E8'} />
              </MotiView>
            </TouchableOpacity>
          </View>

          {/* Reviews */}
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: C.textPrimary, marginBottom: 12 }}>
            My Reviews
          </Text>
          <View style={{
            backgroundColor: C.surface, padding: 16, borderRadius: 16,
            borderWidth: 1, borderColor: C.border, marginBottom: 24,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, color: C.textPrimary }}>
                Highland Hive Co.
              </Text>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <MaterialCommunityIcons key={i} name="hexagon" size={12} color="#F4CA44" />
                ))}
              </View>
            </View>
            <Text style={{ fontFamily: 'PlayfairDisplay_700BoldItalic', fontSize: 14, color: C.textSecondary, lineHeight: 21 }}>
              "Honestly the best wildflower honey I've ever tasted."
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: C.textMuted, marginTop: 8 }}>
              Oct 12, 2024
            </Text>
          </View>

          {/* Sign out */}
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.85}
            style={{
              paddingVertical: 14, borderRadius: 14, alignItems: 'center',
              borderWidth: 1, borderColor: C.border,
            }}
          >
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 14, color: C.textSecondary }}>
              {isDemo ? 'Leave Demo' : 'Log Out'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
