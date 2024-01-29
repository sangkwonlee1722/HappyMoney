import io from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import { addComma } from "/js/common.js";

const params = new URLSearchParams(window.location.search);
const tr_key = params.get("code");


const socket = io('ws://localhost:3000/ws/stock', {
  transports: ['websocket'],
});

// 연결 성공 시 동작
socket.on('connect', () => {
  console.log('Connected to server');

  // 메시지 전송
  socket.emit('asking_price', tr_key);
});

socket.on('asking_price', (data) => {
  console.log('Received asking_price:', data);
})