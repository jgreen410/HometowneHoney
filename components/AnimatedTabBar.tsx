import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const ACTIVE = '#D9AA18';
const INACTIVE = '#9ca3af';

type IconRenderer = (color: string, focused: boolean) => React.ReactNode;

interface TabConfig {
  name: string;
  label: string;
  icon: IconRenderer;
  center?: boolean;
}

// The 5 visible tabs, in display order. Hidden routes (href: null) are ignored.
const TABS: TabConfig[] = [
  {
    name: 'faves',
    label: 'My Hives',
    icon: (color) => <MaterialCommunityIcons name="hexagon-multiple-outline" size={26} color={color} />,
  },
  {
    name: 'cart',
    label: 'Cart',
    icon: (color, focused) => <Ionicons name={focused ? 'cart' : 'cart-outline'} size={26} color={color} />,
  },
  {
    name: 'index',
    label: 'Discover',
    center: true,
    icon: () => <Ionicons name="search" size={30} color="white" />,
  },
  {
    name: 'seller-dashboard',
    label: 'My Batch',
    icon: (color) => <MaterialCommunityIcons name="beehive-outline" size={26} color={color} />,
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: (color) => <MaterialCommunityIcons name="bee" size={28} color={color} />,
  },
];

export function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index]?.name;

  const handlePress = (name: string, isFocused: boolean) => {
    Haptics.selectionAsync();
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes.find((r) => r.name === name)?.key ?? '',
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(name);
    }
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFFBEC']}
      style={{
        flexDirection: 'row',
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F4E4B8',
        // soft shadow above the bar
        shadowColor: '#D9AA18',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {TABS.map((tab) => {
        const isFocused = activeRouteName === tab.name;

        if (tab.center) {
          return (
            <View key={tab.name} className="flex-1 items-center">
              <Pressable onPress={() => handlePress(tab.name, isFocused)}>
                <MotiView
                  // gentle continuous pulse to draw the eye
                  from={{ scale: 1 }}
                  animate={{ scale: isFocused ? 1.06 : 1 }}
                  transition={{
                    type: 'timing',
                    duration: 1400,
                    loop: true,
                  }}
                  style={{
                    top: Platform.OS === 'ios' ? -18 : -22,
                    width: 62,
                    height: 62,
                    borderRadius: 31,
                    backgroundColor: ACTIVE,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: ACTIVE,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.45,
                    shadowRadius: 8,
                    elevation: 8,
                    borderWidth: 4,
                    borderColor: 'white',
                  }}
                >
                  {tab.icon('white', isFocused)}
                </MotiView>
              </Pressable>
            </View>
          );
        }

        const color = isFocused ? ACTIVE : INACTIVE;
        return (
          <Pressable
            key={tab.name}
            onPress={() => handlePress(tab.name, isFocused)}
            className="flex-1 items-center justify-center"
          >
            {/* bounce + lift on focus */}
            <MotiView
              animate={{
                scale: isFocused ? 1.15 : 1,
                translateY: isFocused ? -2 : 0,
              }}
              transition={{ type: 'spring', damping: 12, stiffness: 220 }}
            >
              {tab.icon(color, isFocused)}
            </MotiView>

            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                marginTop: 3,
                color,
              }}
            >
              {tab.label}
            </Text>

            {/* animated active indicator dot */}
            <MotiView
              animate={{ opacity: isFocused ? 1 : 0, scale: isFocused ? 1 : 0.3 }}
              transition={{ type: 'timing', duration: 200 }}
              style={{
                marginTop: 3,
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: ACTIVE,
              }}
            />
          </Pressable>
        );
      })}
    </LinearGradient>
  );
}
