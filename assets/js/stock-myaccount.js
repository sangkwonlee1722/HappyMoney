import { addComma, formatPrice } from "./common.js";
import getToken from "./common.js"

const token = getToken()

/* 나의 계좌 정보 받아오기 */
export const getMyAccountInfo = async () => {
  const apiUrl = '/api/accounts'

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })

    const myAccountInfo = result.data.data
    return myAccountInfo
  } catch (error) {
    console.error(error)
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

/* 내 계좌 정보 뿌려주기 */
export const spreadMyAccountInfo = async () => {
  const mainDom = document.querySelector('.my-account-header')
  const myAccount = await getMyAccountInfo()

  const { point, totalStockValue, totalOrderPrice, totalOrderCompletePrice } = myAccount;

  /* 해당 통장의 총 가치 평가 */
  const baseValue = 100000000
  const ttlAccountValues = point + totalStockValue + totalOrderPrice

  const profit = ttlAccountValues - baseValue
  const formatProfit = profit > 0 ? `+${addComma(profit)}` : `${addComma(profit)}`
  const profitPercentage = ((profit / baseValue) * 100).toFixed(1)

  const formatTtlAccountValues = addComma(ttlAccountValues);

  /* 보유 주식의 총 가치 평가 */
  const profitOfStocks = totalStockValue - totalOrderCompletePrice
  const profitPercentofStocks = ((profitOfStocks / totalOrderCompletePrice) * 100).toFixed(1)
  const formatProfitOfStocks = profitOfStocks > 0 ? `+${addComma(profitOfStocks)}` : `${addComma(profitOfStocks)}`

  const formatPoint = addComma(point);
  const formatOrderPrice = addComma((totalOrderPrice));
  const formatStockValue = addComma(totalStockValue);

  let profitOfStockClass

  if (profitOfStocks > 0) {
    profitOfStockClass = 'red'
  } else if (profitOfStocks < 0) {
    profitOfStockClass = 'blue'
  }


  let profitClass

  if (profit > 0) {
    profitClass = 'red'
  } else if (profit < 0) {
    profitClass = 'blue'
  }

  mainDom.innerHTML = `
  <div class="my-account-top-wrap">
  <div class="my-account-value-wrap">
    <h2 class="my-account-total">나의 총 자산</h2>
    <span class="my-account-value">${formatTtlAccountValues} 원</span>
    <span class="my-account-roi ${profitClass}"> ${formatProfit} 원 (${profitPercentage}%)</span>
  </div>
  <div class="my-order-btn">
    <button class="hm-button">주문내역 보기</button>
  </div>
</div>
<div class="my-account-info-wrap mt-4">
  <ul class="my-account-info">
    <li class="point">
      <div class="point-title">주문 가능 포인트</div>
      <div class="point-value">${formatPoint} 원</div>
    </li>
    <li class="order-point mt-2">
      <div class="order-point-title">주문중인 포인트</div>
      <div class="order-point-value">${formatOrderPrice} 원</div>
    </li>
    <li class="hold-stocks mt-2">
      <div class="hold-stocks-title">보유 주식 총 가치</div>
      <div class="hold-stock-info">
        <div class="hold-ttl-price">${formatStockValue} 원</div>
        <div class="hold-stock-profit ${profitOfStockClass}">${formatProfitOfStocks} 원 (${profitPercentofStocks}%)</div>
      </div>
    </li>
  </ul>
</div>
  `
}

await spreadMyAccountInfo()




/* 나의 관심주식 데이터 받아오기 */
export const getStarStocks = async () => {
  const apiUrl = '/api/star-stock'

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })

    const starStocks = result.data.starStocks

    return starStocks
  } catch (error) {
    console.error(error)
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

/* 관심 주식 뿌려주기 */
export const spreadStarStocks = async () => {
  const mainDom = document.querySelector('.star-stock-list')
  const starStocks = await getStarStocks()

  if (starStocks.length !== 0) {
    mainDom.innerHTML = starStocks
      .map(starStock => {
        const { id, stock } = starStock
        const { itmsNm, lstgStCnt, mrktCtg, mrktTotAmt, srtnCd } = stock

        const formattedPrice = formatPrice(mrktTotAmt);
        const formattedStockNumbers = addComma(lstgStCnt)

        return `
        <li data-id=${id}>
        <a href="/views/stock-detail.html?code=${srtnCd}&name=${itmsNm}"></a>
        <div class="stock-name-box">
          <div class="market">${mrktCtg}</div>
          <div class="name-code">
            <div class="stock-name">${itmsNm}</div>
            <div class="stock-code">${srtnCd}</div>
          </div>
        </div>
        <div class="stock-info-box">
          <div class="ttl-price">${formattedPrice}</div>
          <div class="stock-counts">${formattedStockNumbers} 주</div>
        </div>
      </li>
        `
      })
      .join("")
  } else {
    mainDom.innerHTML = `
    <div class="none-contents">
      <span>관심 종목이 없습니다.</span>
    </div>
    `
  }
}

await spreadStarStocks();