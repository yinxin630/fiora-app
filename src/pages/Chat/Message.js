import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { WebBrowser } from 'expo';
import autobind from 'autobind-decorator';

import Time from '../../../utils/time';
import expressions from '../../../utils/expressions';

import Avatar from '../../components/Avatar';
import Expression from '../../components/Expression';
import Image from '../../components/Image';

const { width: ScreenWidth } = Dimensions.get('window');

export default class Message extends Component {
    static propTypes = {
        avatar: PropTypes.string.isRequired,
        nickname: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['text', 'image', 'url', 'code', 'invite']),
        time: PropTypes.object,
        content: PropTypes.string.isRequired,
        shouldScroll: PropTypes.bool.isRequired,
        scrollToEnd: PropTypes.func.isRequired,
        isSelf: PropTypes.bool.isRequired,
        openImageViewer: PropTypes.func,
    }
    componentDidMount() {
        if (this.props.shouldScroll && this.props.scrollToEnd) {
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
    @autobind
    handleImageClick() {
        const { content, openImageViewer } = this.props;
        openImageViewer(content);
    }
    renderText() {
        const { isSelf, content } = this.props;
        const children = [];
        let copy = content;

        function push(str) {
            children.push(<Text key={Math.random()} style={isSelf ? styles.textSelf : styles.empty}>{str}</Text>);
        }

        // 处理文本消息中的表情和链接
        let offset = 0;
        while (copy.length > 0) {
            const regex = /#\(([\u4e00-\u9fa5a-z]+)\)|https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
            const matchResult = regex.exec(copy);
            if (matchResult) {
                const r = matchResult[0];
                const e = matchResult[1];
                const i = copy.indexOf(r);
                if (r[0] === '#') {
                    // 表情消息
                    const index = expressions.default.indexOf(e);
                    if (index !== -1) {
                        // 处理从开头到匹配位置的文本
                        if (i > 0) {
                            push(copy.substring(0, i));
                        }
                        children.push(<Expression key={Math.random()} style={styles.expression} size={30} index={index} />);
                        offset += i + r.length;
                    }
                } else {
                    // 链接消息
                    if (i > 0) {
                        push(copy.substring(0, i));
                    }
                    children.push((
                        <TouchableOpacity key={Math.random()} onPress={WebBrowser.openBrowserAsync.bind(WebBrowser, r)} >
                            {
                                // Do not nest in view error in dev environment
                                process.env.NODE_ENV === 'development' ?
                                    <View>
                                        <Text style={{ color: '#001be5' }}>{r}</Text>
                                    </View>
                                    :
                                    <Text style={{ color: '#001be5' }}>{r}</Text>

                            }
                        </TouchableOpacity>
                    ));
                    offset += i + r.length;
                }
                copy = copy.substr(i + r.length);
            } else {
                break;
            }
        }

        // 处理剩余文本
        if (offset < content.length) {
            push(content.substring(offset, content.length));
        }

        return (
            <View style={[styles.textContent, isSelf ? styles.textContentSelf : styles.empty]}>
                {
                    <View style={[styles.textView]}>{children}</View>
                }
            </View>
        );
    }
    renderImage() {
        const { content } = this.props;
        const maxWidth = ScreenWidth - 130;
        const maxHeight = 300;
        let scale = 1;
        let width = 0;
        let height = 0;
        const parseResult = /width=([0-9]+)&height=([0-9]+)/.exec(content);
        if (parseResult) {
            [, width, height] = parseResult;
            if (width * scale > maxWidth) {
                scale = maxWidth / width;
            }
            if (height * scale > maxHeight) {
                scale = maxHeight / height;
            }
        }

        return (
            <View style={[styles.imageContent, { width: width * scale, height: height * scale }]}>
                <TouchableOpacity onPress={this.handleImageClick}>
                    <Image
                        src={content}
                    />
                </TouchableOpacity>
            </View>
        );
    }
    renderContent() {
        const { type } = this.props;
        switch (type) {
        case 'text': {
            return this.renderText();
        }
        case 'image': {
            return this.renderImage();
        }
        default:
            return (
                <Text style={styles.notSupport}>不支持的消息类型, 请在Web端查看</Text>
            );
        }
    }
    render() {
        const { avatar, nickname, isSelf } = this.props;
        return (
            <View style={[styles.container, isSelf ? styles.containerSelf : styles.empty]}>
                <Avatar src={avatar} size={44} />
                <View style={[styles.info, isSelf ? styles.infoSelf : styles.empty]}>
                    <View style={styles.nickTime}>
                        <Text style={styles.nick}>{nickname}</Text>
                        <Text style={styles.time}>{this.formatTime()}</Text>
                    </View>
                    <View style={styles.content}>
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
        marginBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
    },
    containerSelf: {
        flexDirection: 'row-reverse',
    },
    empty: {},
    info: {
        marginLeft: 8,
        marginRight: 8,
        maxWidth: ScreenWidth - 120,
    },
    infoSelf: {
        alignItems: 'flex-end',
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
        marginTop: 2,
    },
    textContent: {
        maxWidth: '100%',
        backgroundColor: 'white',
        borderRadius: 6,
        padding: 5,
        paddingLeft: 8,
        paddingRight: 8,
    },
    textContentSelf: {
        backgroundColor: '#2a7bf6',
    },
    text: {
        color: '#333',
        width: '100%',
    },
    lineHeight20: {
        lineHeight: 20,
    },
    textView: {
        width: '100%',
    },
    textSelf: {
        color: 'white',
    },
    expression: {
        marginLeft: 1,
        marginRight: 1,
        transform: [{
            translate: [0, 3],
        }],
    },
    notSupport: {
        color: '#73b668',
    },
    imageContent: {
        width: 300,
    },
});
