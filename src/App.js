import React from 'react';
import { StyleSheet, View, AsyncStorage, Alert } from 'react-native';
import { Provider } from 'react-redux';
import { Scene, Router } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { Root } from 'native-base';
import { Updates } from 'expo';

import socket from './socket';
import fetch from '../utils/fetch';
import action from './state/action';
import store from './state/store';
import convertRobot10Message from '../utils/convertRobot10Message';
import getFriendId from '../utils/getFriendId';
import platform from '../utils/platform';
import packageInfo from '../package';

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
    if (linkman) {
        action.addLinkmanMessage(message.to, message);
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

        fetch('getLinkmanHistoryMessages', { linkmanId: newLinkman._id }).then(([err, res]) => {
            if (!err) {
                action.addLinkmanMessages(newLinkman._id, res);
            }
        });
    }
});

export default class App extends React.Component {
    static propTypes = {
        title: PropTypes.string,
    }
    static async updateVersion() {
        if (process.env.NODE_ENV === 'development') {
            return;
        }

        const result = await Updates.fetchUpdateAsync();
        if (result.isNew) {
            Updates.reload();
        } else {
            Alert.alert('提示', '当前版本已经是最新了');
        }
    }
    render() {
        return (
            <Provider store={store}>
                <Root>
                    <Router>
                        <View style={styles.container}>
                            <Scene key="test" component={Test} title="测试页面" />
                            <Scene key="chatlist" component={ChatList} title="消息" onRight={App.updateVersion} rightTitle={`v${packageInfo.version}`} initial />
                            <Scene key="chat" component={Chat} title="聊天" getTitle={this.props.title} />
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

