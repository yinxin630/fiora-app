import { AsyncStorage } from 'react-native';

/**
 * 获取token, 超过2s返回空token
 * 安卓7以上机器, AsyncStorage.getItem会卡主一直不返回, 等待RN发版解决问题
 * https://github.com/facebook/react-native/pull/16905
 */
export default async function getStorageValue(key) {
    return new Promise((resolve) => {
        AsyncStorage.getItem(key).then((value) => {
            JSON.stringify(`${key}=${JSON.stringify(value)}`);
            resolve(value);
        });
        setTimeout(() => resolve(''), 2000);
    });
}
