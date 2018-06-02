import React, { Component } from 'react';
import { Image as BaseImage } from 'react-native';
import PropTypes from 'prop-types';

export default class Image extends Component {
    static propTypes = {
        src: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    }
    static defaultProps = {
        width: '100%',
        height: '100%',
    }
    render() {
        const { src, width, height, style } = this.props;
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
        console.log(111, source, src);
        return (
            <BaseImage source={source} style={[style, { width, height }]} />
        );
    }
}
