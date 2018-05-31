import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import Time from '../../../utils/time';

import Avatar from '../../components/Avatar';

export default class Message extends Component {
    static propTypes = {
        avatar: PropTypes.string.isRequired,
        nickname: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['text', 'image', 'url', 'code']),
        time: PropTypes.object,
        content: PropTypes.string.isRequired,
    }
    formatTime() {
        const { time } = this.props;
        const nowTime = new Date();
        if (Time.isToday(nowTime, time)) {
            return Time.getHourMinute(time);
        }
        if (Time.isYesterday(nowTime, time)) {
            return `昨天 ${Time.getHourMinute(time)}`;
        }
        return `${Time.getMonthDate(time)} ${Time.getHourMinute(time)}`;
    }
    renderText() {
        const { content } = this.props;
        return (
            <View>
                <Text>{content}</Text>
            </View>
        );
    }
    renderContent() {
        const { type } = this.props;
        switch (type) {
        case 'text': {
            return this.renderText();
        }
        default:
            return (
                <Text>不支持的消息类型</Text>
            );
        }
    }
    render() {
        const { avatar, nickname } = this.props;
        console.log('Message:', this.props.content);
        return (
            <View style={styles.container}>
                <Avatar src={avatar} size={36} />
                <View style={styles.info}>
                    <View style={styles.nickTime}>
                        <Text style={styles.nick}>{nickname}</Text>
                        <Text style={styles.time}>{this.formatTime()}</Text>
                    </View>
                    <View>
                        {this.renderContent()}
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    info: {

    },
    nickTime: {
        flexDirection: 'row',
    },
    nick: {
        fontSize: 13,
        color: '#333',
    },
    time: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
});
