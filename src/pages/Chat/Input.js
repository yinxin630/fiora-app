import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Input as BaseInput, Item } from 'native-base';

export default class Input extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Item>
                    <BaseInput style={styles.input} placeholder="输入消息内容" />
                </Item>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: 'red',
        height: 40,
    },
    input: {
        height: 40,
    },
});

