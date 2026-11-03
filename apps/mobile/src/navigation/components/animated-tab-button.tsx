import type {BottomTabBarButtonProps} from 'expo-router/tabs';
import type {ComponentProps} from 'react';
import {Platform, Pressable, StyleSheet} from 'react-native';

import {TabButtonBackground} from './tab-button-background';

export function AnimatedTabButton({children, style, ref, onPress, ...props}: BottomTabBarButtonProps) {
    return (
        <Pressable
            {...props}
            ref={ref as ComponentProps<typeof Pressable>['ref']}
            android_ripple={undefined}
            onPress={(event) => {
                if (Platform.OS === 'web' && props.href != null) {
                    const hasModifierKey =
                        ('metaKey' in event && event.metaKey) ||
                        ('altKey' in event && event.altKey) ||
                        ('ctrlKey' in event && event.ctrlKey) ||
                        ('shiftKey' in event && event.shiftKey);
                    const isLeftClick = !('button' in event) || event.button == null || event.button === 0;
                    const target = (event.currentTarget as {target?: string}).target;
                    const isSelfTarget = target == null || target === '' || target === '_self' || target === 'self';

                    if (hasModifierKey || !isLeftClick || !isSelfTarget) {
                        return;
                    }

                    // Keep tab navigation inside the app instead of following the browser link.
                    event.preventDefault();
                }
                onPress?.(event);
            }}
            style={[style, styles.content]}>
            <TabButtonBackground selected={props['aria-selected'] === true} />
            {children}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    content: {
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 'auto',
        padding: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
