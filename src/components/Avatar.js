import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Image from './Image';

export default class Avatar extends Component {
    static propTypes = {
        src: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        size: PropTypes.number,
    }
    render() {
        const { src, size } = this.props;
        return (
            <Image src={src} width={size} height={size} style={{ borderRadius: size / 2 }} />
        );
    }
}
