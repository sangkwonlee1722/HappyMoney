import io from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import { addComma } from "/js/common.js";
import getToken from './common.js';

const params = new URLSearchParams(window.location.search);
const trKey = params.get("code");
const trName = params.get("name");

const token = getToken()

// 탭메뉴
$('#stockDtTab').html(`
  <button class="hm-button fw-bold me-3" id="stock-price-button"><a href="/views/stock-detail.html?code=${trKey}&name=${trName}">호가</a></button>
  <button class="hm-button hm-gray-color fw-bold" id="my-stock-button"><a href="/views/stock-detail-my.html?code=${trKey}&name=${trName}&page=1">내 주식</a></button>
`);

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

// 구매(매수)버튼 클릭 시
$('#buyBtn').on('click', function () {
  const bidp = $('.sell.num1 .price').text();
  if (bidp === '') {
    alert('호가 업데이트가 되지않아 구매가 불가능합니다.');
    return;
  }
  if (isKoreanWeekday() && isKoreanWorkingHour()) {
    const bidp = $('.sell.num1 .price').text();
    const bidp1 = parseFloat(bidp.replace(',', ''));
    buyFatchData(bidp1);
  } else {
    alert('장 운영 일자가 주문일과 상이합니다.');
    return;
  }
})

// 판매(매도)버튼 클릭 시
$('#sellBtn').on('click', function () {
  if (isKoreanWeekday() && isKoreanWorkingHour()) {
    const bidp = $('.sell.num1 .price').text();
    const bidp1 = parseFloat(bidp.replace(',', ''));
    if (bidp === '') {
      alert('호가 업데이트가 되지않아 판매가 불가능합니다.');
      return;
    }
    sellFatchData(bidp1);
  } else {
    alert('장 운영 일자가 주문일과 상이합니다.');
    return;
  }
})

// 구매API
async function buyFatchData(bidp) {
  try {
    const stockName = trName;
    const stockCode = trKey;
    const orderNumbers = $('#stockAmount').val();
    const price = $('#fixPrice').val();
    const header = {
      headers: {
        'Authorization': `${getToken()}`,
        'Content-Type': 'application/json'
      },
    };
    const body = {
      status: bidp > price ? 'order' : 'complete',
      stockName,
      stockCode,
      orderNumbers,
      price
    };
    const result = await axios.post('/api/order/buy', body, header);
    const data = result.data;
    if (data.success === true) {
      alert(`해당 주식을 구매(매수) 했습니다.`);
    } else {
      alert('구매(매수)에 실패했습니다.');
    }
  } catch (error) {
    alert(error.response.data.message);
    console.error(error);
  }
}

// 판매API
async function sellFatchData(bidp) {
  try {
    const stockName = trName;
    const stockCode = trKey;
    const orderNumbers = $('#stockAmount').val();
    const price = $('#fixPrice').val();
    const header = {
      headers: {
        'Authorization': `${getToken()}`,
        'Content-Type': 'application/json'
      },
    };
    const body = {
      status: bidp < price ? 'order' : 'complete',
      stockName,
      stockCode,
      orderNumbers,
      price,
    };
    const result = await axios.post('/api/order/sell', body, header);
    const data = result.data;
    if (data.success === true) {
      alert(`해당 주식을 판매(매도) 했습니다.`);
    } else {
      alert('판매(매도)에 실패했습니다.');
    }
  } catch (error) {
    alert(error.response.data.message);
    console.error(error);
  }
}

// 시장가 체크 유무
$('#fixCheck').on('change', function () {
  if (!$(this).is(':checked')) {
    $('#fixPrice').prop('disabled', false);
  } else {
    $('#fixPrice').prop('disabled', true);
  }
});

// 주문수량 바꿀 때 계산
$('#stockAmount').on('input', function () {
  const fixPrice = $('#fixPrice').val();
  const num = $(this).val();
  $('.total-price').text('');
  $('.total-price').text(addComma(fixPrice * num));
});
// 가격을 바꿀 때 계산
$("#fixPrice").on('input', function () {
  const fixPrice = $(this).val();
  const num = $('#stockAmount').val();

  $('.total-price').text('');
  $('.total-price').text(addComma(fixPrice * num));
})

function isKoreanWeekday() {
  const koreanOptions = { timeZone: 'Asia/Seoul', weekday: 'long' };
  const dayOfWeek = new Intl.DateTimeFormat('en-US', koreanOptions).formatToParts(new Date()).find(part => part.type === 'weekday').value;
  // 여기서는 "Monday"부터 "Friday"까지를 평일로 간주합니다.
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(dayOfWeek);
}

// 9:00 ~ 15:20
function isKoreanWorkingHour() {
  const koreanOptions = { timeZone: 'Asia/Seoul' };
  const currentHour = new Date().toLocaleString('en-US', { ...koreanOptions, hour: '2-digit', minute: '2-digit', hour12: false });
  const [hour, minute] = currentHour.split(" ")[0].split(":").map(Number);
  // 시간이 9시부터 15시 20분 사이인지 확인
  return (hour === 9 && minute >= 0) || (hour > 9 && hour < 15) || (hour === 15 && minute <= 20);
}

function livePriceData() {
  // 여기에서 새로운 WebSocket 연결을 생성하고 반환
  const socket = io('/ws/stock', {
    transports: ['websocket'],
  });

  // 연결 성공 시 동작
  socket.on('connect', () => {

    // 메시지 전송
    socket.emit(`asking_price`, trKey);
  });

  socket.on(`asking_price_${trKey}`, async (data) => {
    const price = data;
    const tax = price.bidp1;
    const liveCode = price.mksc_shrn_iscd.split("|")[3];

    // 코드가 같은거만 나오게
    if (liveCode === trKey) {
      $('.stock-dt-tit-box > .price').text(`${addComma(price.bidp1)}원`);

      // 시장가 체크에 따른 수정
      const fixPrice = $('#fixPrice').val();
      const num = $('#stockAmount').val();

      if ($('#fixPrice').prop('disabled')) {
        $('#fixPrice').val(`${tax}`);
        $('.total-price').text('');
      }
      $('.total-price').text(addComma(fixPrice * num));

      for (let i = 1; i < 11; i++) {
        $(`.stock-dt-live .buy.num${i} .price`).text(addComma(price[`askp${i}`]));
        $(`.stock-dt-live .buy.num${i} .amount`).text(addComma(price[`askp_rsqn${i}`]));
        $(`.stock-dt-live .sell.num${i} .price`).text(addComma(price[`bidp${i}`]));
        $(`.stock-dt-live .sell.num${i} .amount`).text(addComma(price[`bidp_rsqn${i}`]));
      }
    }
  })
}

async function priceData() {
  try {
    const result = await axios.get(`/api/stock/stockPrice?code=${trKey}`);
    const item = result.data.item.output1;
    $('.stock-dt-tit-box > .price').text(`${addComma(item.bidp1)}원`);
    $('#fixPrice').val(`${item.bidp1}`);
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

/* 관심 종목일 경우 노란별 */
async function checkStarStock(trKey) {
  const apiUrl = `/api/star-stock/${trKey}`
  const result = await axios.get(apiUrl, {
    headers: {
      'Authorization': token,
    }
  })

  const isStarStock = result.data.stock

  if (isStarStock) {
    $('.star-stock-off').css('display', "none")
    $('.star-stock-on').css('display', "flex")
    return
  }
  $('.star-stock-on').css('display', "none")
  $('.star-stock-off').css('display', "flex")
  return
}

await checkStarStock(trKey);

/* 관심 종목 추가 */
async function addStarStock() {
  const apiUrl = `/api/star-stock/${trKey}`

  try {
    await axios.post(apiUrl, {}, {
      headers: {
        'Authorization': token,
      }
    })
    await checkStarStock(trKey);
  } catch (error) {
    console.error(error)
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

$('.star-stock-off').on("click", async function () {
  await addStarStock()
});

/* 관심 종목 삭제 */
async function deleteStarStock() {
  const apiUrl = `/api/star-stock/${trKey}`

  try {
    await axios.delete(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })

    await checkStarStock(trKey);

  } catch (error) {
    console.error(error)
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

async function switchMyStockInfo() {
  $('.stock-dt-cont-wrap').hide()

  await spreadOrderLists()
}

$('.star-stock-on').on('click', async function () {
  await deleteStarStock()
})