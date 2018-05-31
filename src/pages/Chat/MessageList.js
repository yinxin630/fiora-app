import React, { Component } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';

import Message from './Message';


class Chat extends Component {
    static propTypes = {
        messages: ImmutablePropTypes.list,
        self: PropTypes.string.isRequired,
    }
    renderMessage(message) {
        const { self } = this.props;
        const props = {
            key: message.get('_id'),
            avatar: message.getIn(['from', 'avatar']),
            nickname: message.getIn(['from', 'username']),
            time: new Date(message.get('createTime')),
            type: message.get('type'),
            content: message.get('content'),
            isSelf: self === message.getIn(['from', '_id']),
            tag: message.getIn(['from', 'tag']),
        };
        if (props.type === 'image') {
            props.loading = message.get('loading');
            props.percent = message.get('percent');
        }
        return (
            <Message {...props} />
        );
    }
    render() {
        const { messages } = this.props;
        return (
            <ScrollView style={styles.container}>
                {
                    messages.map(message => (
                        this.renderMessage(message)
                    ))
                }
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 10,
        paddingRight: 10,
    },
});

export default connect((state) => {
    const isLogin = !!state.getIn(['user', '_id']);
    if (!isLogin) {
        return {
            self: '',
            focus: state.getIn(['user', 'linkmans', 0, '_id']),
            messages: state.getIn(['user', 'linkmans', 0, 'messages']) || immutable.List(),
        };
    }

    const focus = state.get('focus');
    const linkman = state.getIn(['user', 'linkmans']).find(g => g.get('_id') === focus);

    return {
        self: state.getIn(['user', '_id']),
        focus,
        messages: linkman.get('messages') || immutable.List(),
    };
})(Chat);
