import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { getHoneyImage } from '../../src/constants/images';

export default function ProfileScreen() {
  const profile = useAuthStore((s) => s.profile);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const signOut = useAuthStore((s) => s.signOut);
  const exitDemo = useAuthStore((s) => s.exitDemo);
  const isDemo = useAuthStore((s) => s.isDemo());
  const profileImage = getHoneyImage("user-profile-seed-123");

  const [tempName, setTempName] = useState(profile?.name ?? '');
  const [tempZip, setTempZip] = useState(profile?.defaultZip ?? '');

  const handleSave = async () => {
    Keyboard.dismiss();
    try {
      await updateProfile({ name: tempName, defaultZip: tempZip });
      Alert.alert("Profile Updated", "You're all set!", [{ text: 'OK' }]);
    } catch (e: any) {
      Alert.alert("Could not save", e?.message ?? "Please try again.");
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      isDemo ? 'Leave demo?' : 'Log out?',
      isDemo ? 'Return to the login screen.' : 'You will need to log in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isDemo ? 'Leave' : 'Log out',
          style: 'destructive',
          onPress: () => (isDemo ? exitDemo() : signOut()),
        },
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <View className="items-center mb-8">
            <View className="relative">
              <View className="w-28 h-28 bg-gray-200 rounded-full border-4 border-white shadow-lg items-center justify-center overflow-hidden">
                <Image source={{ uri: profileImage }} className="w-full h-full" />
              </View>
              <TouchableOpacity className="absolute bottom-0 right-0 bg-honey-400 p-2 rounded-full border-2 border-white shadow-sm">
                <Ionicons name="camera" size={16} color="black" />
              </TouchableOpacity>
            </View>
            <Text className="text-2xl font-bold text-earth-900 mt-4">
              {tempName || 'Honey Fan'}
            </Text>
            <Text className="text-gray-500">Based in {tempZip || 'The World'}</Text>
          </View>

          <View className="space-y-4 mb-8">
            <View>
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Display Name</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-black"
                value={tempName}
                onChangeText={setTempName}
              />
            </View>

            <View>
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Home Zip Code</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg text-black"
                value={tempZip}
                onChangeText={setTempZip}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>

            <TouchableOpacity onPress={handleSave} className="bg-black py-3 rounded-xl items-center mt-2">
              <Text className="text-white font-bold">Save Changes</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-xl font-bold text-earth-900 mb-4">My Reviews</Text>
            <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-3">
              <View className="flex-row justify-between mb-2">
                <Text className="font-bold text-black">Highland Hive Co.</Text>
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons key={i} name="star" size={12} color="#F4CA44" />
                  ))}
                </View>
              </View>
              <Text className="text-gray-600 text-sm leading-5">
                "Honestly the best wildflower honey I've ever tasted. The jar was sticky but worth
                it!"
              </Text>
              <Text className="text-gray-400 text-xs mt-2">Oct 12, 2024</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignOut}
            className="mt-8 py-3 rounded-xl items-center border border-gray-200"
          >
            <Text className="text-red-500 font-bold">
              {isDemo ? 'Leave Demo' : 'Log Out'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
