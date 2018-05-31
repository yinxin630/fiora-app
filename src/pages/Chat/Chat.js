import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title } from 'native-base';
import { connect } from 'react-redux';
import immutable from 'immutable';
import PropTypes from 'prop-types';

import MessageList from './MessageList';


class Chat extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
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
                <Container>
                    <MessageList />
                </Container>
            </Container>
        );
    }
}

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
