import produce from 'immer';
import {
    ActionTypes,
    ConnectActionType,
    LogoutActionType,
    UpdateGroupPropertyActionType,
    SetGuestActionType,
    SetLinkmanMessagesActionType,
    SetUserActionType,
    SetFocusActionType,
    SetFriendActionType,
    AddLinkmanActionType,
    RemoveLinkmanActionType,
    AddlinkmanMessageActionType,
    AddLinkmanHistoryMessagesActionType,
    UpdateSelfMessageActionType,
    UpdateUserPropertyActionType,
    UpdateUIPropertyActionType,
} from './action';

export type Message = {
    _id: string;
    type: string;
    content: string;
    createTime: number;
};

export type Group = {
    _id: string;
    type: 'group';
    messages: Message[];
    unread: number;
    members: {}[];
    createTime: number;
};

export type Friend = {
    _id: string;
    type: 'friend';
    from: string;
    to: {
        _id: string;
        avatar: string;
        username: string;
    };
    messages: Message[];
    unread: number;
    createTime: number;
};

export type Linkman = Group | Friend;

export type User = {
    _id: string;
    linkmans: Linkman[];
};

export type Guest = {
    linkmans: Linkman[];
};

export type State = {
    user?: User | Guest;
    focus: string;
    connect: boolean;
    ui: {
        loading: string;
    };
};

/**
 * 处理文本消息的html转义字符
 * @param {Object} message 消息
 */
function convertMessageHtml(message: Message) {
    if (message.type === 'text') {
        message.content = message.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }
    return message;
}

const initialState = {
    user: null,
    focus: '',
    connect: true,
    ui: {
        loading: '连接服务器中...', // 全局loading文本内容, 为空则不展示
    },
};

const reducer = produce((state: State, action: ActionTypes) => {
    switch (action.type) {
        case ConnectActionType: {
            state.connect = action.value;
            return state;
        }
        case LogoutActionType: {
            return initialState;
        }
        case SetUserActionType: {
            state.user = action.user;
            if (action.user.linkmans.length > 0) {
                state.focus = action.user.linkmans[0]._id;
            }
            return state;
        }
        case SetGuestActionType: {
            state.user = {
                linkmans: action.linkmans,
            };
            return state;
        }
        case UpdateUserPropertyActionType: {
            // @ts-expect-error
            state!.user[action.key] = action.value;
            return state;
        }
        case SetLinkmanMessagesActionType: {
            state.user!.linkmans.forEach((linkman) => {
                linkman.messages = action.messages[linkman._id].map(convertMessageHtml);
            });
            state.user!.linkmans.sort((linkman1, linkman2) => {
                const lastMessageTime1 =
                    linkman1.messages.length > 0
                        ? linkman1.messages[linkman1.messages.length - 1].createTime
                        : linkman1.createTime;
                const lastMessageTime2 =
                    linkman2.messages.length > 0
                        ? linkman2.messages[linkman2.messages.length - 1].createTime
                        : linkman2.createTime;
                return new Date(lastMessageTime1) < new Date(lastMessageTime2) ? 1 : -1;
            });
            if (!state.focus && state.user!.linkmans.length > 0) {
                state.focus = state.user!.linkmans[0]._id;
            }
            return state;
        }
        case UpdateGroupPropertyActionType: {
            const group = state.user!.linkmans.find(
                (linkman) => linkman.type === 'group' && linkman._id === action.groupId,
            ) as Group;
            if (group) {
                // @ts-expect-error
                group[action.key] = action.value;
            }
            return state;
        }
        case SetFocusActionType: {
            const targetLinkman = state.user!.linkmans.find(
                (linkman) => linkman._id === action.linkmanId,
            );
            if (targetLinkman) {
                state.focus = action.linkmanId;
                targetLinkman.unread = 0;
            }
            return state;
        }
        case SetFriendActionType: {
            const friend = state.user!.linkmans.find(
                (linkman) => linkman._id === action.linkmanId,
            ) as Friend;
            if (friend) {
                friend.type = 'friend';
                friend.from = action.from;
                friend.to = action.to;
                friend.unread = 0;
                state.focus = action.linkmanId;
            }
            return state;
        }
        case AddLinkmanActionType: {
            state.user!.linkmans.unshift(action.linkman);
            if (action.focus) {
                state.focus = action.linkman._id;
            }
            return state;
        }
        case RemoveLinkmanActionType: {
            const index = state.user!.linkmans.findIndex(
                (linkman) => linkman._id === action.linkmanId,
            );
            if (index !== -1) {
                state.user!.linkmans.splice(index, 1);
                if (state.focus === action.linkmanId) {
                    state.focus =
                        state.user!.linkmans.length > 0 ? state.user!.linkmans[0]._id : '';
                }
            }
            return state;
        }
        case AddlinkmanMessageActionType: {
            const targetLinkman = state.user!.linkmans.find(
                (linkman) => linkman._id === action.linkmanId,
            );
            if (targetLinkman) {
                if (state.focus !== targetLinkman._id) {
                    targetLinkman.unread += 1;
                }
                targetLinkman.messages.push(convertMessageHtml(action.message));
                if (targetLinkman.messages.length > 500) {
                    targetLinkman.messages.slice(250);
                }
            }
            return state;
        }
        case AddLinkmanHistoryMessagesActionType: {
            const targetLinkman = state.user!.linkmans.find(
                (linkman) => linkman._id === action.linkmanId,
            );
            if (targetLinkman) {
                targetLinkman.messages.unshift(...action.messages.map(convertMessageHtml));
            }
            return state;
        }
        case UpdateSelfMessageActionType: {
            const targetLinkman = state.user!.linkmans.find(
                (linkman) => linkman._id === action.linkmanId,
            );
            if (targetLinkman) {
                const targetMessage = targetLinkman.messages.find(
                    (message) => message._id === action.messageId,
                );
                if (targetMessage) {
                    Object.assign(targetMessage, convertMessageHtml(action.message));
                }
            }
            return state;
        }
        case UpdateUIPropertyActionType: {
            state.ui[action.key] = action.value;
            return state;
        }
        default: {
            return state;
        }
    }
}, initialState);

export default reducer;