// import io from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import { addComma } from "/js/common.js";
import getToken from './common.js';
import renderPagination from '/js/pagenation.js'

const params = new URLSearchParams(window.location.search);
const trKey = params.get("code");
const trName = params.get("name");

const token = getToken()

// 탭메뉴
$('#stockDtTab').html(`
  <button class="hm-button hm-gray-color fw-bold me-3" id="stock-price-button"><a href="/views/stock-detail.html?code=${trKey}&name=${trName}">호가</a></button>
  <button class="hm-button fw-bold" id="my-stock-button"><a href="/views/stock-detail-my.html?code=${trKey}&name=${trName}&page=1">내 주식</a></button>
`);

$('.stock-dt-tit h2').html(`${trName}<span>(${trKey})</span>`);

// 현재가
try {
  const result = await axios.get(`/api/stock/stockPrice?code=${trKey}`);
  const item = result.data.item.output1;
  $('.stock-dt-tit-box > .price').text(`${addComma(item.bidp1)}원`);
} catch (error) {
  console.log(error);
  throw error;
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

/* 해당 보유 주식 정보 가져오기 */
async function getMyOrderInfo() {
  const apiUrl = `/api/order/stock/${trKey}`

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })

    const myStock = result.data.data

    return myStock

  } catch (error) {
    console.error(error)
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

/* 보유 주식 정보 뿌리기 */
async function spreadMyOrderInfo() {
  const mainDom = document.querySelector('.stock-dt-my-order-info-wrap')
  const myStockInfo = await getMyOrderInfo()

  if (myStockInfo) {
    const { clpr, numbers, stockCode, stockName, totalCompleteBuyOrderNumbers, totalCompleteBuyOrderPrice } = myStockInfo

    const averageBuyValues = Math.ceil(totalCompleteBuyOrderPrice / totalCompleteBuyOrderNumbers) // 1주 구매 평균 단가
    const formatAvgBuyVal = addComma(averageBuyValues)

    const originValues = averageBuyValues * numbers // 투자 원금 (1주 평균 구매단가 * 현재 보유 주식 수)]
    const formatOriginValues = addComma(originValues)

    const ttlStockPrice = clpr * numbers
    const formatTtlPrice = addComma(ttlStockPrice)

    const profit = ttlStockPrice - originValues
    const formatProfit = profit > 0 ? `+${addComma(profit)}` : `${addComma(profit)}`

    const profitPercent = ((profit / originValues) * 100).toFixed(1)
    const formatNumbers = addComma(numbers)

    let profitClass

    if (profit > 0) {
      profitClass = 'red'
    } else if (profit < 0) {
      profitClass = 'blue'
    }

    mainDom.innerHTML = `
    <h2>보유 주식</h2>
    <div class="my-order-header-wrap mt-2">
      <div class="my-order-header-top">
        <div class="my-order-header-top-left">
          <span>1주 평균 금액</span>
          <span class="order-number">${formatAvgBuyVal} 원</span>
        </div>
        <div class="my-order-header-top-right">
          <span>총 평가 금액</span>
          <div class="my-order-total-price-wrap">
            <span class="order-number">${formatTtlPrice} 원</span>
            <span class="ttl-profit ${profitClass}">${formatProfit} (${profitPercent}%)</span>
          </div>
        </div>
      </div>
      <div class="my-order-header-bottom mt-4">
        <div class="my-order-header-bottom-left">
          <span>보유수량</span>
          <span class="order-number">${formatNumbers} 주</span>
        </div>
        <div class="my-order-header-bottom-right">
          <span>투자 원금</span>
          <div class="my-order-total-price-wrap">
            <span class="order-number">${formatOriginValues} 원</span>
          </div>
        </div>
      </div>
    </div>
    `
  } else {
    mainDom.innerHTML = `
    <h2>보유 주식</h2>
    <div class="none-contents">
      <span>보유 주식이 없습니다.</span>
    </div>
    `
  }
}

await spreadMyOrderInfo()

const ordersPage = params.get("page")

/* 해당 주식 주문내역 가져오기 */
const getMyOrders = async () => {
  const apiUrl = `/api/order/order/${trKey}?page=${ordersPage}`
  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })

    const ordersLists = result.data.data.orders
    const ordersTotal = result.data.data.total

    return {
      ordersLists,
      ordersTotal
    }

  } catch (error) {
    console.error(error)
  }
}

/* 주문 내역 뿌리기 */
const spreadOrderLists = async () => {
  const mainDom = document.querySelector('.order-list')
  const { ordersLists, ordersTotal } = await getMyOrders()
  console.log('ordersLists: ', ordersLists);

  if (ordersLists.length !== 0) {
    mainDom.innerHTML = ordersLists
      .map(order => {
        const {
          buySell,
          id,
          orderNumbers,
          status,
          stockName,
          ttlPrice,
          updatedAt
        } = order

        const formatTtlPrice = addComma(ttlPrice)
        const formatOrderNumbers = addComma(orderNumbers)
        const formatDate = updatedAt.split("T")[0]

        let categoryClass
        let orderCategory
        let childCategory
        let cancelButtonDisplay
        let buyCancelClass

        if (buySell === true && status === "complete") {
          categoryClass = "buy";
          orderCategory = "구매";
          childCategory = "구매";
          cancelButtonDisplay = "none"
        } else if (buySell === false && status === "complete") {
          categoryClass = "sell";
          orderCategory = "판매";
          childCategory = "판매";
          cancelButtonDisplay = "none"
        } else if (buySell === true && status === "cancel") {
          categoryClass = "pending";
          orderCategory = "취소";
          childCategory = "구매";
          cancelButtonDisplay = "none"
        } else if (buySell === false && status === "cancel") {
          categoryClass = "pending";
          orderCategory = "취소";
          childCategory = "판매";
          cancelButtonDisplay = "none"
        } else if (buySell === true && status === "order") {
          orderCategory = "대기";
          childCategory = "구매";
        } else if (buySell === false && status === "order") {
          orderCategory = "대기";
          childCategory = "판매";
        }

        return `
            <li data-id=${id}>
              <div class="order-info">
                <span class="parent-category ${categoryClass}">${orderCategory}</span>
                <span class="stock-name">${stockName}</span>
                <span class="order-ttl-price">${formatTtlPrice} 원</span>
                <span class="order-numbers ${categoryClass}">${formatOrderNumbers} 주</span>
                <span class="child-category ${categoryClass}">${childCategory}</span>
              </div>
              <div class="order-date-btn">
              <button class="hm-button hm-sub-color" style="display:${cancelButtonDisplay}">취소하기</button>
                <span>${formatDate}</span>
              </div>
            </li>
        `
      }).join("")
    renderPagination(ordersTotal, ordersPage, `/views/stock-detail-my.html?code=${trKey}&name=${trName}&`);
  } else {
    mainDom.innerHTML = `
    <div class="none-contents">
      <span>주문 내역이 없습니다.</span>
    </div>
    `
  }
}

await spreadOrderLists()

const popupDom = document.querySelector('.delete-order-chk')

/* 대기 주문 취소 확인 팝업 생성 */
$('.order-date-btn button').on('click', function () {
  drPopupOpen('.delete-order-chk')

  const orderId = $(this).closest('li').attr('data-id');
  console.log('orderId: ', orderId);
  const orderCategory = $(this).closest('li').find('.child-category').text();
  const orderStockName = $(this).closest('li').find('.stock-name').text();
  const orderTtlPrice = $(this).closest('li').find('.order-ttl-price').text();
  const orderNumbers = $(this).closest('li').find('.order-numbers').text();

  const buttonId = orderCategory === "구매" ? "cancel-buy-order" : "cancel-sell-order"

  popupDom.innerHTML = `
  <header>
  <h1>대기 주문 취소</h1>
</header>
<div class="hm-popup-content">
  <p class="mt-2" style="color: #eb5665">대기 주문내역은 복구할 수 없습니다.</p>
  <p>그래도 취소하시겠습니까?</p>
  <p class="mt-2" style="color: #eb5665; font-weight:bold"> ${orderStockName} ${orderNumbers} ${orderTtlPrice} ${orderCategory}
</div>
<footer>
  <div class="d-flex justify-content-between hm-bg-white">
    <a href="#none" class="hm-button me-2 hm-gray-color" onclick="drPopupClose(this)">돌아가기</a>
    <a href="#none" class="hm-button ms-2" id=${buttonId} onclick="drPopupClose(this)">취소하기</a>
  </div>
</footer>
  `

  $('#cancel-buy-order').on('click', function () {
    cancelPendingBuyOrder(orderId)
  })

  $('#cancel-sell-order').on('click', function () {
    cancelPendingSellOrder(orderId)
  })

});

async function cancelPendingBuyOrder(orderId) {
  const apiUrl = `/api/order/wait/buy/${orderId}`;
  try {
    await axios.patch(apiUrl, {}, {
      headers: {
        'Authorization': token,
      }
    });
    window.location.reload();
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

async function cancelPendingSellOrder(orderId) {
  const apiUrl = `/api/order/wait/sell/${orderId}`;
  try {
    await axios.patch(apiUrl, {}, {
      headers: {
        'Authorization': token,
      }
    });
    window.location.reload();
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}