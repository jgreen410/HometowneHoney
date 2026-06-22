import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useApi } from '../../../src/services/api';
import { useTheme } from '../../../src/store/themeStore';
import { HoneycombBackground } from '../../../components/HoneycombBackground';

const HONEY_TYPES = ['Wildflower', 'Clover', 'Buckwheat', 'Orange Blossom'];

export default function AddProductScreen() {
  const router = useRouter();
  const api = useApi();
  const { C } = useTheme();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [batchType, setBatchType] = useState('Wildflower');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Missing Info', 'Please name your honey and set a price.');
      return;
    }
    const priceCents = parseInt(price, 10);
    if (Number.isNaN(priceCents) || priceCents <= 0) {
      Alert.alert('Invalid Price', 'Enter the price in cents, e.g. 1200 for $12.00.');
      return;
    }
    Keyboard.dismiss();
    setSaving(true);
    try {
      await api.addProduct({ name, price: priceCents, batchType });
      Alert.alert('Batch listed!', 'Your honey is now on the marketplace.', [
        { text: 'Awesome', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Could not add', e?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <HoneycombBackground opacity={0.05} />
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}>
              <View>
                {/* Header */}
                <View style={{
                  flexDirection: 'row', justifyContent: 'space-between',
                  alignItems: 'flex-end', marginBottom: 32,
                }}>
                  <View>
                    <Text style={{
                      fontFamily: 'DMSans_700Bold', fontSize: 10,
                      letterSpacing: 2, textTransform: 'uppercase',
                      color: C.textMuted, marginBottom: 4,
                    }}>
                      Seller Console
                    </Text>
                    <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, color: C.textPrimary }}>
                      New Batch
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
                    <Ionicons name="close" size={24} color={C.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Batch name */}
                <Text style={{
                  fontFamily: 'DMSans_700Bold', fontSize: 10,
                  letterSpacing: 1.5, textTransform: 'uppercase',
                  color: C.textMuted, marginBottom: 6,
                }}>
                  Batch Name
                </Text>
                <TextInput
                  style={{
                    backgroundColor: C.surfaceAlt,
                    borderWidth: 1, borderColor: C.border,
                    borderRadius: 14, padding: 14, marginBottom: 24,
                    fontFamily: 'DMSans_400Regular', fontSize: 16, color: C.textPrimary,
                  }}
                  placeholder="e.g. Early Spring Harvest"
                  placeholderTextColor={C.placeholder}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  returnKeyType="next"
                />

                {/* Price */}
                <Text style={{
                  fontFamily: 'DMSans_700Bold', fontSize: 10,
                  letterSpacing: 1.5, textTransform: 'uppercase',
                  color: C.textMuted, marginBottom: 6,
                }}>
                  Price (in cents)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: C.surfaceAlt,
                    borderWidth: 1, borderColor: C.border,
                    borderRadius: 14, padding: 14, marginBottom: 24,
                    fontFamily: 'DMSans_400Regular', fontSize: 16, color: C.textPrimary,
                  }}
                  placeholder="e.g. 1200 ($12.00)"
                  placeholderTextColor={C.placeholder}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  returnKeyType="done"
                />

                {/* Honey type */}
                <Text style={{
                  fontFamily: 'DMSans_700Bold', fontSize: 10,
                  letterSpacing: 1.5, textTransform: 'uppercase',
                  color: C.textMuted, marginBottom: 10,
                }}>
                  Honey Type
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {HONEY_TYPES.map((type) => {
                    const active = batchType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        onPress={() => { Keyboard.dismiss(); setBatchType(type); }}
                        activeOpacity={0.8}
                        style={{
                          paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                          backgroundColor: active ? '#C17B1A' : C.surfaceAlt,
                          borderWidth: 1.5,
                          borderColor: active ? '#F4CA44' : C.border,
                          shadowColor: active ? '#C17B1A' : 'transparent',
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: 0.35, shadowRadius: 6, elevation: active ? 4 : 0,
                        }}
                      >
                        <Text style={{
                          fontFamily: 'DMSans_700Bold', fontSize: 13,
                          color: active ? '#FFF8E8' : C.textSecondary,
                        }}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Launch CTA */}
              <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.88}>
                <LinearGradient
                  colors={saving ? ['#D4A84A', '#B88830'] : ['#F4CA44', '#C17B1A']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 18, paddingVertical: 18, alignItems: 'center',
                    shadowColor: '#C17B1A', shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
                  }}
                >
                  <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 16, color: '#2B1800' }}>
                    {saving ? 'Listing…' : 'Launch Batch'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}
