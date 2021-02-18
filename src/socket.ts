import IO from 'socket.io-client';

const options = {
    transports: ['websocket'],
};

const host = 'https://fiora.suisuijiang.com';
const socket = IO(host, options);

export default socket;
