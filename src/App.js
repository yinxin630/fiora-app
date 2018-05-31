import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeRouter, Route } from 'react-router-native';
import { Provider } from 'react-redux';

import socket from './socket';
import fetch from '../utils/fetch';
import action from './state/action';
import store from './state/store';

import ChatList from './pages/ChatList/ChatList';


socket.on('connect', async () => {
    console.log('connect');

    const [err, res] = await fetch('login', { username: 'a', password: 'a' });
    if (!err) {
        console.log(res);
        action.setUser(res);
    }
});
socket.on('disconnect', () => {
    console.log('disconnect');
});

export default class App extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <NativeRouter>
                    <View style={styles.container}>
                        <Route path="/" component={ChatList} />
                    </View>
                </NativeRouter>
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

