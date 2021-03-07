import React from 'react';
import { Container, Tab, Tabs, Text, View } from 'native-base';
import { ScrollView, StyleSheet } from 'react-native';
import PageContainer from '../../components/PageContainer';
import Avatar from '../../components/Avatar';

type Props = {
    groups: {
        _id: string;
        name: string;
        avatar: string;
        members: number;
    }[];
    users: {
        _id: string;
        username: string;
        avatar: string;
    }[];
};

function SearchResult({ groups, users }: Props) {
    return (
        <PageContainer disableSafeAreaView>
            <Tabs
                style={styles.container}
                tabContainerStyle={{ backgroundColor: 'transparent' }}
            >
                <Tab
                    heading={`群组(${groups.length})`}
                    tabStyle={{ backgroundColor: 'transparent' }}
                    activeTabStyle={{ backgroundColor: 'transparent' }}
                >
                    <PageContainer>
                        <ScrollView>
                            {groups.map(({ _id, name, avatar, members }) => (
                                <View key={_id} style={styles.item}>
                                    <Avatar src={avatar} size={40} />
                                    <View style={styles.groupInfo}>
                                        <Text style={styles.groupName}>{name}</Text>
                                        <Text style={styles.groupMembers}>
                                            {members}
                                            人
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </PageContainer>
                </Tab>
                <Tab
                    heading={`用户(${users.length})`}
                    tabStyle={{ backgroundColor: 'transparent' }}
                    activeTabStyle={{ backgroundColor: 'transparent' }}
                >
                    <PageContainer>
                        <ScrollView>
                            {users.map(({ _id, username, avatar }) => (
                                <View key={_id} style={styles.item}>
                                    <Avatar src={avatar} size={40} />
                                    <Text style={styles.username}>{username}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </PageContainer>
                </Tab>
            </Tabs>
        </PageContainer>
    );
}

export default SearchResult;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
    },
    item: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
    },
    groupInfo: {
        marginLeft: 8,
    },
    groupName: {
        color: '#444',
    },
    groupMembers: {
        fontSize: 14,
        color: '#888',
        marginTop: 1,
    },
    username: {
        color: '#444',
        marginLeft: 8,
    },
});
