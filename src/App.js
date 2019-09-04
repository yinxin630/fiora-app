import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Provider } from 'react-redux';
import { Scene, Router, Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { Root, Toast } from 'native-base';
import { Updates } from 'expo';

import socket from './socket';
import fetch from '../utils/fetch';
import action from './state/action';
import store from './state/store';
import convertRobot10Message from '../utils/convertRobot10Message';
import getFriendId from '../utils/getFriendId';
import platform from '../utils/platform';
import getStorageValue from '../utils/getStorageValue';
import appInfo from '../app';

import ChatList from './pages/ChatList/ChatList';
import Chat from './pages/Chat/Chat';
import Login from './pages/LoginSignup/Login';
import Signup from './pages/LoginSignup/Signup';
import Test from './pages/test';
import Setting from './pages/Setting';

import Loading from './components/Loading';

async function guest() {
    const [err, res] = await fetch('guest', {
        os: platform.os.family,
        browser: platform.name,
        environment: platform.description,
    });
    if (!err) {
        action.setGuest(res);
    }
    action.loading('');
}

socket.onNewInstance((instance) => {
    let hasShowAlert = false;
    instance.on('connect', async () => {
        hasShowAlert = false;
        action.loading('登录中...');

        // await AsyncStorage.setItem('token', '');
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
    instance.on('disconnect', () => {
        action.disconnect();
    });
    instance.on('message', (message) => {
        // robot10
        convertRobot10Message(message);

        const state = store.getState();
        const linkman = state.getIn(['user', 'linkmans']).find(l => l.get('_id') === message.to);
        if (linkman) {
            action.addLinkmanMessage(message.to, message);
        } else {
            const newLinkman = {
                _id: getFriendId(state.getIn(['user', '_id']), message.from._id),
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
    instance.on('connect_error', () => {
        if (!hasShowAlert) {
            action.loading('');
            alert('连接服务端失败, 无网络或者服务端地址错误');
            hasShowAlert = true;
        }
    });
});

export default class App extends React.Component {
    static propTypes = {
        title: PropTypes.string,
    };
    static gotoSetting() {
        Actions.setting();
    }
    static async updateVersion() {
        if (process.env.NODE_ENV === 'development') {
            return;
        }

        action.loading('检查更新');
        const result = await Updates.fetchUpdateAsync();
        action.loading('');
        if (result.isNew) {
            Toast.show({
                text: '有新版本可用, 后台更新中...',
            });
            Updates.reload();
        } else {
            Alert.alert('提示', '当前版本已经是最新了');
        }
    }
    async componentDidMount() {
        const host = await getStorageValue('host');
        socket.connect(host);
    }

    render() {
        return (
            <Provider store={store}>
                <View style={styles.container}>
                    {/* react-native-router-flux不支持透明背景色, 暂时不能实现背景图 */}
                    {/* <Image style={styles.background} source={require('../src/assets/images/background.jpg')} blurRadius={15} /> */}
                    <Root>
                        <Router style={{ backgroundColor: 'red' }}>
                            <View style={{ backgroundColor: 'green' }}>
                                <Scene key="test" component={Test} title="测试页面" />
                                <Scene
                                    key="chatlist"
                                    component={ChatList}
                                    title="消息"
                                    onLeft={App.gotoSetting}
                                    leftTitle="设置"
                                    onRight={App.updateVersion}
                                    rightTitle={` v${appInfo.expo.version}`}
                                    initial
                                />
                                <Scene
                                    key="chat"
                                    component={Chat}
                                    title="聊天"
                                    getTitle={this.props.title}
                                />
                                <Scene
                                    key="login"
                                    component={Login}
                                    title="登录"
                                    backTitle="返回聊天"
                                />
                                <Scene
                                    key="signup"
                                    component={Signup}
                                    title="注册"
                                    backTitle="返回聊天"
                                />
                                <Scene
                                    key="setting"
                                    component={Setting}
                                    title="设置"
                                />
                            </View>
                        </Router>
                    </Root>

                    <Loading />
                </View>
            </Provider>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // background: {
    //     width: 375,
    //     height: 667,
    //     position: 'absolute',
    // },
});
