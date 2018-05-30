import IO from 'socket.io-client';

const options = {
    transports: ['websocket'],
};
const socket = new IO('http://localhost:9200', options);
export default socket;
