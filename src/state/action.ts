import fetch from '../utils/fetch';
import convertRobot10Message from '../utils/convertRobot10Message';
import getFriendId from '../utils/getFriendId';
import store from './store';
import { Friend, Group, Linkman, Message, State, User } from './reducer';

const { dispatch } = store;

export const ConnectActionType = 'SetConnect';
export type ConnectAction = {
    type: typeof ConnectActionType;
    value: boolean;
};
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

/* ===== 用户 ===== */
export const SetUserActionType = 'SetUser';
export type SetUserAction = {
    type: typeof SetUserActionType;
    user: User;
};
export const SetLinkmanMessagesActionType = 'SetLinkmanMessages';
export type SetLinkmanMessagesAction = {
    type: typeof SetLinkmanMessagesActionType;
    messages: { [linkmanId: string]: Message[] };
};
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

export const SetGuestActionType = 'SetGuest';
export type SetGuestAction = {
    type: typeof SetGuestActionType;
    linkmans: Linkman[];
};
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

export const LogoutActionType = 'Logout';
export type LogoutAction = {
    type: typeof LogoutActionType;
};
function logout() {
    dispatch({
        type: LogoutActionType,
    });
}

export const UpdateUserPropertyActionType = 'UpdateUserProperty';
export type UpdateUserPropertyAction = {
    type: typeof UpdateUserPropertyActionType;
    key: keyof User;
    value: any;
};
function setAvatar(avatar: string) {
    // @ts-expect-error
    dispatch({
        type: UpdateUserPropertyActionType,
        key: 'avatar',
        value: avatar,
    } as UpdateUserPropertyAction);
}

export const AddlinkmanMessageActionType = 'AddlinkmanMessage';
export type AddlinkmanMessageAction = {
    type: typeof AddlinkmanMessageActionType;
    linkmanId: string;
    message: Message;
};
function addLinkmanMessage(linkmanId: string, message: Message) {
    dispatch({
        type: AddlinkmanMessageActionType,
        linkmanId,
        message,
    } as AddlinkmanMessageAction);
}

export const AddLinkmanHistoryMessagesActionType = 'AddLinkmanHistoryMessages';
export type AddLinkmanHistoryMessagesAction = {
    type: typeof AddLinkmanHistoryMessagesActionType;
    linkmanId: string;
    messages: Message[];
};
function addLinkmanMessages(linkmanId: string, messages: Message[]) {
    dispatch({
        type: AddLinkmanHistoryMessagesActionType,
        linkmanId,
        messages,
    } as AddLinkmanHistoryMessagesAction);
}

export const UpdateSelfMessageActionType = 'UpdateSelfMessageActionType';
export type UpdateSelfMessageAction = {
    type: typeof UpdateSelfMessageActionType;
    linkmanId: string;
    messageId: string;
    message: Message;
};
function updateSelfMessage(linkmanId: string, messageId: string, message: Message) {
    dispatch({
        type: UpdateSelfMessageActionType,
        linkmanId,
        messageId,
        message,
    } as UpdateSelfMessageAction);
}

/* ===== 联系人 ===== */
export const SetFocusActionType = 'SetFocus';
export type SetFocusAction = {
    type: typeof SetFocusActionType;
    linkmanId: string;
};
function setFocus(linkmanId: string) {
    dispatch({
        type: 'SetFocus',
        linkmanId,
    } as SetFocusAction);
}

export const UpdateGroupPropertyActionType = 'UpdateGroupProperty';
export type UpdateGroupPropertyAction = {
    type: typeof UpdateGroupPropertyActionType;
    groupId: string;
    key: keyof Group;
    value: any;
};
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

export const AddLinkmanActionType = 'AddLinkman';
export type AddLinkmanAction = {
    type: typeof AddLinkmanActionType;
    linkman: Linkman;
    focus: boolean;
};
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

export const RemoveLinkmanActionType = 'RemoveLinkmanActionType';
export type RemoveLinkmanAction = {
    type: typeof RemoveLinkmanActionType;
    linkmanId: string;
};
function removeLinkman(linkmanId: string) {
    dispatch({
        type: RemoveLinkmanActionType,
        linkmanId,
    } as RemoveLinkmanAction);
}

export const SetFriendActionType = 'SetFriend';
export type SetFriendAction = {
    type: typeof SetFriendActionType;
    linkmanId: string;
    from: Friend['from'];
    to: Friend['to'];
};
function setFriend(linkmanId: string, from: Friend['from'], to: Friend['to']) {
    dispatch({
        type: 'SetFriend',
        linkmanId,
        from,
        to,
    } as SetFriendAction);
}

/* ====== UI ====== */
export const UpdateUIPropertyActionType = 'UpdateUIPropertyActionType';
export type UpdateUIPropertyAction = {
    type: typeof UpdateUIPropertyActionType;
    key: keyof State['ui'];
    value: any;
};
function loading(text: string) {
    dispatch({
        type: UpdateUIPropertyActionType,
        key: 'loading',
        value: text,
    } as UpdateUIPropertyAction);
}

export type ActionTypes =
    | ConnectAction
    | SetUserAction
    | SetLinkmanMessagesAction
    | UpdateGroupPropertyAction
    | SetGuestAction
    | SetFocusAction
    | SetFriendAction
    | AddLinkmanAction
    | RemoveLinkmanAction
    | AddlinkmanMessageAction
    | AddLinkmanHistoryMessagesAction
    | UpdateSelfMessageAction
    | UpdateUserPropertyAction
    | UpdateUIPropertyAction
    | LogoutAction;

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
