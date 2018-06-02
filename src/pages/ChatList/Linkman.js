import React, { Component } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { Actions } from 'react-native-router-flux';

import Time from '../../../utils/time';
import action from '../../state/action';

import Avatar from '../../components/Avatar';

export default class Linkman extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
        preview: PropTypes.string,
        time: PropTypes.object,
    }
    formatTime() {
        const { time: messageTime } = this.props;
        const nowTime = new Date();
        if (Time.isToday(nowTime, messageTime)) {
            return Time.getHourMinute(messageTime);
        }
        if (Time.isYesterday(nowTime, messageTime)) {
            return '昨天';
        }
        return Time.getMonthDate(messageTime);
    }
    @autobind
    handlePress() {
        const { name, id } = this.props;
        action.setFocus(id);
        Actions.chat({ title: name });
    }
    render() {
        const { name, avatar, preview } = this.props;
        return (
            <TouchableOpacity onPress={this.handlePress}>
                <View style={styles.container}>
                    <Avatar src={avatar} size={50} />
                    <View style={styles.content}>
                        <View style={styles.nickTime}>
                            <Text style={styles.nick}>{name}</Text>
                            <Text style={styles.time}>{this.formatTime()}</Text>
                        </View>
                        <View style={styles.previewUnread}>
                            <Text style={styles.preview} numberOfLines={1}>{preview}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 70,
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
    },
    content: {
        flex: 1,
        marginLeft: 8,
    },
    nickTime: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nick: {
        fontSize: 16,
        color: '#333',
    },
    time: {
        fontSize: 14,
        color: '#888',
    },
    previewUnread: {
        marginTop: 8,
    },
    preview: {
        fontSize: 14,
        color: '#666',
    },
});

