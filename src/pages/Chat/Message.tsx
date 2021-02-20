import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Triangle from '@react-native-toolkit/triangle';

import Time from '../../utils/time';
import Avatar from '../../components/Avatar';
import { Message as MessageType } from '../../types/redux';
import SystemMessage from './SystemMessage';
import ImageMessage from './ImageMessage';
import TextMessage from './TextMessage';
import { getPerRandomColor, getRandomColor } from '../../utils/getRandomColor';
import InviteMessage from './InviteMessage';
import { useFocusLinkman, useIsAdmin, useSelfId, useTheme } from '../../hooks/useStore';
import MessageMenu from './MessageMenu';

const { width: ScreenWidth } = Dimensions.get('window');

type Props = {
    message: MessageType;
    isSelf: boolean;
    shouldScroll: boolean;
    scrollToEnd: () => void;
    // eslint-disable-next-line no-unused-vars
    openImageViewer: (imageUrl: string) => void;
};

export default function Message({
    message,
    isSelf,
    shouldScroll,
    scrollToEnd,
    openImageViewer,
}: Props) {
    const { primaryColor8 } = useTheme();
    const linkman = useFocusLinkman();
    const isAdmin = useIsAdmin();
    const self = useSelfId();

    useEffect(() => {
        if (shouldScroll) {
            scrollToEnd();
        }
    }, []);

    function formatTime() {
        const createTime = new Date(message.createTime);
        const nowTime = new Date();
        if (Time.isToday(nowTime, createTime)) {
            return Time.getHourMinute(createTime);
        }
        if (Time.isYesterday(nowTime, createTime)) {
            return `昨天 ${Time.getHourMinute(createTime)}`;
        }
        if (Time.isSameYear(nowTime, createTime)) {
            return `${Time.getMonthDate(createTime)} ${Time.getHourMinute(createTime)}`;
        }
        return `${Time.getYearMonthDate(createTime)} ${Time.getHourMinute(createTime)}`;
    }

    function renderContent() {
        switch (message.type) {
            case 'text': {
                return <TextMessage message={message} isSelf={isSelf} />;
            }
            case 'image': {
                return <ImageMessage message={message} openImageViewer={openImageViewer} />;
            }
            case 'system': {
                return <SystemMessage message={message} />;
            }
            case 'inviteV2': {
                return <InviteMessage message={message} isSelf={isSelf} />;
            }
            case 'file':
            case 'code': {
                return (
                    <Text style={styles.notSupport}>
                        暂未支持的消息类型[{message.type}], 请在Web端查看
                    </Text>
                );
            }
            default:
                return <Text style={styles.notSupport}>不支持的消息类型</Text>;
        }
    }

    return (
        <View style={[styles.container, isSelf && styles.containerSelf]}>
            <Avatar src={message.from.avatar} size={44} />
            <View style={[styles.info, isSelf && styles.infoSelf]}>
                <View style={[styles.nickTime, isSelf && styles.nickTimeSelf]}>
                    {!!message.from.tag && (
                        <View
                            style={[
                                styles.tag,
                                { backgroundColor: getRandomColor(message.from.tag) },
                            ]}
                        >
                            <Text style={styles.tagText}>{message.from.tag}</Text>
                        </View>
                    )}
                    <Text style={[styles.nick, isSelf ? styles.nickSelf : styles.nickOther]}>
                        {message.from.username}
                    </Text>
                    <Text style={[styles.time, isSelf && styles.timeSelf]}>{formatTime()}</Text>
                </View>
                {isSelf || message.from._id === self ? (
                    <MessageMenu linkmanId={linkman!._id} messageId={message._id}>
                        <View
                            style={[
                                styles.content,
                                { backgroundColor: isSelf ? primaryColor8 : 'white' },
                            ]}
                        >
                            {renderContent()}
                        </View>
                    </MessageMenu>
                ) : (
                    <View
                        style={[
                            styles.content,
                            { backgroundColor: isSelf ? primaryColor8 : 'white' },
                        ]}
                    >
                        {renderContent()}
                    </View>
                )}
                <View
                    style={[styles.triangle, isSelf ? styles.triangleSelf : styles.triangleOther]}
                >
                    <Triangle
                        type="isosceles"
                        mode={isSelf ? 'right' : 'left'}
                        base={10}
                        height={5}
                        color={isSelf ? primaryColor8 : 'white'}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
    },
    containerSelf: {
        flexDirection: 'row-reverse',
    },
    info: {
        position: 'relative',
        marginLeft: 8,
        marginRight: 8,
        maxWidth: ScreenWidth - 120,
    },
    infoSelf: {
        alignItems: 'flex-end',
    },
    nickTime: {
        flexDirection: 'row',
    },
    nickTimeSelf: {
        flexDirection: 'row-reverse',
    },
    nick: {
        fontSize: 13,
        color: '#333',
    },
    nickSelf: {
        marginRight: 4,
    },
    nickOther: {
        marginLeft: 4,
    },
    time: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    timeSelf: {
        marginRight: 4,
    },
    content: {
        marginTop: 2,
        borderRadius: 6,
        padding: 5,
        paddingLeft: 8,
        paddingRight: 8,
        backgroundColor: 'white',
        minHeight: 26,
        minWidth: 20,
    },
    notSupport: {
        color: '#73b668',
    },
    triangle: {
        position: 'absolute',
        top: 25,
    },
    triangleSelf: {
        right: -5,
    },
    triangleOther: {
        left: -5,
    },
    tag: {
        height: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 3,
        paddingRight: 3,
        borderRadius: 3,
    },
    tagText: {
        fontSize: 11,
        color: 'white',
    },
});
