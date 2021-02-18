import fetch from '../utils/fetch';
import convertRobot10Message from '../utils/convertRobot10Message';
import getFriendId from '../utils/getFriendId';
import store from './store';

const { dispatch } = store;

/* ===== 用户 ===== */
async function setUser(user) {
    user.groups.forEach((group) => {
        Object.assign(group, {
            type: 'group',
            unread: 0,
            messages: [],
            members: [],
        });
    });
    user.friends.forEach((friend) => {
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
        type: 'SetUser',
        user: {
            _id: user._id,
            avatar: user.avatar,
            username: user.username,
            linkmans,
        },
    });

    connect();

    const linkmanIds = [
        ...user.groups.map(g => g._id),
        ...user.friends.map(f => f._id),
    ];
    const [err, messages] = await fetch('getLinkmansLastMessages', { linkmans: linkmanIds });
    for (const key in messages) {
        messages[key].forEach(m => convertRobot10Message(m));
    }
    if (!err) {
        dispatch({
            type: 'SetLinkmanMessages',
            messages,
        });
    }
}
async function setGuest(defaultGroup) {
    defaultGroup.messages.forEach(m => convertRobot10Message(m));
    dispatch({
        type: 'SetDeepValue',
        keys: ['user'],
        value: { linkmans: [
            Object.assign(defaultGroup, {
                type: 'group',
                unread: 0,
                members: [],
            }),
        ] },
    });
}
function connect() {
    dispatch({
        type: 'SetDeepValue',
        keys: ['connect'],
        value: true,
    });
}
function disconnect() {
    dispatch({
        type: 'SetDeepValue',
        keys: ['connect'],
        value: false,
    });
}
function logout() {
    dispatch({
        type: 'Logout',
    });
}
function setAvatar(avatar) {
    dispatch({
        type: 'SetAvatar',
        avatar,
    });
}

function addLinkmanMessage(linkmanId, message) {
    dispatch({
        type: 'AddLinkmanMessage',
        linkmanId,
        message,
    });
}
function addLinkmanMessages(linkmanId, messages) {
    messages.forEach(m => convertRobot10Message(m));
    dispatch({
        type: 'AddLinkmanMessages',
        linkmanId,
        messages,
    });
}
function updateSelfMessage(linkmanId, messageId, message) {
    dispatch({
        type: 'UpdateSelfMessage',
        linkmanId,
        messageId,
        message,
    });
}

/* ===== 联系人 ===== */
function setFocus(linkmanId) {
    dispatch({
        type: 'SetFocus',
        linkmanId,
    });
}
function setGroupMembers(groupId, members) {
    dispatch({
        type: 'SetGroupMembers',
        groupId,
        members,
    });
}
function setGroupAvatar(groupId, avatar) {
    dispatch({
        type: 'SetGroupAvatar',
        groupId,
        avatar,
    });
}
function addLinkman(linkman, focus = false) {
    if (linkman.type === 'group') {
        linkman.members = [];
        linkman.messages = [];
        linkman.unread = 0;
    }
    dispatch({
        type: 'AddLinkman',
        linkman,
        focus,
    });
}
function removeLinkman(linkmanId) {
    dispatch({
        type: 'RemoveLinkman',
        linkmanId,
    });
}
function setFriend(linkmanId, from, to) {
    dispatch({
        type: 'SetFriend',
        linkmanId,
        from,
        to,
    });
}

/* ====== UI ====== */
function loading(text) {
    dispatch({
        type: 'SetDeepValue',
        keys: ['ui', 'loading'],
        value: text,
    });
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
