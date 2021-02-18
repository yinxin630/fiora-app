import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, AsyncStorage, SafeAreaView } from 'react-native';
import { Container, Form, Label, Button } from 'native-base';
import { Actions } from 'react-native-router-flux';

import { isiOS } from '../utils/platform';
import socket from '../socket';

export default class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
            host: '',
        };
    }
    handleHostChange = (value) => {
        this.setState({
            host: value,
        });
    };
    handleChangeHost = async () => {
        socket.changeHost(this.state.host);
        await AsyncStorage.setItem('host', this.state.host);
        Actions.chatlist();
    }
    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Container style={styles.container}>
                    <View>
                        <Form>
                            <Label style={styles.label}>服务端地址</Label>
                            <TextInput
                                style={[styles.input, isiOS ? styles.inputiOS : {}]}
                                clearButtonMode="while-editing"
                                value={this.state.host}
                                onChangeText={this.handleHostChange}
                                autoCapitalize="none"
                            />
                        </Form>
                        <Button primary block style={styles.button} onPress={this.handleChangeHost}>
                            <Text style={styles.buttonText}>更新</Text>
                        </Button>
                    </View>
                </Container>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 20,
    },
    button: {
        marginTop: 8,
    },
    buttonText: {
        fontSize: 18,
        color: '#fafafa',
    },
    label: {
        marginBottom: 8,
    },
    input: {
        height: 42,
        fontSize: 16,
        borderRadius: 6,
        marginBottom: 12,
        paddingLeft: 6,
    },
    inputiOS: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
    },
});
