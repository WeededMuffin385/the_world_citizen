import {router, usePathname} from 'expo-router';
import {TabSlot} from 'expo-router/ui';
import {useEffect, useLayoutEffect, useRef, useState, type ComponentRef} from 'react';
import {Platform, ScrollView, StyleSheet, View, type ViewStyle} from 'react-native';

import {TAB_ROUTES} from '../tab-routes';

/** Native paging keeps the content attached to the finger, including cancelled swipes. */
export function TabPager({onVisiblePageChange}: {onVisiblePageChange: (index: number) => void}) {
    const pathname = usePathname();
    // Keep SSR and the first browser render identical; measure after layout.
    const [width, setWidth] = useState(0);
    const routeIndex = TAB_ROUTES.findIndex(tab => tab.href === pathname);
    const index = Math.max(0, routeIndex);
    const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
    const offset = useRef(index * width);
    const [initialOffset] = useState(() => ({x: index * width, y: 0}));
    const previousWidth = useRef(width);
    const pendingTarget = useRef<number | null>(null);
    const dragging = useRef(false);
    const userSwipe = useRef(false);
    const currentPath = useRef(pathname);
    useLayoutEffect(() => {currentPath.current = pathname;}, [pathname]);
    const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Sparse tab routes must exist before their pages can appear during a drag.
        for (const tab of TAB_ROUTES) router.prefetch(tab.href);
    }, []);

    useEffect(() => {
        if (settleTimer.current) clearTimeout(settleTimer.current);
        dragging.current = false;
        userSwipe.current = false;
        pendingTarget.current = null;
        // Detail routes leave the tab pager mounted, but must never select Home.
        if (routeIndex < 0 || width <= 0) return;
        const resized = previousWidth.current !== width;
        previousWidth.current = width;
        const target = index * width;
        if (resized || Math.abs(offset.current - target) > 1) {
            if (resized) onVisiblePageChange(index);
            pendingTarget.current = target;
            scroll.current?.scrollTo({x: target, animated: !resized});
        } else {
            onVisiblePageChange(index);
        }
    }, [routeIndex, index, width, onVisiblePageChange]);

    useEffect(() => () => {
        if (settleTimer.current) clearTimeout(settleTimer.current);
    }, []);

    function settle() {
        if (settleTimer.current) clearTimeout(settleTimer.current);
        // Ignore delayed callbacks from a previous route and background scroll events.
        if (routeIndex < 0 || currentPath.current !== pathname || width <= 0) return;
        if (dragging.current) return;
        const nearestIndex = Math.max(0, Math.min(TAB_ROUTES.length - 1, Math.round(offset.current / width)));
        const target = pendingTarget.current ?? nearestIndex * width;
        if (Math.abs(offset.current - target) > 1) {
            // Returning to the active route also needs to finish the physical scroll.
            pendingTarget.current = target;
            scroll.current?.scrollTo({x: target, animated: true});
            return;
        }
        pendingTarget.current = null;
        const next = TAB_ROUTES[Math.round(target / width)];
        // Layout restoration and scrollTo animations do not express navigation intent.
        if (userSwipe.current && next.href !== pathname) {
            userSwipe.current = false;
            router.navigate(next.href);
        }
    }

    function scheduleSettle() {
        if (routeIndex < 0 || currentPath.current !== pathname) return;
        if (settleTimer.current) clearTimeout(settleTimer.current);
        settleTimer.current = setTimeout(settle, 150);
    }

    return (
        <ScrollView ref={scroll} horizontal pagingEnabled={Platform.OS !== 'web'} directionalLockEnabled
            style={[styles.viewport, Platform.OS === 'web' && webPagingStyle]} contentOffset={initialOffset}
            onLayout={event => setWidth(event.nativeEvent.layout.width)}
            showsHorizontalScrollIndicator={false} bounces={false} overScrollMode="never"
            keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="never"
            scrollEventThrottle={16}
            onTouchStart={Platform.OS === 'web' ? () => {
                if (routeIndex < 0) return;
                dragging.current = true;
                userSwipe.current = true;
                pendingTarget.current = null;
                if (settleTimer.current) clearTimeout(settleTimer.current);
            } : undefined}
            onTouchEnd={Platform.OS === 'web' ? event => {
                if (event.nativeEvent.touches.length > 0) return;
                dragging.current = false;
                scheduleSettle();
            } : undefined}
            onTouchCancel={Platform.OS === 'web' ? () => {
                dragging.current = false;
                scheduleSettle();
            } : undefined}
            onScrollBeginDrag={() => {
                if (routeIndex < 0) return;
                dragging.current = true;
                userSwipe.current = true;
                pendingTarget.current = null;
                if (settleTimer.current) clearTimeout(settleTimer.current);
            }}
            onScroll={event => {
                if (routeIndex < 0) return;
                offset.current = event.nativeEvent.contentOffset.x;
                if (width > 0) {
                    // Follow the visible page immediately, including a drag that reverses.
                    onVisiblePageChange(Math.max(0, Math.min(TAB_ROUTES.length - 1, Math.round(offset.current / width))));
                }
                if (!dragging.current) scheduleSettle();
            }}
            onScrollEndDrag={() => {
                dragging.current = false;
                scheduleSettle();
            }}
            onMomentumScrollEnd={settle}>
            <TabSlot detachInactiveScreens={false}
                style={{width: width * TAB_ROUTES.length, position: 'relative'}}
                renderFn={(descriptor, {isFocused}) => {
                    // The entry redirect has no page and must never mount in the background.
                    if (descriptor.route.name === 'index') return isFocused ? descriptor.render() : null;
                    const pageIndex = TAB_ROUTES.findIndex(tab => tab.name === descriptor.route.name);
                    if (pageIndex < 0) return null;
                    return (
                        <View key={descriptor.route.key}
                            style={[{position: 'absolute', left: pageIndex * width, top: 0, bottom: 0, width},
                                Platform.OS === 'web' && webPageStyle]}
                            accessibilityElementsHidden={!isFocused}
                            importantForAccessibility={isFocused ? 'auto' : 'no-hide-descendants'}>
                            {descriptor.render()}
                        </View>
                    );
                }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({viewport: {flex: 1}});

// Web paging must snap to individual pages, not the single wide TabSlot child.
const webPagingStyle: ViewStyle & {scrollSnapType: 'x mandatory'} = {scrollSnapType: 'x mandatory'};
const webPageStyle: ViewStyle & {scrollSnapAlign: 'start'} = {scrollSnapAlign: 'start'};
