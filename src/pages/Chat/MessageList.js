import React, { Component } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';

import Message from './Message';


class Chat extends Component {
    static propTypes = {
        messages: ImmutablePropTypes.list,
        self: PropTypes.string.isRequired,
    }
    @autobind
    scrollToEnd() {
        // Don't ask me why I use settimeout. Is that the only way it works.
        setTimeout(() => {
            this.scrollView.scrollToEnd();
        }, 0);
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
            scrollToEnd: this.scrollToEnd,
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
            <ScrollView style={styles.container} ref={i => this.scrollView = i}>
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
        padding: 8,
        marginBottom: 6,
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
