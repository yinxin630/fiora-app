import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { Scene, Router } from 'react-native-router-flux';
import PropTypes from 'prop-types';

import socket from './socket';
import fetch from '../utils/fetch';
import action from './state/action';
import store from './state/store';

import ChatList from './pages/ChatList/ChatList';
import Chat from './pages/Chat/Chat';
import Test from './pages/test';


socket.on('connect', async () => {
    console.log('connect');

    const [err, res] = await fetch('login', {
        username: 'a',
        password: 'a',
        os: 'iOS',
        browser: 'APP',
        environment: 'iOS APP 开发版',
    });
    if (!err) {
        console.log(res);
        action.setUser(res);
    }
});
socket.on('disconnect', () => {
    console.log('disconnect');
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

