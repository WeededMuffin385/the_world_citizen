import type {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

export function TitleCloud({children}: PropsWithChildren) {
    return (
        <View style={styles.container}>
            <Svg
                pointerEvents="none"
                aria-hidden={true}
                style={StyleSheet.absoluteFill}
                width="100%"
                height="100%"
                viewBox="0 0 400 200"
                preserveAspectRatio="none">
                <Path
                    fill="#FFFFFF"
                    d="M 62 178
                       C 24 184 2 162 8 137
                       C -4 113 8 86 32 80
                       C 22 48 48 24 82 32
                       C 94 4 135 0 157 22
                       C 179 -4 225 -2 244 25
                       C 270 4 310 15 316 43
                       C 352 30 382 52 375 82
                       C 407 94 405 128 386 143
                       C 397 172 365 193 333 183
                       C 309 205 271 203 250 183
                       C 226 204 186 202 166 183
                       C 136 204 95 200 82 178
                       C 75 181 68 181 62 178 Z"
                />
            </Svg>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'stretch',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
    },
});
