import fetch from '../utils/fetch';
import convertRobot10Message from '../utils/convertRobot10Message';
import getFriendId from '../utils/getFriendId';
import store from './store';
import { ConnectActionType, ConnectAction, Friend, SetUserActionType, SetUserAction, SetLinkmanMessagesAction, SetGuestActionType, SetGuestAction, LogoutActionType, UpdateUserPropertyActionType, UpdateUserPropertyAction, AddlinkmanMessageActionType, AddlinkmanMessageAction, AddLinkmanHistoryMessagesActionType, AddLinkmanHistoryMessagesAction, UpdateSelfMessageActionType, UpdateSelfMessageAction, SetFocusAction, UpdateGroupPropertyActionType, UpdateGroupPropertyAction, AddLinkmanAction, RemoveLinkmanActionType, RemoveLinkmanAction, SetFriendAction, UpdateUIPropertyActionType, UpdateUIPropertyAction, Group, Message, Linkman } from '../types/redux';

const { dispatch } = store;

function connect() {
    dispatch({
        type: ConnectActionType,
        value: true,
    } as ConnectAction);
}
function disconnect() {
    dispatch({
        type: ConnectActionType,
        value: false,
    } as ConnectAction);
}

async function setUser(user: any) {
    user.groups.forEach((group: Group) => {
        Object.assign(group, {
            type: 'group',
            unread: 0,
            messages: [],
            members: [],
        });
    });
    user.friends.forEach((friend: Friend) => {
        Object.assign(friend, {
            type: 'friend',
            _id: getFriendId(friend.from, friend.to._id),
            messages: [],
            unread: 0,
            avatar: friend.to.avatar,
            name: friend.to.username,
            to: friend.to._id,
        });
    });

    const linkmans = [...user.groups, ...user.friends];
    dispatch({
        type: SetUserActionType,
        user: {
            _id: user._id,
            avatar: user.avatar,
            username: user.username,
            linkmans,
        },
    } as SetUserAction);

    const linkmanIds = [
        ...user.groups.map((g: Group) => g._id),
        ...user.friends.map((f: Friend) => f._id),
    ];
    const [err, messages] = await fetch<{ [linkmanId: string]: Message[] }>(
        'getLinkmansLastMessages',
        { linkmans: linkmanIds },
    );
    for (const key in messages) {
        messages[key].forEach((m) => convertRobot10Message(m));
    }
    if (!err) {
        dispatch({
            type: 'SetLinkmanMessages',
            messages,
        } as SetLinkmanMessagesAction);
    }
}
async function setGuest(defaultGroup: Group) {
    defaultGroup.messages.forEach((m) => convertRobot10Message(m));
    dispatch({
        type: SetGuestActionType,
        linkmans: [
            Object.assign(defaultGroup, {
                type: 'group',
                unread: 0,
                members: [],
            }),
        ],
    } as SetGuestAction);
}
function logout() {
    dispatch({
        type: LogoutActionType,
    });
}
function setAvatar(avatar: string) {
    // @ts-expect-error
    dispatch({
        type: UpdateUserPropertyActionType,
        key: 'avatar',
        value: avatar,
    } as UpdateUserPropertyAction);
}

function addLinkmanMessage(linkmanId: string, message: Message) {
    dispatch({
        type: AddlinkmanMessageActionType,
        linkmanId,
        message,
    } as AddlinkmanMessageAction);
}
function addLinkmanMessages(linkmanId: string, messages: Message[]) {
    dispatch({
        type: AddLinkmanHistoryMessagesActionType,
        linkmanId,
        messages,
    } as AddLinkmanHistoryMessagesAction);
}
function updateSelfMessage(linkmanId: string, messageId: string, message: Message) {
    dispatch({
        type: UpdateSelfMessageActionType,
        linkmanId,
        messageId,
        message,
    } as UpdateSelfMessageAction);
}

function setFocus(linkmanId: string) {
    dispatch({
        type: 'SetFocus',
        linkmanId,
    } as SetFocusAction);
}
function setGroupMembers(groupId: string, members: Group['members']) {
    dispatch({
        type: UpdateGroupPropertyActionType,
        groupId,
        key: 'members',
        value: members,
    } as UpdateGroupPropertyAction);
}
function setGroupAvatar(groupId: string, avatar: string) {
    dispatch({
        type: UpdateGroupPropertyActionType,
        groupId,
        key: 'avatar',
        value: avatar,
    });
}
function addLinkman(linkman: Linkman, focus = false) {
    if (linkman.type === 'group') {
        linkman.members = [];
        linkman.messages = [];
        linkman.unread = 0;
    }
    dispatch({
        type: 'AddLinkman',
        linkman,
        focus,
    } as AddLinkmanAction);
}
function removeLinkman(linkmanId: string) {
    dispatch({
        type: RemoveLinkmanActionType,
        linkmanId,
    } as RemoveLinkmanAction);
}
function setFriend(linkmanId: string, from: Friend['from'], to: Friend['to']) {
    dispatch({
        type: 'SetFriend',
        linkmanId,
        from,
        to,
    } as SetFriendAction);
}

function loading(text: string) {
    dispatch({
        type: UpdateUIPropertyActionType,
        key: 'loading',
        value: text,
    } as UpdateUIPropertyAction);
}

export default {
    setUser,
    setGuest,
    connect,
    disconnect,
    logout,
    setAvatar,

    setFocus,
    setGroupMembers,
    setGroupAvatar,
    addLinkman,
    removeLinkman,
    setFriend,

    addLinkmanMessage,
    addLinkmanMessages,
    updateSelfMessage,

    loading,
};
