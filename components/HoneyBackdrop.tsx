import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';

// Honey footage that fills the nav bar behind the tab buttons.
// Drop the final clip in at this path (replacing the placeholder) — no code
// change needed. mp4 is in Expo's default assetExts, so require() bundles it.
const HONEY = require('../assets/videos/honey-drip.mp4');

interface Props {
  /** The milky veil colour laid over the honey (usually the bar background). */
  scrimColor: string;
  /** Veil strength over the whole bar (0–1). Higher = milkier, honey more subtle. */
  scrimOpacity?: number;
}

/**
 * Full-bleed, looping, muted honey video that sits *behind* the tab buttons as
 * the nav bar's living background. A "milky cloud" veil (flat tint + a stronger
 * bottom fade, both in the bar's own colour) softens the footage so it reads as
 * a calm backdrop rather than a busy foreground, and keeps icons/labels legible.
 * Touch-transparent.
 */
export function HoneyBackdrop({ scrimColor, scrimOpacity = 0.42 }: Props) {
  const player = useVideoPlayer(HONEY, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  // Bar colour at 0 alpha (not 'transparent') so the gradient never fringes
  // through black on iOS.
  const clear = `${scrimColor}00`;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        pointerEvents="none"
      />
      {/* Flat tint so the footage reads as part of the bar's colour family. */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: scrimColor, opacity: scrimOpacity }]} />
      {/* Stronger fade toward the bottom, where the labels sit. */}
      <LinearGradient
        colors={[clear, scrimColor]}
        locations={[0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
