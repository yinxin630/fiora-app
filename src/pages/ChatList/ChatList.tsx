import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import Linkman from './Linkman';
import { useUser } from '../../hooks/useStore';
import { Linkman as LinkmanType } from '../../types/redux';
import PageContainer from '../../components/PageContainer';

export default function ChatList() {
    const user = useUser();
    const linkmans = user?.linkmans || [];

    function renderLinkman(linkman: LinkmanType) {
        const { _id: linkmanId, unread, messages, createTime } = linkman;
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

        let time = new Date(createTime);
        let preview = '暂无消息';
        if (lastMessage) {
            time = new Date(lastMessage.createTime);
            preview =
                lastMessage.type === 'text' ? `${lastMessage.content}` : `[${lastMessage.type}]`;
            if (linkman.type === 'group') {
                preview = `${lastMessage.from.username}: ${preview}`;
            }
        }
        return (
            <Linkman
                key={linkmanId}
                id={linkmanId}
                name={linkman.name}
                avatar={linkman.avatar}
                preview={preview}
                time={time}
                unread={unread}
                linkman={linkman}
            />
        );
    }

    return (
        <PageContainer>
            <ScrollView style={styles.messageList}>
                {linkmans && linkmans.map((linkman) => renderLinkman(linkman))}
            </ScrollView>
        </PageContainer>
    );
}

const styles = StyleSheet.create({
    messageList: {},
});
