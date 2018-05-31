import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Container, Header, Left, Body, Right, Title } from 'native-base';
import { connect } from 'react-redux';
import immutable from 'immutable';
import PropTypes from 'prop-types';

import MessageList from './MessageList';
import Input from './Input';


class Chat extends Component {
    static propTypes = {
        name: PropTypes.string,
    }
    render() {
        const { name } = this.props;
        return (
            <Container>
                <Header>
                    <Left />
                    <Body>
                        <Title>{name}</Title>
                    </Body>
                    <Right />
                </Header>
                <Container style={styles.container}>
                    <MessageList />
                    <Input />
                </Container>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
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
        name: linkman.get('name'),
        avatar: linkman.get('avatar'),
        members: linkman.get('members') || immutable.List(),
    };
})(Chat);
