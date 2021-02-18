import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import { Container, Toast } from 'native-base';
import { Actions } from 'react-native-router-flux';

import fetch from '../../utils/fetch';
import platform from '../../utils/platform';
import action from '../../state/action';

import Base from './Base';

export default class Signup extends Component {
    static async handleSubmit(username, password) {
        const [err, res] = await fetch('register', Object.assign({
            username,
            password,
        }, platform));
        if (!err) {
            Toast.show({
                text: '创建成功',
                type: 'success',
            });
            action.setUser(res);
            Actions.chatlist();
            await AsyncStorage.setItem('token', res.token);
        }
    }
    render() {
        return (
            <Container>
                <Base
                    buttonText="注册"
                    jumpText="已有账号? 去登陆"
                    jumpPage="login"
                    onSubmit={Signup.handleSubmit}
                />
            </Container>
        );
    }
}
