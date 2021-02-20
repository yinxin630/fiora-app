export const ConnectActionType = 'SetConnect';
export type ConnectAction = {
    type: typeof ConnectActionType;
    value: boolean;
};

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

export const SetGuestActionType = 'SetGuest';
export type SetGuestAction = {
    type: typeof SetGuestActionType;
    linkmans: Linkman[];
};

export const LogoutActionType = 'Logout';
export type LogoutAction = {
    type: typeof LogoutActionType;
};

export const UpdateUserPropertyActionType = 'UpdateUserProperty';
export type UpdateUserPropertyAction = {
    type: typeof UpdateUserPropertyActionType;
    key: keyof User;
    value: any;
};

export const AddlinkmanMessageActionType = 'AddlinkmanMessage';
export type AddlinkmanMessageAction = {
    type: typeof AddlinkmanMessageActionType;
    linkmanId: string;
    message: Message;
};

export const AddLinkmanHistoryMessagesActionType = 'AddLinkmanHistoryMessages';
export type AddLinkmanHistoryMessagesAction = {
    type: typeof AddLinkmanHistoryMessagesActionType;
    linkmanId: string;
    messages: Message[];
};

export const UpdateSelfMessageActionType = 'UpdateSelfMessageActionType';
export type UpdateSelfMessageAction = {
    type: typeof UpdateSelfMessageActionType;
    linkmanId: string;
    messageId: string;
    message: Message;
};

export const SetFocusActionType = 'SetFocus';
export type SetFocusAction = {
    type: typeof SetFocusActionType;
    linkmanId: string;
};

export const UpdateGroupPropertyActionType = 'UpdateGroupProperty';
export type UpdateGroupPropertyAction = {
    type: typeof UpdateGroupPropertyActionType;
    groupId: string;
    key: keyof Group;
    value: any;
};

export const UpdateFriendPropertyActionType = 'UpdateFriendProperty';
export type UpdateFriendPropertyAction = {
    type: typeof UpdateFriendPropertyActionType;
    userId: string;
    key: keyof Group;
    value: any;
};

export const AddLinkmanActionType = 'AddLinkman';
export type AddLinkmanAction = {
    type: typeof AddLinkmanActionType;
    linkman: Linkman;
    focus: boolean;
};

export const RemoveLinkmanActionType = 'RemoveLinkmanActionType';
export type RemoveLinkmanAction = {
    type: typeof RemoveLinkmanActionType;
    linkmanId: string;
};

export const SetFriendActionType = 'SetFriend';
export type SetFriendAction = {
    type: typeof SetFriendActionType;
    linkmanId: string;
    from: Friend['from'];
    to: Friend['to'];
};

export const UpdateUIPropertyActionType = 'UpdateUIPropertyActionType';
export type UpdateUIPropertyAction = {
    type: typeof UpdateUIPropertyActionType;
    key: keyof State['ui'];
    value: any;
};

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
    | UpdateFriendPropertyAction
    | LogoutAction;

export type Message = {
    _id: string;
    type: string;
    content: string;
    createTime: number;
    percent?: number;
    loading?: boolean;
    from: {
        _id: string;
        username: string;
        avatar: string;
        tag: string;
        originUsername?: string;
    };
};

export type Group = {
    _id: string;
    type: 'group';
    name: string;
    avatar: string;
    messages: Message[];
    unread: number;
    members: {}[];
    createTime: number;
};

export type Friend = {
    _id: string;
    type: 'friend';
    name: string;
    avatar: string;
    from: string;
    to: {
        _id: string;
        avatar: string;
        username: string;
    };
    messages: Message[];
    unread: number;
    createTime: number;
    isOnline?: boolean;
};

export type Linkman = Group | Friend;

export type User = {
    _id: string;
    username: string;
    avatar: string;
    tag: string;
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
        primaryColor: string;
        primaryTextColor: string;
    };
};
