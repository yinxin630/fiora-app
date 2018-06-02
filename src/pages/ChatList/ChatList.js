import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { Container } from 'native-base';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import Linkman from './Linkman';

class ChatList extends Component {
    static propTypes = {
        linkmans: ImmutablePropTypes.list,
    }
    static renderLinkman(linkman) {
        const linkmanId = linkman.get('_id');
        const unread = linkman.get('unread');
        const lastMessage = linkman.getIn(['messages', linkman.get('messages').size - 1]);

        let time = new Date(linkman.get('createTime'));
        let preview = '暂无消息';
        if (lastMessage) {
            time = new Date(lastMessage.get('createTime'));
            preview = `${lastMessage.get('content')}`;
            if (linkman.get('type') === 'group') {
                preview = `${lastMessage.getIn(['from', 'username'])}: ${preview}`;
            }
        }
        return (
            <Linkman
                key={linkmanId}
                id={linkmanId}
                name={linkman.get('name')}
                avatar={linkman.get('avatar')}
                preview={preview}
                time={time}
                unread={unread}
            />
        );
    }
    render() {
        const { linkmans } = this.props;
        return (
            <Container>
                <ScrollView>
                    {
                        linkmans && linkmans.map(linkman => (
                            ChatList.renderLinkman(linkman)
                        ))
                    }
                </ScrollView>
            </Container>
        );
    }
}

export default connect(state => ({
    linkmans: state.getIn(['user', 'linkmans']),
}))(ChatList);
