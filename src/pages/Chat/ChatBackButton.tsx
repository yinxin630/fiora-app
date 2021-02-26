import { View, Icon, Text } from 'native-base';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { useStore } from '../../hooks/useStore';

function ChatBackButton() {
    const store = useStore();
    const unread = store.user?.linkmans.reduce((result, linkman) => {
        result += linkman.unread;
        return result;
    }, 0);

    return (
        <TouchableOpacity onPress={() => Actions.pop()}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="chevron-back-outline" style={{ color: 'white', fontSize: 32 }} />
                {!!unread && unread > 0 && (
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 18,
                            fontWeight: 'bold',
                        }}
                    >
                        {unread}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

export default ChatBackButton;
