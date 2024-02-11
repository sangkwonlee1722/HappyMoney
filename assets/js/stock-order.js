import { addComma, drPopupOpen } from "./common.js";
import getToken from "./common.js"
import renderPagination from '/js/pagenation.js'

const token = getToken();
const params = new URLSearchParams(window.location.search)
const ordersPage = params.get("page")

/* 전체 주문내역 가져오기 */
const getMyOrders = async () => {
  const apiUrl = `/api/order/order?page=${ordersPage}`
  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })

    const ordersLists = result.data.orders
    const ordersTotal = result.data.total

    return {
      ordersLists,
      ordersTotal
    }

  } catch (error) {
    console.error(error)
  }
}

const spreadOrderLists = async () => {
  const mainDom = document.querySelector('.order-list')
  const { ordersLists, ordersTotal } = await getMyOrders()

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
    renderPagination(ordersTotal, ordersPage, '/views/stock-order.html');
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