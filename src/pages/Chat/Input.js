import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Platform, Text } from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Button } from 'native-base';
import { Actions } from 'react-native-router-flux';

import action from '../../state/action';
import fetch from '../../../utils/fetch';

class Input extends Component {
    static propTypes = {
        user: ImmutablePropTypes.map,
        focus: PropTypes.string.isRequired,
        isLogin: PropTypes.bool.isRequired,
    }
    constructor(...args) {
        super(...args);
        this.state = {
            value: '',
        };
    }
    addSelfMessage(type, content) {
        const { user, focus } = this.props;
        const _id = focus + Date.now();
        const message = {
            _id,
            type,
            content,
            createTime: Date.now(),
            from: {
                _id: user.get('_id'),
                username: user.get('username'),
                avatar: user.get('avatar'),
            },
            loading: true,
        };

        if (type === 'image') {
            message.percent = 0;
        }
        action.addLinkmanMessage(focus, message);

        return _id;
    }
    @autobind
    async sendMessage(localId, type, content) {
        const { focus } = this.props;
        const [err, res] = await fetch('sendMessage', {
            to: focus,
            type,
            content,
        });
        if (!err) {
            res.loading = false;
            action.updateSelfMessage(focus, localId, res);
        }
    }
    @autobind
    handleSubmit() {
        const message = this.state.value;
        if (message === '') {
            return;
        }

        const id = this.addSelfMessage('text', message);
        this.sendMessage(id, 'text', message);

        /**
         * clear() not work.
         * find solution at https://github.com/facebook/react-native/issues/18272
         */
        // this.input.clear();
        if (Platform.OS === 'ios') {
            this.input.setNativeProps({ text: ' ' });
        }
        setTimeout(() => {
            this.input.setNativeProps({ text: '' });
        });
    }
    @autobind
    handleChangeText(value) {
        this.setState({
            value,
        });
    }
    render() {
        const { isLogin } = this.props;
        return (
            <View style={styles.container}>
                {
                    isLogin ?
                        <TextInput
                            ref={i => this.input = i}
                            style={styles.input}
                            placeholder="输入消息内容"
                            onChangeText={this.handleChangeText}
                            onSubmitEditing={this.handleSubmit}
                            autoCapitalize="none"
                            blurOnSubmit={false}
                            maxLength={2048}
                            returnKeyType="send"
                            enablesReturnKeyAutomatically
                        />
                        :
                        <Button block style={styles.button} onPress={Actions.login}>
                            <Text style={styles.buttonText}>游客朋友你好, 请登录后参与聊天</Text>
                        </Button>
                }
            </View>
        );
    }
}

export default connect(state => ({
    isLogin: !!state.getIn(['user', '_id']),
    focus: state.get('focus'),
    user: state.get('user'),
}))(Input);

const styles = StyleSheet.create({
    container: {
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 4,
        height: 40,
    },
    input: {
        height: 36,
        paddingLeft: 8,
        paddingRight: 8,
        backgroundColor: 'white',
    },
    button: {
        height: 36,
    },
    buttonText: {
        color: 'white',
    },
});

