import React, { Component } from 'react';
import { ScrollView, StyleSheet, Keyboard, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { Toast } from 'native-base';

import action from '../../state/action';
import fetch from '../../../utils/fetch';

import Message from './Message';

class Chat extends Component {
    static propTypes = {
        messages: ImmutablePropTypes.list,
        self: PropTypes.string.isRequired,
    }
    constructor(...args) {
        super(...args);
        this.state = {
            refreshing: false,
        };
        this.prevContentHeight = 0;
        this.prevMessageCount = 0;
    }
    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.handleKeyboardShow);
    }
    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
    }
    @autobind
    handleKeyboardShow() {
        this.scrollToEnd();
    }
    @autobind
    scrollToEnd() {
        // Don't ask me why I use settimeout. Is that the only way it works.
        setTimeout(() => {
            if (this.scrollView && this.scrollView.scrollToEnd) {
                this.scrollView.scrollToEnd();
            }
        }, 100);
    }
    @autobind
    async handleRefresh() {
        this.setState({ refreshing: true });
        const { self: isLogin, focus, messages } = this.props;
        let err = null;
        let result = null;
        if (isLogin) {
            [err, result] = await fetch('getLinkmanHistoryMessages', { linkmanId: focus, existCount: messages.size });
        } else {
            [err, result] = await fetch('getDefalutGroupHistoryMessages', { existCount: messages.size });
        }
        if (!err) {
            if (result.length > 0) {
                action.addLinkmanMessages(focus, result);
            } else {
                Toast.show({
                    text: '没有更多消息了',
                    type: 'warning',
                });
            }
        }
        this.setState({ refreshing: false });
    }
    @autobind
    handleContentSizeChange(contentWidth, contentHeight) {
        if (this.prevContentHeight === 0) {
            this.scrollView.scrollTo({
                x: 0,
                y: contentHeight - 50,
                animated: true,
            });
        } else if (
            contentHeight !== this.prevContentHeight &&
            this.props.messages.size - this.prevMessageCount > 1
        ) {
            this.scrollView.scrollTo({
                x: 0,
                y: contentHeight - this.prevContentHeight - 50,
                animated: false,
            });
        }
        this.prevContentHeight = contentHeight;
        this.prevMessageCount = this.props.messages.size;
    }
    renderMessage(message, shouldScroll) {
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
            shouldScroll,
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
            <ScrollView
                style={styles.container}
                ref={i => this.scrollView = i}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this.handleRefresh}
                        title="获取历史消息"
                        titleColor="#444"
                    />
                }
                onContentSizeChange={this.handleContentSizeChange}
            >
                {
                    messages.map((message, index) => (
                        this.renderMessage(message, index === messages.size - 1)
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
