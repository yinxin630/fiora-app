import React, { useRef } from 'react';
import { StyleSheet, KeyboardAvoidingView } from 'react-native';
import Constants from 'expo-constants';

import { isiOS } from '../../utils/platform';

import MessageList from './MessageList';
import Input from './Input';
import PageContainer from '../../components/PageContainer';

export default function Chat() {
    const $messageList = useRef();

    function handleInputHeightChange() {
        if ($messageList.current) {
            $messageList.current!.scrollToEnd({ animated: false });
        }
    }

    return (
        <PageContainer disableSafeAreaView>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={isiOS ? 'padding' : 'height'}
                keyboardVerticalOffset={Constants.statusBarHeight + 44}
            >
                <MessageList ref={$messageList} />
                <Input onHeightChange={handleInputHeightChange} />
            </KeyboardAvoidingView>
        </PageContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
