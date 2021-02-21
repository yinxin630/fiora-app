import React from 'react';
import { Image as BaseImage, ImageSourcePropType } from 'react-native';

type Props = {
    src: string;
    width?: string | number;
    height?: string | number;
    style?: any;
};

export default function Image({ src, width = '100%', height = '100%', style }: Props) {
    // @ts-ignore
    let source: ImageSourcePropType = src;
    if (typeof src === 'string') {
        let prefix = '';
        if (src[0] === '/') {
            if (src[1] === '/') {
                prefix = 'https:';
            } else {
                prefix = 'http://192.168.1.105:8080';
            }
        }
        source = {
            uri: prefix + src,
            cache: 'force-cache',
        };
    }
    return <BaseImage source={source} style={[style, { width, height }]} />;
}
