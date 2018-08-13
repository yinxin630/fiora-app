import React from 'react';
import { StyleSheet, View, AsyncStorage, Alert } from 'react-native';
import { Provider } from 'react-redux';
import { Scene, Router } from 'react-native-router-flux';
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
import appInfo from '../app';

import ChatList from './pages/ChatList/ChatList';
import Chat from './pages/Chat/Chat';
import Login from './pages/LoginSignup/Login';
import Signup from './pages/LoginSignup/Signup';
import Test from './pages/test';

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

/**
 * 获取token, 超过2s返回空token
 * 安卓7以上机器, AsyncStorage.getItem会卡主一直不返回, 等待RN发版解决问题
 * https://github.com/facebook/react-native/pull/16905
 */
async function getToken() {
    return new Promise((resolve) => {
        AsyncStorage
            .getItem('token')
            .then((token) => {
                resolve(token);
            });
        setTimeout(() => resolve(''), 2000);
    });
}

socket.on('connect', async () => {
    action.loading('登录中...');

    // await AsyncStorage.setItem('token', '');
    const token = await getToken();

    if (token) {
        const [err, res] = await fetch('loginByToken', Object.assign({
            token,
        }, platform), { toast: false });
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

        action.loading('检查更新');
        const result = await Updates.fetchUpdateAsync();
        action.loading('');
        if (result.isNew) {
            Updates.reload();
            Toast.show({
                text: '有新版本可用, 后台更新中...',
            });
        } else {
            Alert.alert('提示', '当前版本已经是最新了');
        }
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
                                <Scene key="chatlist" component={ChatList} title="消息" onRight={App.updateVersion} rightTitle={` v${appInfo.expo.version}`} initial />
                                <Scene key="chat" component={Chat} title="聊天" getTitle={this.props.title} />
                                <Scene key="login" component={Login} title="登录" backTitle="返回聊天" />
                                <Scene key="signup" component={Signup} title="注册" backTitle="返回聊天" />
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

