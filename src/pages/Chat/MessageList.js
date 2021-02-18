import React, { Component } from 'react';
import { ScrollView, StyleSheet, Keyboard, RefreshControl, Modal } from 'react-native';
import { connect } from 'react-redux';
import immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { Toast } from 'native-base';
import ImageViewer from 'react-native-image-zoom-viewer';

import action from '../../state/action';
import fetch from '../../../utils/fetch';
import openClose from '../../../utils/openClose';

import Message from './Message';

@autobind
class Chat extends Component {
    static propTypes = {
        messages: ImmutablePropTypes.list,
        self: PropTypes.string.isRequired,
    }
    constructor(...args) {
        super(...args);
        this.state = {
            refreshing: false,
            imageViewerDialog: false,
            imageViewerIndex: 0,
        };
        this.prevContentHeight = 0;
        this.prevMessageCount = 0;
        this.shouldScroll = true;
    }
    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this.handleKeyboardShow);
    }
    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
    }
    getImages() {
        const { messages } = this.props;
        const imageMessages = messages.filter(message => message.get('type') === 'image');
        const images = imageMessages.map((message) => {
            let url = message.get('content');
            if (url.startsWith('//')) {
                url = `https:${url}`;
            }
            return { url };
        });
        return images.toJS();
    }
    handleKeyboardShow() {
        this.scrollToEnd();
    }
    scrollToEnd() {
        // Don't ask me why I use settimeout. Is that the only way it works.
        setTimeout(() => {
            if (this.scrollView && this.scrollView.scrollToEnd) {
                this.scrollView.scrollToEnd();
            }
        }, 200);
    }
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
    /**
     * 加载历史消息后, 自动滚动到合适位置
     */
    handleContentSizeChange(contentWidth, contentHeight) {
        if (this.prevContentHeight === 0) {
            this.scrollView.scrollTo({
                x: 0,
                y: 0,
                animated: true,
            });
        } else if (
            contentHeight !== this.prevContentHeight &&
            this.props.messages.size - this.prevMessageCount > 1
        ) {
            this.scrollView.scrollTo({
                x: 0,
                y: contentHeight - this.prevContentHeight - 100,
                animated: false,
            });
        }
        this.prevContentHeight = contentHeight;
        this.prevMessageCount = this.props.messages.size;
    }
    handleScroll(event) {
        const { layoutMeasurement, contentSize, contentOffset } = event.nativeEvent;
        this.shouldScroll = contentOffset.y > contentSize.height - layoutMeasurement.height * 2;
    }
    openImageViewer(url) {
        const images = this.getImages();
        const index = images.findIndex(image => image.url.indexOf(url) !== -1);
        this.setState({
            imageViewerDialog: true,
            imageViewerIndex: index,
        });
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
            shouldScroll: this.shouldScroll,
            scrollToEnd: this.scrollToEnd,
        };
        if (props.type === 'image') {
            props.loading = message.get('loading');
            props.percent = message.get('percent');
            props.openImageViewer = this.openImageViewer;
        }
        return (
            <Message {...props} />
        );
    }
    render() {
        const { messages } = this.props;
        const { imageViewerDialog, imageViewerIndex } = this.state;
        const closeImageViewer = openClose.close.bind(this, 'imageViewerDialog');
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
                scrollEventThrottle={200}
                onScroll={this.handleScroll}
            >
                {
                    messages.map((message, index) => (
                        this.renderMessage(message, index === messages.size - 1)
                    ))
                }
                <Modal
                    visible={imageViewerDialog}
                    transparent
                    onRequestClose={closeImageViewer}
                >
                    <ImageViewer
                        imageUrls={this.getImages()}
                        index={imageViewerIndex}
                        onClick={closeImageViewer}
                        onSwipeDown={closeImageViewer}
                    />
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#ebebeb',
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
}, null, null, { withRef: true })(Chat);
