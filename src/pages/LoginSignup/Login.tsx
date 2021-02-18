import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import { Container } from 'native-base';
import { Actions } from 'react-native-router-flux';

import fetch from '../../utils/fetch';
import platform from '../../utils/platform';
import action from '../../state/action';

import Base from './Base';

export default class Login extends Component {
    static async handleSubmit(username, password) {
        const [err, res] = await fetch('login', Object.assign({
            username,
            password,
        }, platform));
        if (!err) {
            action.setUser(res);
            Actions.pop();
            await AsyncStorage.setItem('token', res.token);
        }
    }
    render() {
        return (
            <Container>
                <Base
                    buttonText="登录"
                    jumpText="注册新用户"
                    jumpPage="signup"
                    onSubmit={Login.handleSubmit}
                />
            </Container>
        );
    }
}
