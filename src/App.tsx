import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Scene, Router, Stack, Tabs, Lightbox } from 'react-native-router-flux';
import { Icon, Root } from 'native-base';

import { connect } from 'react-redux';
import ChatList from './pages/ChatList/ChatList';
import Chat from './pages/Chat/Chat';
import Login from './pages/LoginSignup/Login';
import Signup from './pages/LoginSignup/Signup';
import Test from './pages/test';

import Loading from './components/Loading';
import Other from './pages/Other/Other';
import Notification from './components/Nofitication';
import { State, User } from './types/redux';
import SelfInfo from './pages/ChatList/SelfInfo';

type Props = {
    title: string;
    primaryColor: string;
    isLogin: boolean;
};

function App({ title, primaryColor, isLogin }: Props) {
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
            <Notification />
        </View>
    );
}

export default connect((state: State) => ({
    primaryColor: state.ui.primaryColor,
    isLogin: !!(state.user as User)?._id,
}))(App);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
