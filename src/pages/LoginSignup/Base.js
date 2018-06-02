import React, { Component } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { Container, Form, Item, Input, Label, Button } from 'native-base';
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';

export default class Login extends Component {
    static propTypes = {
        buttonText: PropTypes.string.isRequired,
        jumpText: PropTypes.string.isRequired,
        jumpPage: PropTypes.string.isRequired,
        onSubmit: PropTypes.func.isRequired,
    }
    constructor(...args) {
        super(...args);
        this.state = {
            username: '',
            password: '',
        };
    }
    handleTextChange(key, value) {
        this.setState({
            [key]: value,
        });
    }
    @autobind
    handlePress() {
        const { username, password } = this.state;
        this.username.blur();
        this.password.blur();
        this.props.onSubmit(username, password);
    }
    @autobind
    handleJump() {
        const { jumpPage } = this.props;
        if (Actions[jumpPage]) {
            Actions.replace(jumpPage);
        } else {
            console.error(`页面${jumpPage}不存在`);
        }
    }
    render() {
        const { buttonText, jumpText } = this.props;
        return (
            <Container style={styles.container}>
                <Form>
                    <Label style={styles.label}>用户名</Label>
                    <TextInput
                        style={styles.input}
                        ref={i => this.username = i}
                        clearButtonMode="while-editing"
                        onChangeText={this.handleTextChange.bind(this, 'username')}
                        autoCapitalize="none"
                    />
                    <Label style={styles.label}>密码</Label>
                    <TextInput
                        style={styles.input}
                        ref={i => this.password = i}
                        secureTextEntry
                        clearButtonMode="while-editing"
                        onChangeText={this.handleTextChange.bind(this, 'password')}
                        autoCapitalize="none"
                    />
                </Form>
                <Button primary block style={styles.button} onPress={this.handlePress}>
                    <Text style={styles.buttonText}>{buttonText}</Text>
                </Button>
                <Button transparent primary style={styles.signup} onPress={this.handleJump}>
                    <Text style={styles.signupText}>{jumpText}</Text>
                </Button>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 20,
    },
    button: {
        marginTop: 18,
    },
    buttonText: {
        fontSize: 18,
        color: '#fafafa',
    },
    signup: {
        alignSelf: 'flex-end',
    },
    signupText: {
        color: '#2a7bf6',
        fontSize: 14,
    },
    label: {
        marginBottom: 8,
    },
    input: {
        height: 42,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 6,
        marginBottom: 12,
        paddingLeft: 6,
    },
});
