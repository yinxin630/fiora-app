import { View, Text } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { deleteMessage } from '../../service';
import action from '../../state/action';

type Props = {
    children: any;
    linkmanId: string;
    messageId: string;
};

function MessageMenu({ children, linkmanId, messageId }: Props) {
    async function handleDeleteMessage() {
        const isSuccess = await deleteMessage(messageId);
        if (isSuccess) {
            action.deleteLinkmanMessage(linkmanId, messageId);
        }
    }

    return (
        <View>
            <Menu>
                <MenuTrigger triggerOnLongPress>{children}</MenuTrigger>
                <MenuOptions>
                    <MenuOption onSelect={handleDeleteMessage}>
                        <View style={styles.option}>
                            <Text>撤回</Text>
                        </View>
                    </MenuOption>
                </MenuOptions>
            </Menu>
        </View>
    );
}

export default MessageMenu;

const styles = StyleSheet.create({
    option: {
        height: 30,
        justifyContent: 'center',
        paddingLeft: 8,
    },
});
