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
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../src/store/authStore';
import { isSupabaseConfigured } from '../src/services/supabase';

type Tab = 'login' | 'signup';

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const enterDemo = useAuthStore((s) => s.enterDemo);

  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [asSeller, setAsSeller] = useState(false);
  const [busy, setBusy] = useState(false);

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
          Alert.alert(
            'Almost there',
            'Check your email to confirm your account, then come back and log in.'
          );
        }
      }
    } catch (e: any) {
      Alert.alert('Something went wrong', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDemo = async (role: 'buyer' | 'seller') => {
    await enterDemo(role);
  };

  return (
    <SafeAreaView className="flex-1 bg-honey-400">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Branding */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-white/40 items-center justify-center mb-3 border-4 border-white/60">
              <Text style={{ fontSize: 48 }}>🐝</Text>
            </View>
            <Text className="text-3xl font-extrabold text-earth-900">Hometowne Honey</Text>
            <Text className="text-earth-900/70 font-semibold mt-1">
              Raw, local, straight from the hive
            </Text>
          </View>

          {/* Card */}
          <View className="bg-white rounded-3xl p-6 shadow-xl">
            {/* Tabs */}
            <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
              {(['login', 'signup'] as Tab[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTab(t)}
                  className={`flex-1 py-2.5 rounded-lg items-center ${
                    tab === t ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Text className={`font-bold ${tab === t ? 'text-earth-900' : 'text-gray-400'}`}>
                    {t === 'login' ? 'Log In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {!isSupabaseConfigured && (
              <View className="bg-honey-50 border border-honey-100 rounded-xl p-3 mb-4">
                <Text className="text-honey-900 text-xs font-semibold">
                  Backend not configured yet — use a Demo below to explore.
                </Text>
              </View>
            )}

            <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Email</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-base text-black mb-4"
              placeholder="you@example.com"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Password</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-base text-black mb-4"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {tab === 'signup' && (
              <TouchableOpacity
                onPress={() => setAsSeller((v) => !v)}
                className="flex-row items-center mb-5"
              >
                <View
                  className={`h-6 w-6 rounded-md border-2 items-center justify-center mr-3 ${
                    asSeller ? 'bg-honey-400 border-honey-400' : 'border-gray-300'
                  }`}
                >
                  {asSeller && <Ionicons name="checkmark" size={16} color="#422F04" />}
                </View>
                <Text className="text-earth-900 font-semibold flex-1">
                  I sell honey (create a seller account)
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={busy}
              className={`py-4 rounded-2xl items-center shadow-sm ${busy ? 'bg-gray-300' : 'bg-earth-900'}`}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">
                  {tab === 'login' ? 'Log In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Demo entry points */}
          <View className="mt-8">
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-white/50" />
              <Text className="text-earth-900/70 font-bold text-xs uppercase mx-3">
                Or try the demo
              </Text>
              <View className="flex-1 h-px bg-white/50" />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => handleDemo('buyer')}
                className="flex-1 bg-white/90 py-4 rounded-2xl items-center border border-white"
              >
                <Ionicons name="basket-outline" size={22} color="#422F04" />
                <Text className="text-earth-900 font-bold mt-1">Explore as Buyer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDemo('seller')}
                className="flex-1 bg-white/90 py-4 rounded-2xl items-center border border-white"
              >
                <Ionicons name="storefront-outline" size={22} color="#422F04" />
                <Text className="text-earth-900 font-bold mt-1">Explore as Seller</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
