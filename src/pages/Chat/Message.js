import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import Time from '../../../utils/time';
import expressions from '../../../utils/expressions';

import Avatar from '../../components/Avatar';
import Expression from '../../components/Expression';

export default class Message extends Component {
    static propTypes = {
        avatar: PropTypes.string.isRequired,
        nickname: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['text', 'image', 'url', 'code']),
        time: PropTypes.object,
        content: PropTypes.string.isRequired,
        scrollToEnd: PropTypes.func.isRequired,
    }
    componentDidMount() {
        if (this.props.scrollToEnd) {
            this.props.scrollToEnd();
        }
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
        const children = [];
        let offset = 0;
        content.replace(
            /#\(([\u4e00-\u9fa5a-z]+)\)/g,
            (r, e, i) => {
                const index = expressions.default.indexOf(e);
                if (index !== -1) {
                    if (offset < i) {
                        children.push(content.substring(offset, i));
                    }
                    children.push(<Expression key={Math.random()} style={styles.expression} size={30} index={index} />);
                    offset = i + r.length;
                }
                return r;
            },
        );
        if (offset < content.length) {
            children.push(content.substring(offset, content.length));
        }
        return (
            <Text style={styles.text}>{children}</Text>
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
                <Text style={styles.notSupport}>不支持的消息类型</Text>
            );
        }
    }
    render() {
        const { avatar, nickname } = this.props;
        // console.log('Message:', avatar);
        return (
            <View style={styles.container}>
                <Avatar src={avatar} size={44} />
                <View style={styles.info}>
                    <View style={styles.nickTime}>
                        <Text style={styles.nick}>{nickname}</Text>
                        <Text style={styles.time}>{this.formatTime()}</Text>
                    </View>
                    <View style={styles.content}>
                        <View style={styles.contentInline}>
                            {this.renderContent()}
                        </View>
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
        flex: 1,
        marginLeft: 8,
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
    content: {
        flexDirection: 'row',
    },
    contentInline: {
        maxWidth: '100%',
        backgroundColor: '#2a7bf6',
        borderRadius: 6,
        padding: 5,
        paddingLeft: 8,
        paddingRight: 8,
    },
    text: {
        color: 'white',
        width: '100%',
    },
    expression: {
        marginLeft: 1,
        marginRight: 1,
    },
    notSupport: {
        color: 'red',
    },
});
