import React from 'react';
import { StyleSheet, View, AsyncStorage } from 'react-native';
import { Provider } from 'react-redux';
import { Scene, Router } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { Root, Toast } from 'native-base';

import socket from './socket';
import fetch from '../utils/fetch';
import action from './state/action';
import store from './state/store';
import convertRobot10Message from '../utils/convertRobot10Message';
import getFriendId from '../utils/getFriendId';
import platform from '../utils/platform';

import ChatList from './pages/ChatList/ChatList';
import Chat from './pages/Chat/Chat';
import Login from './pages/LoginSignup/Login';
import Signup from './pages/LoginSignup/Signup';
import Test from './pages/test';

async function guest() {
    const [err, res] = await fetch('guest', {
        os: platform.os.family,
        browser: platform.name,
        environment: platform.description,
    });
    if (!err) {
        action.setGuest(res);
        Toast.show({
            text: '游客',
        });
    }
}

socket.on('connect', async () => {
    // await AsyncStorage.setItem('token', '');
    const token = await AsyncStorage.getItem('token');

    if (token) {
        const [err, res] = await fetch('loginByToken', Object.assign({
            token,
        }, platform), { toast: false });
        if (err) {
            guest();
        } else {
            action.setUser(res);
            Toast.show({
                text: res.username,
            });
        }
    } else {
        guest();
    }
});
socket.on('disconnect', () => {
    action.disconnect();
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
                <Root>
                    <Router>
                        <View style={styles.container}>
                            <Scene key="test" component={Test} title="测试页面" />
                            <Scene key="chatlist" component={ChatList} title="消息" initial />
                            <Scene key="chat" component={Chat} getTitle={this.props.title} />
                            <Scene key="login" component={Login} title="登录" backTitle="返回聊天" />
                            <Scene key="signup" component={Signup} title="注册" backTitle="返回聊天" />
                        </View>
                    </Router>
                </Root>
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

