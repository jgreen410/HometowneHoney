import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, Pattern, Rect } from 'react-native-svg';

import { useTheme } from '../src/store/themeStore';

interface Props {
  opacity?: number;
  style?: object;
  /** Force a colour scheme regardless of app theme (e.g. login is always dark). */
  forceDark?: boolean;
}

// Flat-top hexagon path centered at (0,0) with circumradius r.
// w = 2r, h = r * sqrt(3)
const HEX_R = 18;
const HEX_W = HEX_R * 2;
const HEX_H = HEX_R * Math.sqrt(3);

function hexPath(r: number): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i; // flat-top: no rotation offset
    return `${r * Math.cos(a)},${r * Math.sin(a)}`;
  });
  return `M${pts.join('L')}Z`;
}

const HEX_D = hexPath(HEX_R);

export function HoneycombBackground({ opacity, style, forceDark }: Props) {
  const { isDark: themeDark } = useTheme();
  const isDark = forceDark ?? themeDark;

  const strokeColor = isDark ? '#F4CA44' : '#C17B1A';
  const resolvedOpacity = opacity ?? (isDark ? 0.07 : 0.06);

  // Pattern: offset rows of hexagons.
  // Cell size: width = HEX_W * 1.5, height = HEX_H
  const cellW = HEX_W * 1.5;
  const cellH = HEX_H;

  return (
    <View style={[StyleSheet.absoluteFillObject, style]} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <Pattern
            id="honeycomb"
            x="0"
            y="0"
            width={cellW}
            height={cellH * 2}
            patternUnits="userSpaceOnUse"
          >
            {/* Row 1 hex at (0, cellH/2) */}
            <Path
              d={HEX_D}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1}
              opacity={resolvedOpacity}
              transform={`translate(${HEX_R}, ${cellH / 2})`}
            />
            {/* Row 2 hex offset by (cellW/2, cellH*1.5) */}
            <Path
              d={HEX_D}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1}
              opacity={resolvedOpacity}
              transform={`translate(${HEX_R + cellW / 2}, ${cellH * 1.5})`}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#honeycomb)" />
      </Svg>
    </View>
  );
}
