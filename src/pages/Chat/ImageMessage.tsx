import { View } from 'native-base';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import Image from '../../components/Image';
import { Message } from '../../types/redux';

const { width: ScreenWidth } = Dimensions.get('window');

type Props = {
    message: Message;
    // eslint-disable-next-line no-unused-vars
    openImageViewer: (imageUrl: string) => void;
};

function ImageMessage({ message, openImageViewer }: Props) {
    const maxWidth = ScreenWidth - 130 - 16;
    const maxHeight = 200;
    let scale = 1;
    let width = 0;
    let height = 0;
    const parseResult = /width=([0-9]+)&height=([0-9]+)/.exec(message.content);
    if (parseResult) {
        width = parseInt(parseResult[1], 10);
        height = parseInt(parseResult[2], 10);
        if (width * scale > maxWidth) {
            scale = maxWidth / width;
        }
        if (height * scale > maxHeight) {
            scale = maxHeight / height;
        }
    }

    function handleImageClick() {
        const imageUrl = message.content;
        openImageViewer(imageUrl);
    }

    return (
        <View style={[styles.container, { width: width * scale, height: height * scale }]}>
            <TouchableOpacity onPress={handleImageClick}>
                <Image
                    src={message.content}
                    style={{ width: width * scale, height: height * scale }}
                />
            </TouchableOpacity>
        </View>
    );
}

export default ImageMessage;

const styles = StyleSheet.create({
    container: {
        height: 200,
        width: ScreenWidth - 130 - 16,
        borderRadius: 3,
        overflow: 'hidden',
    },
});
