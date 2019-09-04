import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Text, Dimensions, TouchableOpacity } from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Button } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { Ionicons } from '@expo/vector-icons';
import { ImagePicker, Permissions } from 'expo';
import { Rpc } from 'react-native-qiniu';

import action from '../../state/action';
import fetch from '../../../utils/fetch';
import { isiOS } from '../../../utils/platform';
import expressions from '../../../utils/expressions';

import Expression from '../../components/Expression';

const { width: ScreenWidth } = Dimensions.get('window');
const ExpressionSize = (ScreenWidth - 16) / 10;

@autobind
class Input extends Component {
    static propTypes = {
        user: ImmutablePropTypes.map,
        focus: PropTypes.string.isRequired,
        isLogin: PropTypes.bool.isRequired,
        onHeightChange: PropTypes.func.isRequired,
    }
    constructor(...args) {
        super(...args);
        this.state = {
            value: '',
            showFunctionList: true,
            showExpression: false,
            cursorPosition: {
                start: 0,
                end: 0,
            },
        };
    }
    setInputText(text) {
        // iossetNativeProps无效, 解决办法参考:https://github.com/facebook/react-native/issues/18272
        if (isiOS) {
            this.input.setNativeProps({ text: text || ' ' });
        }
        setTimeout(() => {
            this.input.setNativeProps({ text: text || '' });
        });
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
    handleSubmit() {
        const message = this.state.value;
        if (message === '') {
            return;
        }

        const id = this.addSelfMessage('text', message);
        this.sendMessage(id, 'text', message);

        this.setState({
            value: '',
            showFunctionList: true,
            showExpression: false,
        });
        this.setInputText();
    }
    handleSelectionChange(event) {
        const { start, end } = event.nativeEvent.selection;
        this.setState({
            cursorPosition: {
                start,
                end,
            },
        });
    }
    handleFocus() {
        this.setState({
            showFunctionList: true,
            showExpression: false,
        });
    }
    openExpression() {
        this.input.blur();
        this.setState({
            showExpression: true,
            showFunctionList: false,
        });
        this.props.onHeightChange();
    }
    closeExpression() {
        this.setState({
            showExpression: false,
        });
    }
    async handleClickImage() {
        const { user } = this.props;

        const { status } = await Permissions.getAsync(Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
            const { status: returnStatus } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (returnStatus !== 'granted') {
                return;
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'Images',
            quality: isiOS ? 0.1 : 0.8,
        });

        if (!result.cancelled) {
            const id = this.addSelfMessage('image', `${result.uri}?width=${result.width}&height=${result.height}`);
            const [err, tokenResult] = await fetch('uploadToken');
            if (!err) {
                const key = `ImageMessage/${user.get('_id')}_${Date.now()}`;
                await Rpc.uploadFile(result.uri, tokenResult.token, {
                    key,
                });
                this.sendMessage(id, 'image', `${tokenResult.urlPrefix}${key}?width=${result.width}&height=${result.height}`);
            }
        }
    }
    async handleClickCamera() {
        const { user } = this.props;

        const { status: cameraStatus } = await Permissions.getAsync(Permissions.CAMERA);
        if (cameraStatus !== 'granted') {
            const { status: returnStatus } = await Permissions.askAsync(Permissions.CAMERA);
            if (returnStatus !== 'granted') {
                return;
            }
        }

        const { status: cameraRollStatus } = await Permissions.getAsync(Permissions.CAMERA_ROLL);
        if (cameraRollStatus !== 'granted') {
            const { status: returnStatus } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (returnStatus !== 'granted') {
                return;
            }
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: isiOS ? 0.1 : 0.8,
        });

        if (!result.cancelled) {
            const id = this.addSelfMessage('image', `${result.uri}?width=${result.width}&height=${result.height}`);
            const [err, tokenResult] = await fetch('uploadToken');
            if (!err) {
                const key = `ImageMessage/${user.get('_id')}_${Date.now()}`;
                await Rpc.uploadFile(result.uri, tokenResult.token, {
                    key,
                });
                this.sendMessage(id, 'image', `${tokenResult.urlPrefix}${key}?width=${result.width}&height=${result.height}`);
            }
        }
    }
    handleChangeText(value) {
        this.setState({
            value,
        });
    }
    insertExpression(e) {
        const { value, cursorPosition } = this.state;
        const expression = `#(${e})`;
        const newValue = `${value.substring(0, cursorPosition.start)}${expression}${value.substring(cursorPosition.end, value.length)}`;
        this.setState({
            value: newValue,
            cursorPosition: {
                start: cursorPosition.start + expression.length,
                end: cursorPosition.start + expression.length,
            },
        });
        this.setInputText(newValue);
    }
    render() {
        const { isLogin } = this.props;
        return (
            <View style={styles.container}>
                {
                    isLogin ?
                        <View style={styles.inputContainer}>
                            <TextInput
                                ref={i => this.input = i}
                                style={styles.input}
                                placeholder="代码会写了吗, 给加薪了吗, 股票涨了吗~~"
                                onChangeText={this.handleChangeText}
                                onSubmitEditing={this.handleSubmit}
                                autoCapitalize="none"
                                blurOnSubmit={false}
                                maxLength={2048}
                                returnKeyType="send"
                                enablesReturnKeyAutomatically
                                underlineColorAndroid="transparent"
                                onSelectionChange={this.handleSelectionChange}
                                onFocus={this.handleFocus}
                            />
                            <Button primary style={styles.sendButton} onPress={this.handleSubmit}>
                                <Text style={styles.buttonText}>发送</Text>
                            </Button>
                        </View>
                        :
                        <Button block style={styles.button} onPress={Actions.login}>
                            <Text style={styles.buttonText}>游客你好, 点击按钮登录后参与聊天</Text>
                        </Button>
                }
                {
                    isLogin && this.state.showFunctionList ?
                        <View style={styles.iconButtonContainer}>
                            <Button transparent style={styles.iconButton} onPress={this.openExpression}>
                                <Ionicons name="ios-happy" size={28} color="#666" />
                            </Button>
                            <Button transparent style={styles.iconButton} onPress={this.handleClickImage}>
                                <Ionicons name="ios-image" size={28} color="#666" />
                            </Button>
                            <Button transparent style={styles.iconButton} onPress={this.handleClickCamera}>
                                <Ionicons name="ios-camera" size={28} color="#666" />
                            </Button>
                        </View>
                        :
                        null
                }
                {
                    this.state.showExpression ?
                        <View style={styles.expressionContainer}>
                            {
                                expressions.default.map((e, i) => (
                                    <TouchableOpacity key={e} onPress={this.insertExpression.bind(this, e)} >
                                        <View style={styles.expression} >
                                            <Expression index={i} size={30} />
                                        </View>
                                    </TouchableOpacity>

                                ))
                            }
                        </View>
                        :
                        null
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
        paddingTop: 4,
        backgroundColor: '#f6f6f6',
        marginTop: isiOS ? 6 : 0,
    },
    inputContainer: {
        flexDirection: 'row',
        paddingLeft: 10,
        paddingRight: 10,
    },
    input: {
        flex: 1,
        height: 36,
        paddingLeft: 8,
        paddingRight: 8,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    sendButton: {
        width: 50,
        height: 36,
        marginLeft: 8,
        paddingLeft: 10,
    },
    button: {
        height: 36,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 8,
    },
    buttonText: {
        color: 'white',
    },
    iconContainer: {
        height: 40,
    },
    icon: {
        transform: [{
            translate: [0, -3],
        }],
    },

    iconButtonContainer: {
        flexDirection: 'row',
        paddingLeft: 15,
        paddingRight: 15,
        height: 44,
    },
    iconButton: {
        width: '15%',
    },

    cancelButton: {
        borderTopWidth: 1,
        borderTopColor: '#e6e6e6',
    },
    cancelButtonText: {
        color: '#666',
    },

    // 表情框
    expressionContainer: {
        height: (isiOS ? 34 : 30) * 5 + 6,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 8,
        paddingRight: 8,
    },
    expression: {
        width: ExpressionSize,
        height: isiOS ? 34 : 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

