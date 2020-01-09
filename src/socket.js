import IO from 'socket.io-client';

const options = {
    transports: ['websocket'],
};

let socket = null;

const newInstanceListener = [];

export default {
    instance: socket,
    connect(host) {
        if (!host) {
            host = 'https://chat.2233.pp.ua';
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
    onNewInstance(callback) {
        newInstanceListener.push(callback);
        if (socket) {
            callback(socket);
        }
    },
};
