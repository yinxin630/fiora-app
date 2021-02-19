import React from 'react';
import { ScrollView, SafeAreaView } from 'react-native';

import Linkman from './Linkman';
import { useUser } from '../../hooks/useStore';
import { Group, Linkman as LinkmanType, User } from '../../types/redux';

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
                name={(linkman as unknown as User).username || (linkman as unknown as Group).name}
                avatar={linkman.avatar}
                preview={preview}
                time={time}
                unread={unread}
            />
        );
    }

    return (
        <SafeAreaView>
            <ScrollView>{linkmans && linkmans.map((linkman) => renderLinkman(linkman))}</ScrollView>
        </SafeAreaView>
    );
}
