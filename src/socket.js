import IO from 'socket.io-client';

const options = {
    transports: ['websocket'],
};
const socket = new IO('http://192.168.1.105:9200', options);
export default socket;
