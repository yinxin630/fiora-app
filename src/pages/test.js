import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import { Container } from 'native-base';

export default class Test extends Component {
    render() {
        return (
            <Container style={{ paddingTop: 56 }}>
                <Text>test</Text>
                <View style={{ width: 50, height: 50, overflow: 'hidden' }}>
                    <Image source={require('../assets/images/baidu.png')} style={{ width: 50, height: 2500, marginTop: -50 }} />
                </View>
            </Container>
        );
    }
}
