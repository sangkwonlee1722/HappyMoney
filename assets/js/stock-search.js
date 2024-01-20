// import { addComma } from "./stock-rank";

/* 현재 주소에서 Query Keyword 추출 */
const urlParams = new URLSearchParams(window.location.search);
const keyword = urlParams.get('keyword')


/* 검색 결과를 서버에서 가져오는 함수 */
export const getSearchData = async (keyword) => {
  try {
    const apiUrl = `http://localhost:3000/api/stock/search?keyword=${keyword}`
    const data = await axios.get(apiUrl);

    const stocks = data.data.data;
    console.log('stocks: ', stocks);

    const mainDom = document.querySelector(".search-list-wrap");

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
        <a href="#none"></a>
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

  } catch (error) {
    console.error(error)
  }
}

document.addEventListener("DOMContentLoaded", getSearchData(keyword));

/* 시가 총액 한글 표현으로 계산하는 함수 */
const formatPrice = (number) => {
  const trillion = Math.floor(number / 1e12);
  const billion = Math.floor((number % 1e12) / 1e8);

  const formattedNumber = [];

  if (trillion > 0) {
    formattedNumber.push(`${trillion.toLocaleString()}조`);
  }

  if (billion > 0) {
    const billionString = billion.toLocaleString();
    formattedNumber.push(`${billionString}억`);
  }

  return formattedNumber.join(' ');
}

/* 숫자 함수 */
function addComma(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}