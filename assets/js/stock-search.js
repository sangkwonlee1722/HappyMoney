import { addComma, formatPrice } from "./common.js";

/* 현재 주소에서 Query Keyword 추출 */
const urlParams = new URLSearchParams(window.location.search);
const keyword = urlParams.get('keyword')


/* 검색 결과를 서버에서 가져오는 함수 */
export const getSearchData = async (keyword) => {
  try {
    const apiUrl = `/api/stock/search?keyword=${keyword}`
    const result = await axios.get(apiUrl);

    const stocks = result.data.data;

    const mainDom = document.querySelector(".search-list-wrap");

    if (stocks.length !== 0) {
      mainDom.innerHTML = stocks
        .map(stock => {
          const {
            srtnCd: stockCode,
            itmsNm: stockName,
            mrktCtg: market,
            mrktTotAmt: totalPrice,
            lstgStCnt: stockCounts } = stock;

          const formattedPrice = formatPrice(totalPrice);
          const formattedStockNumbers = addComma(stockCounts)

          return `
      <li>
        <a href="/views/stock-detail.html?code=${stockCode}&name=${stockName}"></a>
        <div class="stock-name-box">
          <div class="market">${market}</div>
          <div class="name-code">
            <div class="stock-name">${stockName}</div>
            <div class="stock-code">${stockCode}</div>
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
        <span>검색 결과가 없습니다.</span>
      </div>
      `
    }



  } catch (error) {
    console.error(error)
  }
}

document.addEventListener("DOMContentLoaded", getSearchData(keyword));


