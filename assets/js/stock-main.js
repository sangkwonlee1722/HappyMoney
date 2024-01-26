import token from '../js/common.js'
import io from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

async function rankListData() {
  const stockUrl = "http://localhost:3000/api/stock/stockRank";

  try {
    const stockList = await axios.get(stockUrl);
    const list = stockList.data.list.output.slice(0, 10);
    // console.log(list);

    const mainDom = document.querySelector(".rank-list-wrap");
    mainDom.innerHTML = list
      .map((list) => {
        const formattedPrice = addComma(list.stck_prpr);
        const percentClass = $(".rank-list-wrap .rank-price span").addClass("mius");
        const priceClass = parseFloat(list.prdy_ctrt) < 0 ? percentClass : "";
        return `
            <li>
              <a href='#none'></a>
              <div class="rank-name">
                <p><span>${list.data_rank}</span> ${list.hts_kor_isnm}</p>
              </div>
              <div class="rank-price">
                <p>${formattedPrice} 원</p>
                <span>${list.prdy_ctrt}%</span>
              <div>
            </li>
            `;
      })
      .join("");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

function addComma(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.addEventListener("DOMContentLoaded", rankListData);

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
  // console.log('Received asking_price:', data);
})