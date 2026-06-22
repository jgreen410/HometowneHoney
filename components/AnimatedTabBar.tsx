import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useTheme } from '../src/store/themeStore';
import { HoneyBackdrop } from './HoneyBackdrop';
import {
  TAB_ACTIVE_LIGHT, TAB_INACTIVE_LIGHT,
  TAB_ACTIVE_DARK,  TAB_INACTIVE_DARK,
  LIGHT, DARK,
} from '../src/constants/theme';

// Glowing-honey glyph color for the raised center search button.
const HONEY_GLOW = '#FFE08A';

type IconRenderer = (color: string, focused: boolean) => React.ReactNode;

interface TabConfig {
  name: string;
  label: string;
  icon: IconRenderer;
  center?: boolean;
}

const TABS: TabConfig[] = [
  {
    name: 'faves',
    label: 'My Hives',
    icon: (c) => <MaterialCommunityIcons name="hexagon-multiple-outline" size={23} color={c} />,
  },
  {
    name: 'cart',
    label: 'Cart',
    icon: (c, f) => <Ionicons name={f ? 'cart' : 'cart-outline'} size={23} color={c} />,
  },
  {
    name: 'index',
    label: 'Discover',
    center: true,
    icon: (c) => <Ionicons name="search" size={44} color={c} />,
  },
  {
    name: 'seller-dashboard',
    label: 'My Batch',
    icon: (c) => <MaterialCommunityIcons name="beehive-outline" size={21} color={c} />,
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: (c) => <MaterialCommunityIcons name="bee" size={22} color={c} />,
  },
];

// ─── Flat-top hexagon SVG path centered at origin ───────────────────────────
function hexPath(r: number, strokeW: number = 0): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${r * Math.cos(a)},${r * Math.sin(a)}`;
  });
  return `M${pts.join('L')}Z`;
}

// ─── Single hexagonal tab button (light mode) ───────────────────────────────
function HexTab({
  tab, isFocused, onPress,
}: { tab: TabConfig; isFocused: boolean; onPress: () => void }) {
  const { isDark } = useTheme();

  const r = tab.center ? 39 : 23;
  const size = r * 2 + 4;
  const d = hexPath(r);

  const activeColor = isDark ? TAB_ACTIVE_DARK : TAB_ACTIVE_LIGHT;
  const inactiveColor = isDark ? TAB_INACTIVE_DARK : TAB_INACTIVE_LIGHT;

  const fillColor = isFocused ? activeColor : 'transparent';
  const strokeColor = isFocused ? activeColor : inactiveColor;
  
  const iconColor = tab.center
    ? '#FFFFFF'
    : (isFocused ? (isDark ? '#1A0D02' : '#FFFDF8') : inactiveColor);

  return (
    <Pressable
      onPress={onPress}
      style={{ alignItems: 'center', flex: tab.center ? 1.4 : 1 }}
    >
      <MotiView
        animate={{
          scale: isFocused ? 1.08 : 1,
          translateY: tab.center ? (isFocused ? -14 : -10) : (isFocused ? -3 : 0),
        }}
        transition={{ type: 'spring', damping: 14, stiffness: 240 }}
        style={{ alignItems: 'center' }}
      >
        <Svg width={size} height={size} viewBox={`${-r - 2} ${-r - 2} ${size} ${size}`}>
          <Defs>
            <LinearGradient id={`hg_${tab.name}`} x1="0" y1="0" x2="0" y2="1">
              <Stop 
                offset="0" 
                stopColor={tab.center ? (isFocused ? '#FFE699' : '#F5C542') : (isDark ? '#F4CA44' : '#F4CA44')} 
                stopOpacity={tab.center ? '1' : (isFocused ? '1' : '0')} 
              />
              <Stop 
                offset="1" 
                stopColor={tab.center ? (isFocused ? '#C17B1A' : '#D9821E') : (isDark ? '#D9AA18' : '#C17B1A')} 
                stopOpacity={tab.center ? '1' : (isFocused ? '1' : '0')} 
              />
            </LinearGradient>
          </Defs>
          <Path
            d={d}
            fill={isFocused ? `url(#hg_${tab.name})` : (tab.center ? `url(#hg_${tab.name})` : 'transparent')}
            stroke={tab.center ? (isFocused ? (isDark ? '#F4CA44' : '#B36B15') : (isDark ? '#5C4020' : '#D9821E')) : strokeColor}
            strokeWidth={tab.center ? (isFocused ? 2 : 1.5) : (isFocused ? 0 : 1.5)}
          />
        </Svg>

        {/* Icon floats over the hex */}
        <View style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
          tab.center && { shadowColor: HONEY_GLOW, shadowOffset: { width: 0, height: 0 }, shadowOpacity: isFocused ? 0.9 : 0, shadowRadius: 8 },
        ]}>
          {tab.icon(iconColor, isFocused)}
        </View>
      </MotiView>

      {!tab.center && (
        <Text
          style={{
            fontSize: 9,
            fontFamily: 'DMSans_700Bold',
            letterSpacing: 0.5,
            marginTop: 3,
            color: isFocused ? activeColor : inactiveColor,
          }}
        >
          {tab.label.toUpperCase()}
        </Text>
      )}
    </Pressable>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark, C } = useTheme();
  const activeRoute = state.routes[state.index]?.name;

  const handlePress = (name: string, isFocused: boolean) => {
    Haptics.selectionAsync();
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes.find((r) => r.name === name)?.key ?? '',
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(name);
  };

  const pb = insets.bottom > 0 ? insets.bottom : 10;

  return (
    <View style={{
      backgroundColor: C.bg,
      paddingBottom: pb,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: C.border,
      shadowColor: isDark ? '#000000' : LIGHT.amberGold,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: isDark ? 0.3 : 0.12,
      shadowRadius: 10,
      elevation: 10,
      position: 'relative',
      overflow: 'visible',
    }}>
      <HoneyBackdrop scrimColor={C.bg} scrimOpacity={0.9} />

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 62, overflow: 'visible' }}>
        {TABS.map((tab) => {
          const isFocused = activeRoute === tab.name;
          return (
            <HexTab
              key={tab.name}
              tab={tab}
              isFocused={isFocused}
              onPress={() => handlePress(tab.name, isFocused)}
            />
          );
        })}
      </View>
    </View>
  );
}
