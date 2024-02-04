import { addComma } from "./common.js";
import getToken from "./common.js"
import { formatPrice } from "./stock-search.js"

const token = getToken()

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

  if (starStocks.lenghth !== 0) {
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