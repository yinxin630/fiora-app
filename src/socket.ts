import IO from 'socket.io-client';
import { Socket } from './types/socket';

const options = {
    transports: ['websocket'],
};

let socket: Socket = null;

const newInstanceListener = [];

export default {
    instance: socket,
    connect(host) {
        if (!host) {
            host = 'https://fiora.suisuijiang.com';
        }
        socket = new IO(host, options);
        newInstanceListener.forEach(callback => callback(socket));
    },
    changeHost(host) {
        socket.disconnect();
        socket = new IO(host, options);
        socket.connect(host);
        newInstanceListener.forEach(callback => callback(socket));
    },
    onNewInstance(callback: (socket: Socket) => void) {
        newInstanceListener.push(callback);
        if (socket) {
            callback(socket);
        }
    },
};
