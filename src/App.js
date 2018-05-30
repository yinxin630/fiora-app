import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import socket from './socket';

socket.on('connect', async () => {
    console.log('connect');
});
socket.on('disconnect', () => {
    console.log('disconnect');
});

export default class App extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Hello, Fiora</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

