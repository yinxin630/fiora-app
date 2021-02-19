import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Keyboard, RefreshControl, Modal } from 'react-native';
import { Toast } from 'native-base';
import ImageViewer from 'react-native-image-zoom-viewer';

import action from '../../state/action';
import fetch from '../../utils/fetch';

import Message from './Message';
import { useIsLogin, useSelfId, useStore } from '../../hooks/useStore';
import { Message as MessageType } from '../../types/redux';

export default function Chat() {
    const isLogin = useIsLogin();
    const self = useSelfId();
    const { focus } = useStore();
    const messages =
        useStore().user!.linkmans.find((linkman) => linkman._id === focus)?.messages || [];

    const [refreshing, setRefreshing] = useState(false);
    const [showImageViewerDialog, toggleShowImageViewerDialog] = useState(false);
    const [imageViewerIndex, setImageViewerIndex] = useState(0);

    const $scrollView = useRef<ScrollView>();

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardWillShow',
            handleKeyboardShow,
        );

        return () => {
            keyboardDidShowListener.remove();
        };
    }, []);

    let prevContentHeight = 0;
    let prevMessageCount = 0;
    let shouldScroll = true;

    function getImages() {
        const imageMessages = messages.filter((message) => message.type === 'image');
        const images = imageMessages.map((message) => {
            let url = message.content;
            if (url.startsWith('//')) {
                url = `https:${url}`;
            }
            return { url };
        });
        return images;
    }

    function scrollToEnd() {
        // Don't ask me why I use settimeout. Is that the only way it works.
        setTimeout(() => {
            if ($scrollView.current?.scrollToEnd) {
                $scrollView.current!.scrollToEnd();
            }
        }, 200);
    }

    function handleKeyboardShow() {
        scrollToEnd();
    }

    async function handleRefresh() {
        setRefreshing(true);

        let err = null;
        let result = null;
        if (isLogin) {
            [err, result] = await fetch('getLinkmanHistoryMessages', {
                linkmanId: focus,
                existCount: messages.length,
            });
        } else {
            [err, result] = await fetch('getDefalutGroupHistoryMessages', {
                existCount: messages.length,
            });
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

        setRefreshing(false);
    }
    /**
     * 加载历史消息后, 自动滚动到合适位置
     */
    function handleContentSizeChange(contentWidth: number, contentHeight: number) {
        if (prevContentHeight === 0) {
            $scrollView.current!.scrollTo({
                x: 0,
                y: 0,
                animated: true,
            });
        } else if (contentHeight !== prevContentHeight && messages.length - prevMessageCount > 1) {
            $scrollView.current!.scrollTo({
                x: 0,
                y: contentHeight - prevContentHeight - 100,
                animated: false,
            });
        }
        prevContentHeight = contentHeight;
        prevMessageCount = messages.length;
    }

    function handleScroll(event: any) {
        const { layoutMeasurement, contentSize, contentOffset } = event.nativeEvent;
        shouldScroll = contentOffset.y > contentSize.height - layoutMeasurement.height * 2;
    }

    function openImageViewer(url: string) {
        const images = getImages();
        const index = images.findIndex((image) => image.url.indexOf(url) !== -1);
        toggleShowImageViewerDialog(true);
        setImageViewerIndex(index);
    }

    function renderMessage(message: MessageType) {
        return (
            <Message
                key={message._id}
                avatar={message.from.avatar}
                nickname={message.from.username}
                time={new Date(message.createTime)}
                type={message.type}
                content={message.content}
                isSelf={self === message.from._id}
                tag={message.from.tag}
                shouldScroll={shouldScroll}
                scrollToEnd={scrollToEnd}
                {...(message.type === 'image'
                    ? {
                        loading: message.loading,
                        percent: message.percent,
                        openImageViewer,
                    }
                    : {})}
            />
        );
    }

    function closeImageViewerDialog() {
        toggleShowImageViewerDialog(false);
    }

    return (
        <ScrollView
            style={styles.container}
            ref={$scrollView}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    title="获取历史消息"
                    titleColor="#444"
                />
            }
            onContentSizeChange={handleContentSizeChange}
            scrollEventThrottle={200}
            onScroll={handleScroll}
        >
            {messages.map((message, index) => renderMessage(message))}
            <Modal
                visible={showImageViewerDialog}
                transparent
                onRequestClose={closeImageViewerDialog}
            >
                <ImageViewer
                    imageUrls={getImages()}
                    index={imageViewerIndex}
                    onClick={closeImageViewerDialog}
                    onSwipeDown={closeImageViewerDialog}
                />
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#ebebeb',
    },
});
