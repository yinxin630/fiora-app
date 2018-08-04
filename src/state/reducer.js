import immutable from 'immutable';

const initialState = immutable.fromJS({
    user: null,
    focus: '',
    connect: true,
    ui: {
        loading: '', // 全局loading文本内容, 为空则不展示
    },
});


function reducer(state = initialState, action) {
    switch (action.type) {
    case 'Logout': {
        const newState = initialState;
        return newState;
    }
    case 'SetDeepValue': {
        return state.setIn(action.keys, immutable.fromJS(action.value));
    }

    case 'SetUser': {
        let newState = state;
        if (state.getIn(['user', '_id']) === undefined) {
            newState = newState
                .set('user', immutable.fromJS(action.user))
                .set('focus', state.get('focus') || action.user.linkmans[0]._id);
        } else {
            newState = newState.updateIn(['user', 'linkmans'], (linkmans) => {
                let newLinkmans = linkmans;
                action.user.linkmans.forEach((linkman) => {
                    const index = linkmans.findIndex(l => l.get('_id') === linkman._id);
                    if (index === -1) {
                        newLinkmans = newLinkmans.push(immutable.fromJS(linkman));
                    }
                });
                newLinkmans.forEach((linkman, linkmanIndex) => {
                    const index = action.user.linkmans.findIndex(l => l._id === linkman.get('_id'));
                    if (index === -1) {
                        newLinkmans = newLinkmans.splice(linkmanIndex, 1);
                    }
                });
                return newLinkmans;
            });

            const focusIndex = newState.getIn(['user', 'linkmans']).findIndex(l => l.get('_id') === newState.get('focus'));
            if (focusIndex === -1) {
                newState = newState.set('focus', newState.getIn(['user', 'linkmans', 0, '_id']));
            }
        }
        return newState;
    }
    case 'SetLinkmanMessages': {
        const newLinkmans = state
            .getIn(['user', 'linkmans'])
            .map(linkman => (
                linkman.set('messages', immutable.fromJS(action.messages[linkman.get('_id')]))
            ))
            .sort((linkman1, linkman2) => {
                const messages1 = linkman1.get('messages');
                const messages2 = linkman2.get('messages');
                const time1 = messages1.size > 0 ? messages1.get(messages1.size - 1).get('createTime') : linkman1.get('createTime');
                const time2 = messages2.size > 0 ? messages2.get(messages2.size - 1).get('createTime') : linkman2.get('createTime');
                return new Date(time1) < new Date(time2);
            });
        return state
            .setIn(['user', 'linkmans'], newLinkmans)
            .set('focus', state.get('focus') || newLinkmans.getIn([0, '_id']));
    }
    case 'SetGroupMembers': {
        const linkmanIndex = state
            .getIn(['user', 'linkmans'])
            .findIndex(l => l.get('_id') === action.groupId);
        return state.setIn(['user', 'linkmans', linkmanIndex, 'members'], immutable.fromJS(action.members));
    }
    case 'SetGroupAvatar': {
        const linkmanIndex = state
            .getIn(['user', 'linkmans'])
            .findIndex(l => l.get('_id') === action.groupId);
        return state.setIn(['user', 'linkmans', linkmanIndex, 'avatar'], action.avatar);
    }
    case 'SetFocus': {
        const linkmanIndex = state
            .getIn(['user', 'linkmans'])
            .findIndex(l => l.get('_id') === action.linkmanId);
        return state
            .set('focus', action.linkmanId)
            .setIn(['user', 'linkmans', linkmanIndex, 'unread'], 0);
    }
    case 'SetFriend': {
        const linkmanIndex = state
            .getIn(['user', 'linkmans'])
            .findIndex(l => l.get('_id') === action.linkmanId);
        return state
            .updateIn(['user', 'linkmans', linkmanIndex], linkman => (
                linkman
                    .set('type', 'friend')
                    .set('from', action.from)
                    .set('to', action.to)
                    .set('unread', 0)
            ))
            .set('focus', action.linkmanId);
    }

    case 'AddLinkman': {
        const newState = state.updateIn(['user', 'linkmans'], linkmans => (
            linkmans.unshift(immutable.fromJS(action.linkman))
        ));
        if (action.focus) {
            return newState.set('focus', action.linkman._id);
        }
        return newState;
    }
    case 'RemoveLinkman': {
        const linkmanIndex = state
            .getIn(['user', 'linkmans'])
            .findIndex(l => l.get('_id') === action.linkmanId);
        const newState = state.updateIn(['user', 'linkmans'], linkmans => (
            linkmans.delete(linkmanIndex)
        ));
        return newState.set('focus', newState.getIn(['user', 'linkmans', 0, '_id']));
    }
    case 'AddLinkmanMessage': {
        const linkmanIndex = state
            .getIn(['user', 'linkmans'])
            .findIndex(l => l.get('_id') === action.linkmanId);
        const linkman = state.getIn(['user', 'linkmans', linkmanIndex]);
        let unread = 0;
        if (state.get('focus') !== linkman.get('_id')) {
            unread = linkman.get('unread') + 1;
        }
        return state
            .updateIn(['user', 'linkmans'], linkmans => (
                linkmans
                    .delete(linkmanIndex)
                    .unshift(linkman
                        .update('messages', (messages) => {
                            const newMessages = messages.push(immutable.fromJS(action.message));
                            if (
                                action.message.from === state.getIn(['user', '_id']) &&
                                 newMessages.size > 300
                            ) {
                                return newMessages.splice(0, 200);
                            }
                            return newMessages;
                        })
                        .set('unread', unread))
            ));
    }
    case 'AddLinkmanMessages': {
        const linkmanIndex = state
            .getIn(['user', 'linkmans'])
            .findIndex(l => l.get('_id') === action.linkmanId);
        return state
            .updateIn(['user', 'linkmans', linkmanIndex], l => (
                l.update('messages', messages => (
                    immutable.fromJS(action.messages).concat(messages)
                ))
            ));
    }

    case 'UpdateSelfMessage': {
        const linkmanIndex = state
            .getIn(['user', 'linkmans'])
            .findIndex(l => l.get('_id') === action.linkmanId);
        return state.updateIn(['user', 'linkmans', linkmanIndex, 'messages'], (messages) => {
            const messageIndex = messages.findLastIndex(m => m.get('_id') === action.messageId);
            return messages.update(messageIndex, message => message.mergeDeep(immutable.fromJS(action.message)));
        });
    }
    case 'SetAvatar': {
        const userId = state.getIn(['user', '_id']);
        return state
            .setIn(['user', 'avatar'], action.avatar)
            .updateIn(['user', 'linkmans'], linkmans => (
                linkmans.map(l => (
                    l.update('messages', messages => (
                        messages.map((message) => {
                            if (message.getIn(['from', '_id']) === userId) {
                                return message.setIn(['from', 'avatar'], action.avatar);
                            }
                            return message;
                        })
                    ))
                ))
            ));
    }

    default:
        return state;
    }
}

export default reducer;
