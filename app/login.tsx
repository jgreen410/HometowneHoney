import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { useAuthStore } from '../src/store/authStore';
import { isSupabaseConfigured } from '../src/services/supabase';
import { HoneycombBackground } from '../components/HoneycombBackground';
import { VideoBackground } from '../components/VideoBackground';
import { LogoMark } from '../components/Logo';

type Tab = 'login' | 'signup';

// The login lives in its own warm "over the hive at dusk" world, so its palette is
// fixed (cream on a darkened video) regardless of the app's light/dark setting.
const CREAM = '#FFF8E8';
const INK = '#2B1800';
const FIELD_BG = '#FFF0C0';
const FIELD_BORDER = '#E8C97A';

export default function LoginScreen() {
  const signIn    = useAuthStore((s) => s.signIn);
  const signUp    = useAuthStore((s) => s.signUp);
  const enterDemo = useAuthStore((s) => s.enterDemo);

  const [tab, setTab]           = useState<Tab>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [asSeller, setAsSeller] = useState(false);
  const [busy, setBusy]         = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Hold on', 'Enter your email and password.');
      return;
    }
    Keyboard.dismiss();
    setBusy(true);
    try {
      if (tab === 'login') {
        await signIn(email.trim(), password);
      } else {
        const ok = await signUp(email.trim(), password, asSeller);
        if (!ok) {
          Alert.alert('Almost there', 'Check your email to confirm, then log in.');
        }
      }
    } catch (e: any) {
      Alert.alert('Something went wrong', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1A0D02' }}>
      {/* Cross-dissolving honey video motif */}
      <VideoBackground />

      {/* Warm scrim so the cream UI stays legible over moving footage */}
      <LinearGradient
        colors={['rgba(26,13,2,0.45)', 'rgba(26,13,2,0.62)', 'rgba(26,13,2,0.86)']}
        locations={[0, 0.5, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Faint honeycomb etch over the scrim — always the bright-amber (dark) variant */}
      <HoneycombBackground opacity={0.06} forceDark />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Branding ── */}
            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 600 }}
              style={{ alignItems: 'center', marginBottom: 24 }}
            >
              <View style={{
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
              }}>
                <LogoMark size={84} />
              </View>
              <Text style={{
                fontFamily: 'PlayfairDisplay_900Black',
                color: CREAM, letterSpacing: 2,
              }}>
                <Text style={{ fontSize: 48 }}>H</Text>
                <Text style={{ fontSize: 41 }}>OMETOWNE</Text>
              </Text>
              <Text style={{
                fontFamily: 'DMSans_700Bold', fontSize: 11,
                color: 'rgba(255,248,232,0.78)',
                letterSpacing: 7, textTransform: 'uppercase', marginTop: 3,
              }}>
                Honey
              </Text>
              <Text style={{
                fontFamily: 'PlayfairDisplay_700BoldItalic', fontSize: 15,
                color: 'rgba(255,248,232,0.7)', marginTop: 10,
              }}>
                Raw, local, straight from the hive
              </Text>
            </MotiView>

            {/* ── Auth card ── */}
            <MotiView
              from={{ opacity: 0, translateY: 24 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 600, delay: 120 }}
              style={{
                backgroundColor: 'rgba(255, 248, 232, 0.60)',
                borderRadius: 24, padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.35, shadowRadius: 28, elevation: 16,
                borderWidth: 1, borderColor: FIELD_BORDER,
              }}
            >
              {/* Tab switcher */}
              <View style={{
                flexDirection: 'row', backgroundColor: FIELD_BG,
                borderRadius: 16, padding: 4, marginBottom: 16,
              }}>
                {(['login', 'signup'] as Tab[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTab(t)}
                    activeOpacity={0.9}
                    style={{
                      flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center',
                      backgroundColor: tab === t ? CREAM : 'transparent',
                      shadowColor: tab === t ? '#C17B1A' : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.18, shadowRadius: 5, elevation: tab === t ? 2 : 0,
                    }}
                  >
                    <Text style={{
                      fontFamily: 'DMSans_700Bold', fontSize: 14,
                      color: tab === t ? INK : '#B88830',
                    }}>
                      {t === 'login' ? 'Log In' : 'Sign Up'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {!isSupabaseConfigured && (
                <View style={{
                  backgroundColor: FIELD_BG, borderWidth: 1, borderColor: FIELD_BORDER,
                  borderRadius: 12, padding: 12, marginBottom: 18,
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                }}>
                  <Ionicons name="information-circle" size={16} color="#9B5E0E" />
                  <Text style={{
                    fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#7A4508', flex: 1,
                  }}>
                    Backend not configured — try a demo below to explore.
                  </Text>
                </View>
              )}

              {/* Email */}
              <FieldLabel>Email</FieldLabel>
              <TextInput
                style={inputStyle}
                placeholder="you@example.com"
                placeholderTextColor="#B88830"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              {/* Password */}
              <View style={{ height: 16 }} />
              <FieldLabel>Password</FieldLabel>
              <TextInput
                style={inputStyle}
                placeholder="••••••••"
                placeholderTextColor="#B88830"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {tab === 'signup' && (
                <TouchableOpacity
                  onPress={() => setAsSeller((v) => !v)}
                  activeOpacity={0.8}
                  style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}
                >
                  <View style={{
                    width: 24, height: 24, borderRadius: 7, borderWidth: 2,
                    borderColor: asSeller ? '#C17B1A' : '#D4A84A',
                    backgroundColor: asSeller ? '#C17B1A' : 'transparent',
                    alignItems: 'center', justifyContent: 'center', marginRight: 12,
                  }}>
                    {asSeller && <Ionicons name="checkmark" size={14} color={CREAM} />}
                  </View>
                  <Text style={{
                    fontFamily: 'DMSans_500Medium', fontSize: 14, color: INK, flex: 1,
                  }}>
                    I sell honey (create a seller account)
                  </Text>
                </TouchableOpacity>
              )}

              {/* Primary CTA */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={busy}
                activeOpacity={0.88}
                style={{ marginTop: 22 }}
              >
                <LinearGradient
                  colors={busy ? ['#D4A84A', '#B88830'] : ['#F4CA44', '#C17B1A']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 16, paddingVertical: 17, alignItems: 'center',
                    shadowColor: '#C17B1A',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.5, shadowRadius: 14, elevation: 8,
                  }}
                >
                  {busy ? (
                    <ActivityIndicator color={INK} />
                  ) : (
                    <Text style={{
                      fontFamily: 'DMSans_700Bold', fontSize: 16, color: INK, letterSpacing: 0.3,
                    }}>
                      {tab === 'login' ? 'Log In' : 'Create Account'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </MotiView>

            {/* ── Demo entry points ── */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 600, delay: 260 }}
              style={{ marginTop: 24 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,248,232,0.3)' }} />
                <Text style={{
                  fontFamily: 'DMSans_700Bold', fontSize: 10,
                  color: 'rgba(255,248,232,0.7)',
                  letterSpacing: 2, textTransform: 'uppercase', marginHorizontal: 12,
                }}>
                  Or try the demo
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,248,232,0.3)' }} />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                {[
                  { role: 'buyer' as const, icon: 'basket-outline', label: 'Explore as Buyer' },
                  { role: 'seller' as const, icon: 'storefront-outline', label: 'Explore as Seller' },
                ].map(({ role, icon, label }) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => enterDemo(role)}
                    activeOpacity={0.85}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255,248,232,0.14)',
                      borderWidth: 1.5, borderColor: 'rgba(255,248,232,0.4)',
                      borderRadius: 18, paddingVertical: 16, alignItems: 'center',
                    }}
                  >
                    <Ionicons name={icon as any} size={22} color={CREAM} />
                    <Text style={{
                      fontFamily: 'DMSans_700Bold', fontSize: 12, color: CREAM, marginTop: 6,
                    }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </MotiView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{
      fontFamily: 'DMSans_700Bold', fontSize: 10, letterSpacing: 1.5,
      textTransform: 'uppercase', color: '#B88830', marginBottom: 6,
    }}>
      {children}
    </Text>
  );
}

const inputStyle = {
  backgroundColor: FIELD_BG,
  borderWidth: 1,
  borderColor: FIELD_BORDER,
  borderRadius: 14,
  padding: 14,
  fontFamily: 'DMSans_400Regular',
  fontSize: 16,
  color: INK,
} as const;
