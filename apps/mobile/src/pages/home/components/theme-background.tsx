import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { useAppTheme } from '@/shared/theme/provider';

export function ThemeBackground() {
  const { scheme } = useAppTheme();
  const [darkImageReady, setDarkImageReady] = useState(false);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(darkImageReady && scheme === 'dark' ? 1 : 0, {
      duration: 350,
      easing: Easing.inOut(Easing.cubic),
    }),
  }));

  return (
    <>
      <Image
        source={require('../images/background_light.jpg')}
        style={styles.background}
        resizeMode="cover"
        accessible={false}
        pointerEvents="none"
        fadeDuration={0}
      />
      <Animated.Image
        source={require('../images/background_dark.jpg')}
        style={[styles.background, animatedStyle]}
        resizeMode="cover"
        accessible={false}
        pointerEvents="none"
        fadeDuration={0}
        onLoad={() => setDarkImageReady(true)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
});
