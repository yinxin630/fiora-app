import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';
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
                    <Item floatingLabel>
                        <Label>用户名</Label>
                        <Input
                            clearButtonMode="while-editing"
                            onChangeText={this.handleTextChange.bind(this, 'username')}
                            autoCapitalize="none"
                        />
                    </Item>
                    <Item floatingLabel last>
                        <Label>密码</Label>
                        <Input
                            secureTextEntry
                            clearButtonMode="while-editing"
                            onChangeText={this.handleTextChange.bind(this, 'password')}
                            autoCapitalize="none"
                        />
                    </Item>
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
    },
    button: {
        marginTop: 28,
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
});
