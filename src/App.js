import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { Scene, Router } from 'react-native-router-flux';
import PropTypes from 'prop-types';

import socket from './socket';
import fetch from '../utils/fetch';
import action from './state/action';
import store from './state/store';
import platform from '../utils/platform';
import convertRobot10Message from '../utils/convertRobot10Message';
import getFriendId from '../utils/getFriendId';

import ChatList from './pages/ChatList/ChatList';
import Chat from './pages/Chat/Chat';
import Test from './pages/test';


socket.on('connect', async () => {
    console.log('connect');

    const [err, res] = await fetch('login', Object.assign({
        username: 'a',
        password: 'a',
    }, platform));
    if (!err) {
        console.log(res);
        action.setUser(res);
    }
});
socket.on('disconnect', () => {
    console.log('disconnect');
});
socket.on('message', (message) => {
    // robot10
    convertRobot10Message(message);

    const state = store.getState();
    const linkman = state.getIn(['user', 'linkmans']).find(l => l.get('_id') === message.to);
    let title = '';
    if (linkman) {
        action.addLinkmanMessage(message.to, message);
        if (linkman.get('type') === 'group') {
            title = `${message.from.username} 在 ${linkman.get('name')} 对大家说:`;
        } else {
            title = `${message.from.username} 对你说:`;
        }
    } else {
        const newLinkman = {
            _id: getFriendId(
                state.getIn(['user', '_id']),
                message.from._id,
            ),
            type: 'temporary',
            createTime: Date.now(),
            avatar: message.from.avatar,
            name: message.from.username,
            messages: [],
            unread: 1,
        };
        action.addLinkman(newLinkman);
        title = `${message.from.username} 对你说:`;

        fetch('getLinkmanHistoryMessages', { linkmanId: newLinkman._id }).then(([err, res]) => {
            if (!err) {
                action.addLinkmanMessages(newLinkman._id, res);
            }
        });
    }

    console.log('消息通知', {
        title,
        image: message.from.avatar,
        content: message.type === 'text' ? message.content : `[${message.type}]`,
        id: Math.random(),
    });
});

export default class App extends React.Component {
    static propTypes = {
        title: PropTypes.string,
    }
    render() {
        return (
            <Provider store={store}>
                <Router>
                    <View style={styles.container}>
                        <Scene key="test" component={Test} title="测试页面" />
                        <Scene key="chatlist" component={ChatList} title="消息" initial />
                        <Scene key="chat" component={Chat} getTitle={this.props.title} />
                    </View>
                </Router>
            </Provider>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

