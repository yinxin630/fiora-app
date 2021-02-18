import { Toast } from 'native-base';
import socket from '../socket';

let instance = null;
socket.onNewInstance(newInstance => instance = newInstance);

export default function fetch(event, data = {}, {
    toast = true,
} = {}) {
    return new Promise((resolve) => {
        instance.emit(event, data, (res) => {
            if (typeof res === 'string') {
                if (toast) {
                    Toast.show({
                        text: res,
                        type: 'danger',
                    });
                }
                resolve([res, null]);
            } else {
                resolve([null, res]);
            }
        });
    });
}
