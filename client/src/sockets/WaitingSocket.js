import { io }  from 'socket.io-client';

const socket = io('http://localhost:4000/waiting-room' ,{
    autoConnect: false,
});
export default socket;