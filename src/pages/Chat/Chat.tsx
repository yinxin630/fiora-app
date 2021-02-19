import React, { useRef } from 'react';
import { StyleSheet, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import Constants from 'expo-constants';

import { isiOS } from '../../utils/platform';

import MessageList from './MessageList';
import Input from './Input';

export default function Chat() {
    const $messageList = useRef();

    function handleInputHeightChange() {
        if ($messageList.current?.getWrappedInstance) {
            $messageList.current!.scrollToEnd();
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={isiOS ? 'padding' : 'height'}
                keyboardVerticalOffset={Constants.statusBarHeight + 44}
            >

                <MessageList ref={$messageList} />
                <Input onHeightChange={handleInputHeightChange} />

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f6',
    },
});
