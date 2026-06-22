import React, { useState } from 'react';
import { Image, ImageProps } from 'expo-image';
import { FALLBACK_HONEY_IMAGE } from '../src/constants/images';

// Honey-toned block shown under the image while a (possibly slow) generative
// image is still loading, so users never see a blank/white flash.
const HONEY_PLACEHOLDER_COLOR = '#2a1c0c';

type Props = Omit<ImageProps, 'source'> & {
  /** The image URL (string) or local asset module (number) to display. */
  uri: string | number;
};

/**
 * Drop-in replacement for expo-image's <Image source={source} />.
 *
 * Handles both remote URLs and local static required assets, pairing remote URLs
 * with a honey-toned placeholder and on-error fallback.
 */
export function HoneyImage({ uri, style, transition, ...rest }: Props) {
  const [failed, setFailed] = useState(false);

  const source = failed
    ? { uri: FALLBACK_HONEY_IMAGE }
    : (typeof uri === 'string' ? { uri } : uri);

  return (
    <Image
      {...rest}
      source={source}
      style={[{ backgroundColor: HONEY_PLACEHOLDER_COLOR }, style]}
      transition={transition ?? 300}
      cachePolicy="memory-disk"
      onError={() => {
        if (!failed && typeof uri === 'string') setFailed(true);
      }}
    />
  );
}

export default HoneyImage;
