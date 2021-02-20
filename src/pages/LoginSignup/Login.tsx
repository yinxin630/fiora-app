import React from 'react';
import { Container } from 'native-base';
import { Actions } from 'react-native-router-flux';

import fetch from '../../utils/fetch';
import platform from '../../utils/platform';
import action from '../../state/action';

import Base from './Base';
import { setStorageValue } from '../../utils/storage';

export default function Login() {
    async function handleSubmit(username: string, password: string) {
        const [err, res] = await fetch(
            'login',
            Object.assign(
                {
                    username,
                    password,
                },
                platform,
            ),
        );
        if (!err) {
            action.setUser(res);
            Actions.pop();
            await setStorageValue('token', res.token);
        }
    }
    return (
        <Container>
            <Base
                buttonText="登录"
                jumpText="注册新用户"
                jumpPage="signup"
                onSubmit={handleSubmit}
            />
        </Container>
    );
}
