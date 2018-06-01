import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Platform } from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

import action from '../../state/action';
import fetch from '../../../utils/fetch';

class Input extends Component {
    static propTypes = {
        user: ImmutablePropTypes.map,
        focus: PropTypes.string.isRequired,
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
        console.log('发送:', this.state.value);
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
        return (
            <View style={styles.container}>
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
            </View>
        );
    }
}

export default connect(state => ({
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
});

