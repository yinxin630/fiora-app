import React, { useEffect, useRef } from 'react';
import { StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import { Actions } from 'react-native-router-flux';

import { isiOS } from '../../utils/platform';

import MessageList from './MessageList';
import Input from './Input';
import PageContainer from '../../components/PageContainer';
import { Friend, Group, Linkman } from '../../types/redux';
import { useFocusLinkman, useIsLogin, useSelfId, useStore } from '../../hooks/useStore';
import {
    getDefaultGroupOnlineMembers,
    getGroupOnlineMembers,
    getUserOnlineStatus,
} from '../../service';
import action from '../../state/action';
import { formatLinkmanName } from '../../utils/linkman';

export default function Chat() {
    const isLogin = useIsLogin();
    const self = useSelfId();
    const { focus } = useStore();
    const linkman = useFocusLinkman();
    const $messageList = useRef<ScrollView>();

    async function fetchGroupOnlineMembers() {
        let onlineMembers: Group['members'] = [];
        if (isLogin) {
            onlineMembers = await getGroupOnlineMembers(focus);
        } else {
            onlineMembers = await getDefaultGroupOnlineMembers();
        }
        if (onlineMembers) {
            action.updateGroupProperty(focus, 'members', onlineMembers);
        }
    }
    async function fetchUserOnlineStatus() {
        const isOnline = await getUserOnlineStatus(focus.replace(self, ''));
        action.updateFriendProperty(focus, 'isOnline', isOnline);
    }
    useEffect(() => {
        if (!linkman || !isLogin) {
            return;
        }
        const request = linkman.type === 'group' ? fetchGroupOnlineMembers : fetchUserOnlineStatus;
        request();
        const timer = setInterval(() => request(), 1000 * 60);
        return () => clearInterval(timer);
    }, [focus, isLogin]);

    useEffect(() => {
        if (Actions.currentScene !== 'chat') {
            return;
        }
        Actions.refresh({
            title: formatLinkmanName(linkman as Linkman),
        });
    }, [(linkman as Group).members, (linkman as Friend).isOnline]);

    function scrollToEnd(time = 0) {
        if (time > 200) {
            return;
        }
        if ($messageList.current) {
            $messageList.current!.scrollToEnd({ animated: false });
        }

        setTimeout(() => {
            scrollToEnd(time + 50);
        }, 50);
    }

    function handleInputHeightChange() {
        if ($messageList.current) {
            scrollToEnd();
        }
    }

    return (
        <PageContainer disableSafeAreaView>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={isiOS ? 'padding' : 'height'}
                keyboardVerticalOffset={Constants.statusBarHeight + 44}
            >
                {/* 
                // @ts-ignore */}
                <MessageList $scrollView={$messageList} />
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
