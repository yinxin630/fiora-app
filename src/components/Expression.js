import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

import Image from './Image';

const uri = 'https://cdn.suisuijiang.com/fiora/img/baidu.bd067c14.png';

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
                <Image src={uri} width={size} height={size * 3200 / 64} style={{ marginTop: -size * index }} />
            </View>
        );
    }
}
