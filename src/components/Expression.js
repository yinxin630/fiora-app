import React, { Component } from 'react';
import { View, Image } from 'react-native';
import PropTypes from 'prop-types';

export default class Expression extends Component {
    static propTypes = {
        size: PropTypes.number.isRequired,
        index: PropTypes.number.isRequired,
        style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    }
    render() {
        const { size, index, style } = this.props;
        return (
            <View style={[{ width: size, height: size, overflow: 'hidden' }, style]}>
                <Image source={require('../assets/images/baidu.png')} style={{ width: size, height: size * 3200 / 64, marginTop: -size * index }} />
            </View>
        );
    }
}
