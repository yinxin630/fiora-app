import React, { Component } from 'react';
import { Image } from 'react-native';
import PropTypes from 'prop-types';

export default class Avatar extends Component {
    static propTypes = {
        src: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        size: PropTypes.number,
    }
    render() {
        const { src, size } = this.props;
        let source = src;
        if (typeof src === 'string') {
            let prefix = '';
            if (src[0] === '/') {
                if (src[1] === '/') {
                    prefix = 'https:';
                } else {
                    prefix = 'http://192.168.1.105:8080';
                }
            }
            source = { uri: prefix + src };
        }
        return (
            <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} />
        );
    }
}
