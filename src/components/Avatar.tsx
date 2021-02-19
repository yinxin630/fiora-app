import React from 'react';

import Image from './Image';

type Props = {
    src: string;
    size: number;
}
export default function Avatar({ src, size }: Props) {
    return (
        <Image src={src} width={size} height={size} style={{ borderRadius: size / 2 }} />
    );
}
