import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Scene, Router, Stack, Tabs, Modal, Lightbox } from 'react-native-router-flux';
import { Icon, Root, Text } from 'native-base';

import socket from './socket';
import fetch from './utils/fetch';
import action from './state/action';
import store from './state/store';
import convertMessage from './utils/convertMessage';
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
import { connect } from 'react-redux';
import SelfInfo from './pages/ChatList/SelfInfo';

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
        convertMessage(message);

        const state = store.getState() as State;
        const linkman = state.user!.linkmans.find((x) => x._id === message.to);
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
                    action.addLinkmanHistoryMessages(newLinkman._id, res);
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

    socket.connect();
})();

type Props = {
    title: string;
    primaryColor: string;
    isLogin: boolean;
};

function App({ title, primaryColor, isLogin }: Props) {
    const primaryColor10 = `rgba(${primaryColor}, 1)`;
    const primaryColor8 = `rgba(${primaryColor}, 0.8)`;

    return (
        <View style={styles.container}>
            <Root>
                <Router>
                    <Stack hideNavBar>
                        <Lightbox>
                            <Tabs
                                key="tabs"
                                hideNavBar
                                tabBarStyle={{ backgroundColor: primaryColor8, borderTopWidth: 0 }}
                                showLabel={false}
                            >
                                <Scene
                                    key="chatlist"
                                    component={ChatList}
                                    initial
                                    hideNavBar={!isLogin}
                                    icon={({ focused }) => (
                                        <Icon
                                            name="chatbubble-ellipses-outline"
                                            style={{
                                                fontSize: 24,
                                                color: focused ? 'white' : '#bbb',
                                            }}
                                        />
                                    )}
                                    renderLeftButton={() => <SelfInfo />}
                                    navigationBarStyle={{
                                        backgroundColor: primaryColor10,
                                        borderBottomWidth: 0,
                                    }}
                                />
                                <Scene
                                    key="other"
                                    component={Other}
                                    hideNavBar
                                    title="其它"
                                    icon={({ focused }) => (
                                        <Icon
                                            name="aperture-outline"
                                            style={{
                                                fontSize: 24,
                                                color: focused ? 'white' : '#bbb',
                                            }}
                                        />
                                    )}
                                />
                            </Tabs>
                        </Lightbox>
                        <Scene
                            key="chat"
                            component={Chat}
                            title="聊天"
                            getTitle={title}
                            hideNavBar={false}
                            navigationBarStyle={{
                                backgroundColor: primaryColor10,
                                borderBottomWidth: 0,
                            }}
                            navBarButtonColor="#f9f9f9"
                            backTitle="返回"
                        />
                        <Scene key="login" component={Login} title="登录" hideNavBar={false} />
                        <Scene key="signup" component={Signup} title="注册" hideNavBar={false} />
                        <Scene key="test" component={Test} title="测试页面2" tabs={false} />
                    </Stack>
                </Router>
            </Root>

            <Loading />
        </View>
    );
}

export default connect((state: State) => ({
    primaryColor: state.ui.primaryColor,
    isLogin: !!(state.user as User)?._id,
}))(App);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
