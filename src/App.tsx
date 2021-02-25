import React, { useEffect, useState } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';
import { Scene, Router, Stack, Tabs, Lightbox } from 'react-native-router-flux';
import { Icon, Root } from 'native-base';
import * as Notifications from 'expo-notifications';

import { connect } from 'react-redux';
import Constants from 'expo-constants';
import ChatList from './pages/ChatList/ChatList';
import Chat from './pages/Chat/Chat';
import Login from './pages/LoginSignup/Login';
import Signup from './pages/LoginSignup/Signup';
import Test from './pages/test';

import Loading from './components/Loading';
import Other from './pages/Other/Other';
import { State, User } from './types/redux';
import SelfInfo from './pages/ChatList/SelfInfo';
import { setNotificationToken } from './service';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

type Props = {
    title: string;
    primaryColor: string;
    notificationTokens: string[];
    isLogin: boolean;
    isConnect: boolean;
};

function App({ title, primaryColor, notificationTokens, isLogin, isConnect }: Props) {
    const [notificationToken, updateNotificationToken] = useState('');

    async function registerForPushNotificationsAsync() {
        if (Constants.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                return;
            }
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            updateNotificationToken(token);

            if (Platform.OS === 'android') {
                Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }
        }
    }
    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    useEffect(() => {
        if (
            isConnect &&
            isLogin &&
            notificationToken &&
            !notificationTokens.includes(notificationToken)
        ) {
            setNotificationToken(notificationToken);
        }
    }, [isConnect, isLogin, notificationToken]);

    function handleAppStateChange(nextAppState: string) {
        if (nextAppState === 'active') {
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: false,
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                }),
            });
        } else if (nextAppState === 'background') {
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: false,
                }),
            });
        }
    }
    useEffect(() => {
        AppState.addEventListener('change', handleAppStateChange);
        return () => {
            AppState.removeEventListener('change', handleAppStateChange);
        };
    }, []);

    const primaryColor10 = `rgba(${primaryColor}, 1)`;
    const primaryColor8 = `rgba(${primaryColor}, 0.8)`;

    return (
        <View style={styles.container}>
            <Root>
                <Router>
                    <Stack hideNavBar>
                        <Lightbox>
                            <Tabs
                                key="tabs"
                                hideNavBar
                                tabBarStyle={{ backgroundColor: primaryColor8, borderTopWidth: 0 }}
                                showLabel={false}
                            >
                                <Scene
                                    key="chatlist"
                                    component={ChatList}
                                    initial
                                    hideNavBar={!isLogin}
                                    icon={({ focused }) => (
                                        <Icon
                                            name="chatbubble-ellipses-outline"
                                            style={{
                                                fontSize: 24,
                                                color: focused ? 'white' : '#bbb',
                                            }}
                                        />
                                    )}
                                    renderLeftButton={() => <SelfInfo />}
                                    navigationBarStyle={{
                                        backgroundColor: primaryColor10,
                                        borderBottomWidth: 0,
                                    }}
                                />
                                <Scene
                                    key="other"
                                    component={Other}
                                    hideNavBar
                                    title="其它"
                                    icon={({ focused }) => (
                                        <Icon
                                            name="aperture-outline"
                                            style={{
                                                fontSize: 24,
                                                color: focused ? 'white' : '#bbb',
                                            }}
                                        />
                                    )}
                                />
                            </Tabs>
                        </Lightbox>
                        <Scene
                            key="chat"
                            component={Chat}
                            title="聊天"
                            getTitle={title}
                            hideNavBar={false}
                            navigationBarStyle={{
                                backgroundColor: primaryColor10,
                                borderBottomWidth: 0,
                            }}
                            navBarButtonColor="#f9f9f9"
                            backTitle="返回"
                        />
                        <Scene
                            key="login"
                            component={Login}
                            title="登录"
                            hideNavBar={false}
                            navigationBarStyle={{
                                backgroundColor: primaryColor10,
                                borderBottomWidth: 0,
                            }}
                            navBarButtonColor="#f9f9f9"
                            backTitle="返回"
                        />
                        <Scene
                            key="signup"
                            component={Signup}
                            title="注册"
                            hideNavBar={false}
                            navigationBarStyle={{
                                backgroundColor: primaryColor10,
                                borderBottomWidth: 0,
                            }}
                            navBarButtonColor="#f9f9f9"
                            backTitle="返回"
                        />
                        <Scene key="test" component={Test} title="测试页面2" tabs={false} />
                    </Stack>
                </Router>
            </Root>

            <Loading />
        </View>
    );
}

export default connect((state: State) => ({
    primaryColor: state.ui.primaryColor,
    notificationTokens: (state.user as User)?.notificationTokens || [],
    isLogin: !!(state.user as User)?._id,
    isConnect: state.connect,
}))(App);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
