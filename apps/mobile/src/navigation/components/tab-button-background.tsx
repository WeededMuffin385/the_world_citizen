import {StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';

import {useAppTheme} from '@/shared/theme/provider';

export function TabButtonBackground({selected}: {selected: boolean}) {
    const {colors} = useAppTheme();
    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: withTiming(
            selected ? colors.tabSurfaceSelected : colors.tabSurface,
            {duration: 350},
        ),
    }));

    return (
        <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, animatedStyle]}
        />
    );
}
