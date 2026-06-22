import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';

// Playlist of background videos, starting with the honey-drip clip.
// All mp4 clips are in Expo's default assetExts, so require() bundles them.
const SOURCES = [
  require('../assets/videos/honey-drip.mp4'),
  require('../assets/videos/theme_a_bg.mp4'),
  require('../assets/videos/theme_b_bg.mp4'),
  require('../assets/videos/theme_c_bg.mp4'),
];

const FADE_MS = 1000;

type Layer = 'A' | 'B';

interface Props {
  /** Solid colour shown under the video before the first frame paints. */
  baseColor?: string;
}

const getSource = (index: number) => {
  return SOURCES[index % SOURCES.length];
};

/**
 * Full-bleed, muted, auto-playing video backdrop that crossfades between clips and loops.
 * Two players are stacked: A (bottom) stays fully opaque while B (top) fades in/out, so the
 * transition is always a clean blend of two video frames — no white flash, no background bleed.
 * The visible clip plays while the hidden one is pre-loaded; the two players alternate roles.
 * Touch-transparent — overlay your own scrim + content on top.
 */
export function VideoBackground({ baseColor = '#2C1A06' }: Props) {
  const playerA = useVideoPlayer(getSource(0), (p) => {
    p.loop = false;
    p.muted = true;
    p.timeUpdateEventInterval = 0.05; // 50ms interval for precise end detection
    p.play();
  });
  const playerB = useVideoPlayer(getSource(1), (p) => {
    p.loop = false;
    p.muted = true;
    p.timeUpdateEventInterval = 0.05; // 50ms interval for precise end detection
  });

  // Mutable state lives in refs so the playToEnd listeners never go stale.
  // Active is playing A (index 0). pre-loaded B holds index 1. next to load is index 2.
  const active = useRef<Layer>('A');
  const held = useRef<{ A: number; B: number; next: number }>({ A: 0, B: 1, next: 2 });
  const transitioning = useRef<boolean>(false);

  // A (bottom) is always fully opaque; the crossfade is driven entirely by B's (top) opacity.
  //   bOpacity 0 → A is showing.  bOpacity 1 → B is showing.
  const bOpacity = useSharedValue(0);
  const bStyle = useAnimatedStyle(() => ({ opacity: bOpacity.value }));

  const startIncoming = useCallback(
    (incoming: Layer) => {
      const incomingPlayer = incoming === 'A' ? playerA : playerB;
      try {
        incomingPlayer.currentTime = 0;
      } catch {}
      incomingPlayer.play();
    },
    [playerA, playerB],
  );

  const finalizeSwap = useCallback(
    (incoming: Layer, ended: Layer) => {
      const outgoingPlayer = ended === 'A' ? playerA : playerB;

      // The crossfade has already landed bOpacity on its exact target (0 or 1); just record
      // which layer is now showing.
      active.current = incoming;

      // Once hidden, recycle the outgoing layer onto the next clip in the loop.
      const n = held.current.next;
      try {
        outgoingPlayer.replace(getSource(n));
        outgoingPlayer.pause();
      } catch {}
      held.current[ended] = n;
      held.current.next = (n + 1) % SOURCES.length;

      // Reset transitioning flag
      transitioning.current = false;
    },
    [playerA, playerB],
  );

  const advance = useCallback(
    (ended: Layer) => {
      // Only the currently-visible clip's end drives the transition.
      if (ended !== active.current) return;

      // Single, atomic guard — prevents concurrent triggers (e.g. timeUpdate + playToEnd).
      if (transitioning.current) return;
      transitioning.current = true;

      const incoming: Layer = ended === 'A' ? 'B' : 'A';

      // 1. Pre-start the incoming video so it can buffer and render before it's revealed.
      startIncoming(incoming);

      // 2. Crossfade by sliding the top layer's opacity toward the incoming clip:
      //    incoming B → fade B in (0→1); incoming A → fade B out (1→0), revealing A underneath.
      const target = incoming === 'B' ? 1 : 0;
      bOpacity.value = withTiming(
        target,
        { duration: FADE_MS, easing: Easing.inOut(Easing.ease) },
        (finished) => {
          if (finished) runOnJS(finalizeSwap)(incoming, ended);
        },
      );
    },
    [startIncoming, finalizeSwap, bOpacity],
  );

  const onTimeUpdate = useCallback(
    (layer: Layer, currentTime: number) => {
      if (layer !== active.current) return;
      if (transitioning.current) return;

      const player = layer === 'A' ? playerA : playerB;
      const duration = player.duration;
      // Start the crossfade a full FADE_MS before the end so the outgoing clip keeps playing
      // for the entire dissolve and never freezes on its last frame while still visible.
      if (duration > 0 && duration - currentTime <= FADE_MS / 1000) {
        advance(layer); // advance owns the transitioning check-and-set
      }
    },
    [playerA, playerB, advance],
  );

  useEffect(() => {
    // playToEnd listener acts as a fallback
    const subA = playerA.addListener('playToEnd', () => advance('A'));
    const subB = playerB.addListener('playToEnd', () => advance('B'));

    // timeUpdate listener performs the smooth preemptive transition
    const timeA = playerA.addListener('timeUpdate', (event) => onTimeUpdate('A', event.currentTime));
    const timeB = playerB.addListener('timeUpdate', (event) => onTimeUpdate('B', event.currentTime));

    return () => {
      subA.remove();
      subB.remove();
      timeA.remove();
      timeB.remove();
    };
  }, [playerA, playerB, advance, onTimeUpdate]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: baseColor }]}
    >
      {/* Bottom layer A — always fully opaque; the incoming clip is revealed under B. */}
      <Animated.View style={StyleSheet.absoluteFill}>
        <VideoView
          player={playerA}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      </Animated.View>
      {/* Top layer B — its opacity is the crossfade. */}
      <Animated.View style={[StyleSheet.absoluteFill, bStyle]}>
        <VideoView
          player={playerB}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          pointerEvents="none"
        />
      </Animated.View>
    </Animated.View>
  );
}
