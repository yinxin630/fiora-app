import React, { Component } from 'react';
import { StyleSheet, KeyboardAvoidingView } from 'react-native';
import { Container } from 'native-base';
import { connect } from 'react-redux';
import immutable from 'immutable';

import { isiOS } from '../../../utils/platform';

import MessageList from './MessageList';
import Input from './Input';


class Chat extends Component {
    render() {
        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={isiOS ? 60 : 80}>
                <Container style={styles.container}>
                    <MessageList />
                    <Input />
                </Container>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default connect((state) => {
    const isLogin = !!state.getIn(['user', '_id']);
    if (!isLogin) {
        return {
            userId: '',
            focus: state.getIn(['user', 'linkmans', 0, '_id']),
            creator: '',
            avatar: state.getIn(['user', 'linkmans', 0, 'avatar']),
            members: state.getIn(['user', 'linkmans', 0, 'members']) || immutable.List(),
        };
    }

    const focus = state.get('focus');
    const linkman = state.getIn(['user', 'linkmans']).find(g => g.get('_id') === focus);

    return {
        userId: state.getIn(['user', '_id']),
        focus,
        type: linkman.get('type'),
        creator: linkman.get('creator'),
        to: linkman.get('to'),
        avatar: linkman.get('avatar'),
        members: linkman.get('members') || immutable.List(),
    };
})(Chat);
