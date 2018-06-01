import IO from 'socket.io-client';

const options = {
    transports: ['websocket'],
};
const socket = new IO('https://fiora.suisuijiang.com', options);
export default socket;
