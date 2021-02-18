import React, { useEffect, useRef } from 'react';
import { StyleSheet, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';
import immutable from 'immutable';
import Constants from 'expo-constants';

import { isiOS } from '../../../utils/platform';

import MessageList from './MessageList';
import Input from './Input';

function Chat() {
    const $messageList = useRef();

    useEffect(() => {
        console.log('==>', Constants.statusBarHeight);
    }, []);

    function handleInputHeightChange() {
        if ($messageList.current && $messageList.current.getWrappedInstance) {
            $messageList.current.getWrappedInstance().scrollToEnd();
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={isiOS ? 'padding' : 'height'}
            keyboardVerticalOffset={Constants.statusBarHeight + 44}
        >

            <MessageList ref={$messageList} />
            <Input onHeightChange={handleInputHeightChange} />

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ebebeb',
    },
});

export default connect((state) => {
    const isLogin = !!state.getIn(['user', '_id']);
    if (!isLogin) {
        return {
            userId: '',
            focus: state.getIn(['user', 'linkmans', 0, '_id']),
            creator: '',
            avatar: state.getIn(['user', 'linkmans', 0, 'avatar']),
            members: state.getIn(['user', 'linkmans', 0, 'members']) || immutable.List(),
        };
    }

    const focus = state.get('focus');
    const linkman = state.getIn(['user', 'linkmans']).find(g => g.get('_id') === focus);

    return {
        userId: state.getIn(['user', '_id']),
        focus,
        type: linkman.get('type'),
        creator: linkman.get('creator'),
        to: linkman.get('to'),
        avatar: linkman.get('avatar'),
        members: linkman.get('members') || immutable.List(),
    };
})(Chat);
