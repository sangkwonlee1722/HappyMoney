import { addComma } from "/js/common.js";
import getToken from "./common.js";

const token = getToken()

rankListData();

async function rankListData() {
  const stockUrl = "/api/stock/stockRank";

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
              <a href='/views/stock-detail.html?code=${list.mksc_shrn_iscd}&name=${list.hts_kor_isnm}&page=1'></a>
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

/* 랭킹 데이터 가져오기 */

async function getAccountRank() {
  const apiUrl = '/api/accounts/rank'

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })

    const topTenAccounts = result.data.topTenAccounts
    console.log('topTenAccount: ', topTenAccounts);

    return topTenAccounts
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

async function spreadTopTenAccounts() {
  const mainDom = document.querySelector('.account-rank-list')
  const topTenAccounts = await getAccountRank()

  /* 랭킹 기준 날짜 보여주기 */
  const updateDate = new Date(topTenAccounts[0].updatedAt)
  const koreanTime = `${updateDate.getFullYear()}-${String(updateDate.getMonth() + 1).padStart(2, "0")}-${String(updateDate.getDate()).padStart(2, "0")} ${String(updateDate.getHours()).padStart(2, "0")}:${String(updateDate.getMinutes()).padStart(2, "0")}`;

  $('.criteria-date').text(`* ${koreanTime} 기준`)

  let rank = 0

  mainDom.innerHTML = topTenAccounts
    .map(account => {
      const { id, name: accountName, totalValue, profit, profitPercentage, accountNumber, user } = account

      const formatProfit = profit > 0 ? `${addComma(profit)}` : `${addComma(profit)}`

      const formatValues = addComma(totalValue)

      rank += 1

      return `
      <tr data-id=${id}>
      <th scope="row">${rank}</th>
      <td>${user.nickName}</td>
      <td>${accountName}</td>
      <td>${accountNumber}</td>
      <td>${formatProfit} 원</td>
      <td>${profitPercentage}%</td>
      <td>${formatValues} 원</td>
    </tr>
      `
    }).join("")
}

await spreadTopTenAccounts()