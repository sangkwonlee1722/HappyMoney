import { addComma } from "/js/common.js";

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
              <a href='/views/stock-detail.html?code=${list.mksc_shrn_iscd}&name=${list.hts_kor_isnm}'></a>
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