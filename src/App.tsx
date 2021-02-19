import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { Scene, Router, Stack, Tabs, Modal } from 'react-native-router-flux';
import { Root } from 'native-base';

import socket from './socket';
import fetch from './utils/fetch';
import action from './state/action';
import store from './state/store';
import convertRobot10Message from './utils/convertRobot10Message';
import getFriendId from './utils/getFriendId';
import platform from './utils/platform';
import { getStorageValue } from './utils/storage';

import ChatList from './pages/ChatList/ChatList';
import Chat from './pages/Chat/Chat';
import Login from './pages/LoginSignup/Login';
import Signup from './pages/LoginSignup/Signup';
import Test from './pages/test';

import Loading from './components/Loading';
import Other from './pages/Other/Other';
import { State, User } from './types/redux';

async function guest() {
    const [err, res] = await fetch('guest', {});
    if (!err) {
        action.setGuest(res);
    }
    action.loading('');
}

(async function initSocketEvents() {
    let hasShowAlert = false;
    socket.on('connect', async () => {
        action.connect();
        hasShowAlert = false;
        action.loading('登录中...');

        const token = await getStorageValue('token');

        if (token) {
            const [err, res] = await fetch(
                'loginByToken',
                Object.assign(
                    {
                        token,
                    },
                    platform,
                ),
                { toast: false },
            );
            if (err) {
                guest();
            } else {
                action.setUser(res);
                action.loading('');
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

        const state = store.getState() as State;
        const linkman = state.user!.linkmans.find(x => x._id === message.to);
        if (linkman) {
            action.addLinkmanMessage(message.to, message);
        } else {
            const newLinkman = {
                _id: getFriendId((state.user as User)._id, message.from._id),
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
    socket.on('connect_error', () => {
        if (!hasShowAlert) {
            action.loading('');
            alert('连接服务端失败, 无网络或者服务端地址错误');
            hasShowAlert = true;
        }
    });
}());

type Props = {
    title: string;
}

export default function App({ title }: Props) {
    useEffect(() => {
        (async () => {
            const host = await getStorageValue('host');
            socket.connect(host);
        })();
    }, []);

    return (
        <Provider store={store}>
            <View style={styles.container}>
                <Root>
                    <Router>
                        <Modal>
                            <Stack hideNavBar>
                                <Tabs key="tabs" hideNavBar>
                                    <Scene
                                        key="chatlist"
                                        component={ChatList}
                                        initial
                                        hideNavBar
                                        title="消息"
                                        icon={() => <Text>icon</Text>}
                                    />
                                    <Scene
                                        key="other"
                                        component={Other}
                                        hideNavBar
                                        title="其它"
                                        icon={() => <Text>icon</Text>}
                                    />
                                </Tabs>
                                <Scene
                                    key="chat"
                                    component={Chat}
                                    title="聊天"
                                    getTitle={title}
                                    hideNavBar={false}
                                />
                                <Scene
                                    key="login"
                                    component={Login}
                                    title="登录"
                                    hideNavBar={false}
                                />
                                <Scene
                                    key="signup"
                                    component={Signup}
                                    title="注册"
                                    hideNavBar={false}
                                />
                                <Scene key="test" component={Test} title="测试页面2" tabs={false} />
                            </Stack>
                        </Modal>
                    </Router>
                </Root>

                <Loading />
            </View>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
