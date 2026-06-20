import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApi } from '../../../src/services/api';

export default function AddProductScreen() {
  const router = useRouter();
  const api = useApi();
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
      Alert.alert('Success', 'Your batch has been added to the marketplace!', [
        { text: 'Awesome', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Could not add', e?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 p-6 justify-between"
        >
          <View>
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-bold text-black">New Batch</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-gray-500 font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-6">
              <View>
                <Text className="font-bold text-gray-900 mb-2">Batch Name</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-black"
                  placeholder="e.g. Early Spring Harvest"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  returnKeyType="next"
                />
              </View>

              <View>
                <Text className="font-bold text-gray-900 mb-2">Price (in cents)</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-black"
                  placeholder="e.g. 1200 ($12.00)"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  returnKeyType="done"
                />
              </View>

              <View>
                <Text className="font-bold text-gray-900 mb-2">Honey Type</Text>
                <View className="flex-row flex-wrap gap-2">
                  {['Wildflower', 'Clover', 'Buckwheat', 'Orange Blossom'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => {
                        Keyboard.dismiss();
                        setBatchType(type);
                      }}
                      className={`px-4 py-2 rounded-full border ${
                        batchType === type
                          ? 'bg-black border-black'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text className={`font-bold ${
                        batchType === type ? 'text-white' : 'text-gray-600'
                      }`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View className="pt-6">
            <TouchableOpacity
              className={`py-5 rounded-2xl items-center shadow-lg active:scale-95 ${saving ? 'bg-gray-300' : 'bg-black'}`}
              onPress={handleSave}
              disabled={saving}
            >
              <Text className="text-white font-bold text-lg">
                {saving ? 'Launching…' : 'Launch Product'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
