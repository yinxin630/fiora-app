import React, { Component } from 'react';
import { View, Image } from 'react-native';

export default class Expression extends Component {
    render() {
        const { size, index, style } = this.props;
        return (
            <View style={[{ width: size, height: size, overflow: 'hidden' }, style]}>
                <Image source={require('../assets/images/baidu.png')} style={{ width: size, height: size * 3200 / 64, marginTop: -size * index }} />
            </View>
        );
    }
}
