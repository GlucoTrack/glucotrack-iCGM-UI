import { io, Socket } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL ? import.meta.env.VITE_SOCKET_URL : 'http://localhost:4000';
export const socket: Socket = io(URL);