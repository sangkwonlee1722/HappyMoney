import { addComma, formatPrice } from "./common.js";
import getToken from "./common.js"

const token = getToken()


/* 나의 계좌 정보 받아오기 */
export const getMyAccountInfo = async () => {
  const apiUrl = '/api/accounts/info'

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

  const originBuyValues = myStocks.map(stock => { // 나의 보유 주식들의 1주 평균 매입단가 * 보유 주식 수 = 투자 원금
    const averageBuyValues = (stock.totalCompleteBuyOrderPrice / stock.totalCompleteBuyOrderNumbers)
    const originValues = averageBuyValues * stock.numbers
    return originValues
  })

  const ttlOriginBuyValues = originBuyValues.reduce((a, b) => a + b, 0); // 투자원금을 구하기 위해 배열 요소의 합을 구함

  const profitOfStocks = totalStockValue - ttlOriginBuyValues
  const profitPercentofStocks = ttlOriginBuyValues === 0 ? 0 : ((profitOfStocks / ttlOriginBuyValues) * 100).toFixed(1)
  const formatProfitOfStocks = profitOfStocks > 0 ? `+${addComma(profitOfStocks)}` : `${addComma(profitOfStocks)}`


  const formatPoint = addComma(point);
  const formatOrderPrice = addComma((totalOrderPrice));
  const formatStockValue = ttlOriginBuyValues !== 0 ? addComma(totalStockValue) : 0

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


/* 나의 보유 주식 가져오기 */
export const getMyStocks = async () => {
  const apiUrl = '/api/order/stock'

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })

    const myStocks = result.data.data

    return myStocks

  } catch (error) {
    console.error(error)
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

/* 보유 주식 뿌려주기 */
export const spreadMyStocks = async () => {
  const mainDom = document.querySelector('.my-stock-list')


  if (myStocks.length !== 0) {
    mainDom.innerHTML = myStocks
      .map(myStock => {
        const { id, stockName, stockCode, numbers, clpr, totalCompleteBuyOrderNumbers, totalCompleteBuyOrderPrice } = myStock

        /* 현재 해당 주식 평가 금액 (전일 종가 기준) */
        const stockValues = clpr * numbers
        const formatStockValues = addComma(stockValues)

        /* 투자 원금 대비 수익액(률) */
        const averageBuyValues = Math.ceil(totalCompleteBuyOrderPrice / totalCompleteBuyOrderNumbers) // 1주 구매 평균 단가
        const originValues = averageBuyValues * numbers // 투자 원금 (1주 평균 구매단가 * 현재 보유 주식 수)

        const profit = stockValues - originValues
        const formatProfit = profit > 0 ? `+${addComma(profit)}` : `${addComma(profit)}`

        const profitPercent = ((profit / originValues) * 100).toFixed(1)

        let profitClass

        if (profit > 0) {
          profitClass = 'red'
        } else if (profit < 0) {
          profitClass = 'blue'
        }

        return `
        <li data-id=${id}>
        <a href="/views/stock-detail.html?code=${stockCode}&name=${stockName}"></a>
        <div class="my-stock-name-box">
          <div class="name-code">
            <div class="stock-name">${stockName}</div>
            <div class="stock-code">${stockCode}</div>
          </div>
          <div class="my-stock-counts">${numbers}주</div>
        </div>
        <div class="stock-value-box">
          <div class="ttl-price">${formatStockValues} 원</div>
          <div class="my-stock-roi ${profitClass}">${formatProfit}원 (${profitPercent}%)</div>
        </div>
      </li>
        `
      })
      .join("")
  } else {
    mainDom.innerHTML = `
    <div class="none-contents">
      <span>보유 종목이 없습니다.</span>
    </div>
    `
  }
}

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
const myStocks = await getMyStocks()
await spreadMyAccountInfo()
await spreadMyStocks()
await spreadStarStocks();