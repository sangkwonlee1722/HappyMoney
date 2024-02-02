import io from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import { addComma } from "/js/common.js";

const params = new URLSearchParams(window.location.search);
const trKey = params.get("code");
const trName = params.get("name");

$('.stock-dt-tit h2').html(`${trName}<span>(${trKey})</span>`);

$('.sell-buy-tab .buy-tab').on('click', function () {
  $('.sell-buy-tab li').removeClass('on');
  $(this).addClass('on');
  $('.total-price').css('color', '#db1515');
  $('.max-price span').css('color', '#db1515');
  $('.buy-btn').css('display', 'block');
  $('.sell-btn').css('display', 'none');
});
$('.sell-buy-tab .sell-tab').on('click', function () {
  $('.sell-buy-tab li').removeClass('on');
  $(this).addClass('on');
  $('.total-price').css('color', '#405FFF');
  $('.max-price span').css('color', '#405FFF');
  $('.sell-btn').css('display', 'block');
  $('.buy-btn').css('display', 'none');
});
$('.percent li').on('click', function () {
  $('.percent li').removeClass('on');
  $(this).toggleClass('on');
});
$('#stockAmount').focus(function () {
  $('.percent li').removeClass('on');
})



// 현재 시간 확인 후 조건에 따라 로직 실행
if (isKoreanWeekday() && isKoreanWorkingHour()) {
  livePriceData();
} else {
  priceData();
}

// 시장가 체크 유무
$('#fixCheck').on('change', function () {
  if (!$(this).is(':checked')) {
    $('#fixPrice').prop('disabled', false);
  } else {
    $('#fixPrice').prop('disabled', true);
  }
});

// 주문총액 계산
$('#stockAmount').on('input', function () {
  const fixPrice = parseInt($('#fixPrice').val(), 10);
  const num = Number($(this).val());
  $('.total-price').text(addComma(fixPrice * num));
});

console.log(isKoreanWorkingHour());
function isKoreanWeekday() {
  const koreanOptions = { timeZone: 'Asia/Seoul', weekday: 'long' };
  const dayOfWeek = new Intl.DateTimeFormat('en-US', koreanOptions).formatToParts(new Date()).find(part => part.type === 'weekday').value;
  // 여기서는 "Monday"부터 "Friday"까지를 평일로 간주합니다.
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(dayOfWeek);
}

function isKoreanWorkingHour() {
  const koreanOptions = { timeZone: 'Asia/Seoul' };
  const currentHour = new Date().toLocaleString('en-US', { ...koreanOptions, hour: '2-digit', hour12: false });
  const time = Number(currentHour.split(" ")[0]);
  return time >= 9 && time < 16;
}

function livePriceData() {
  console.log("평일 9시부터 16시까지 실행");
  // 여기에서 새로운 WebSocket 연결을 생성하고 반환
  const socket = io('/ws/stock', {
    transports: ['websocket'],
  });

  // 연결 성공 시 동작
  socket.on('connect', () => {
    console.log('Connected to server');

    // 메시지 전송
    socket.emit('asking_price', trKey);
  });

  socket.on('asking_price', async (data) => {
    const price = JSON.parse(data);
    const tax = parseInt(price.bidp1, 10);
    console.log(price);
    $('.stock-dt-tit-box > .price').text(`${addComma(price.bidp1)}원`);
    // console.log(price.bidp1);

    if ($('#fixPrice').prop('disabled')) {
      $('#fixPrice').val(`${tax}`);
    }

    for (let i = 1; i < 11; i++) {
      $(`.stock-dt-live .buy.num${i} .price`).text(addComma(price[`askp${i}`]));
      $(`.stock-dt-live .buy.num${i} .amount`).text(addComma(price[`askp_rsqn${i}`]));
      $(`.stock-dt-live .sell.num${i} .price`).text(addComma(price[`bidp${i}`]));
      $(`.stock-dt-live .sell.num${i} .amount`).text(addComma(price[`bidp_rsqn${i}`]));
    }
  })

}

async function priceData() {
  try {
    console.log("평일 9시부터 16시 외에 실행");
    const result = await axios.get(`/api/stock/stockPrice?code=${trKey}`);
    const item = result.data.item.output1;
    const price = result.data.item.output2.stck_prpr;
    $('.stock-dt-tit-box > .price').text(`${addComma(item.bidp1)}원`);
    $('#fixPrice').val(`${price}`);
    for (let i = 1; i < 11; i++) {
      $(`.stock-dt-live .buy.num${i} .price`).text(addComma(item[`askp${i}`]));
      $(`.stock-dt-live .buy.num${i} .amount`).text(addComma(item[`askp_rsqn${i}`]));
      $(`.stock-dt-live .sell.num${i} .price`).text(addComma(item[`bidp${i}`]));
      $(`.stock-dt-live .sell.num${i} .amount`).text(addComma(item[`bidp_rsqn${i}`]));
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}