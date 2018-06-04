import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Platform, Text, Keyboard } from 'react-native';
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

class Input extends Component {
    static propTypes = {
        user: ImmutablePropTypes.map,
        focus: PropTypes.string.isRequired,
        isLogin: PropTypes.bool.isRequired,
    }
    constructor(...args) {
        super(...args);
        this.state = {
            value: '',
            showFunctionList: false,
        };
    }
    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this.handleKeyboardShow);
    }
    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
    }
    @autobind
    handleKeyboardShow() {
        this.closeFunctionList();
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
    openFunctionList() {
        this.input.blur();
        this.setState({
            showFunctionList: true,
        });
    }
    @autobind
    closeFunctionList() {
        this.setState({
            showFunctionList: false,
        });
    }
    @autobind
    async handleClickImage() {
        const { user } = this.props;

        const { status } = await Permissions.getAsync(Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
            const { status: returnStatus } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (returnStatus !== 'granted') {
                return;
            }
        }

        this.closeFunctionList();
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
    @autobind
    handleChangeText(value) {
        this.setState({
            value,
        });
    }
    render() {
        const { isLogin } = this.props;
        return (
            <View style={styles.container}>
                {
                    isLogin ?
                        <View style={styles.inputContainer}>
                            <Button transparent style={styles.iconContainer} onPress={this.openFunctionList} >
                                <Ionicons style={styles.icon} name="ios-add-circle" size={32} color="#c9c9c9" />
                            </Button>
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
                                underlineColorAndroid="transparent"
                            />
                        </View>
                        :
                        <Button block style={styles.button} onPress={Actions.login}>
                            <Text style={styles.buttonText}>游客朋友你好, 请登录后参与聊天</Text>
                        </Button>
                }
                {
                    this.state.showFunctionList ?
                        <View>
                            <View style={styles.iconButtonContainer}>
                                <Button transparent style={styles.iconButton} onPress={this.handleClickImage}>
                                    <View style={styles.buttonIconContainer}>
                                        <Ionicons name="ios-image" size={28} color="#666" />
                                    </View>
                                    <Text style={styles.buttonIconText}>图片</Text>
                                </Button>
                            </View>
                            <Button full transparent style={styles.cancelButton} onPress={this.closeFunctionList}>
                                <Text style={styles.cancelButtonText}>取消</Text>
                            </Button>
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
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#e5e5e5',
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
    },
    iconButton: {
        width: '25%',
        height: 80,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    buttonIconContainer: {
        width: 44,
        height: 44,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#f1f1f1',
    },
    buttonIconText: {
        color: '#999',
        fontSize: 12,
        marginTop: 4,
    },

    cancelButton: {
        borderTopWidth: 1,
        borderTopColor: '#e6e6e6',
    },
    cancelButtonText: {
        color: '#666',
    },
});

