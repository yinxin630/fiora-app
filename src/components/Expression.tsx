import React from 'react';
import { View } from 'react-native';

import Image from './Image';

const uri = 'https://cdn.suisuijiang.com/fiora/img/baidu.bd067c14.png';

type Props = {
    size: number;
    index: number;
    style: any;
};

export default function Expression({ size, index, style }: Props) {
    return (
        <View style={[{ width: size, height: size, overflow: 'hidden' }, style]}>
            <Image
                src={uri}
                width={size}
                height={(size * 3200) / 64}
                style={{ marginTop: -size * index }}
            />
        </View>
    );
}
