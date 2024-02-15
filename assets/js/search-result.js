import { addComma, formatPrice } from "./common.js";

// HTML 요소를 만들어서 검색 결과를 화면에 표시
function displaySearchResults(data) {
  const noticesList = document.getElementById("noticesList");
  const postsList = document.getElementById("postsList");
  const stocksList = document.getElementById("stocksList");

  if (data.notices.length > 0) {
    data.notices.forEach((notice) => {
      const listItem = document.createElement("li");
      const { id, title, createdAt } = notice;
      const formattedDate = createdAt.split("T")[0];
      listItem.innerHTML = `
        <a href="/views/notice-page.html?id=${id}" class="notice-page-item">
            <div class="list-info">
                <div class="classification">공지사항</div>
                <div class="title">${title}</div>
                <div class="list-info-2">
                    <div class="author">관리자</div>
                    <div class="date">${formattedDate}</div>
                </div>
            </div>
        </a>`;
      noticesList.appendChild(listItem);
    });
  } else {
    // 검색 결과가 없는 경우 메시지 표시
    const noResultsMessage = document.createElement("li");
    noResultsMessage.textContent = "검색 결과가 없습니다.";
    noticesList.appendChild(noResultsMessage);
  }

  if (data.posts.length > 0) {
    data.posts.forEach((post) => {
      const listItem = document.createElement("li");
      const { nickName, title, category, createdAt, id } = post;
      const dateObject = new Date(createdAt);
      const formattedDate = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, "0")}-${String(dateObject.getDate()).padStart(2, "0")} ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;

      listItem.innerHTML = `
        <a href="/views/post-read.html?id=${id}" class="post-item">
            <div class="list-info">
                <div class="classification">${category}</div>
                <div class="title">${title}</div>
                <div class="list-info-2">
                    <div class="author">${nickName}</div>
                    <div class="date">${formattedDate}</div>
                </div>
            </div>
        </a>`;
      postsList.appendChild(listItem);
    });
  } else {
    // 검색 결과가 없는 경우 메시지 표시
    const noResultsMessage = document.createElement("li");
    noResultsMessage.textContent = "검색 결과가 없습니다.";
    postsList.appendChild(noResultsMessage);
  }

  if (data.stocks.length > 0) {
    data.stocks.forEach((stock) => {
      const listItem = document.createElement("li");

      const {
        srtnCd: stockCode,
        itmsNm: stockName,
        mrktCtg: market,
        mrktTotAmt: totalPrice,
        lstgStCnt: stockCounts
      } = stock;

      const formattedPrice = formatPrice(totalPrice);
      const formattedStockNumbers = addComma(stockCounts);

      const listItemContent = `

            <a href="/views/stock-detail.html?code=${stockCode}&name=${encodeURIComponent(stockName)}"></a>
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

    `;

      listItem.innerHTML = listItemContent;
      stocksList.appendChild(listItem);

      $(listItem)
        .find("a")
        .on("click", function (e) {
          e.preventDefault();
          alert("아직 준비중입니다.");
        });
    });
  } else {
    // 검색 결과가 없는 경우 메시지 표시
    const noResultsMessage = document.createElement("li");
    noResultsMessage.textContent = "검색 결과가 없습니다.";
    stocksList.appendChild(noResultsMessage);
  }
}

// URL에서 검색 키워드를 가져오기
function getKeywordFromURL() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get("keyword");
}

document.addEventListener("DOMContentLoaded", async function () {
  const keyword = getKeywordFromURL();

  if (keyword) {
    try {
      const response = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) {
        throw new Error("네트워크 연결에 에러가 있습니다.");
      }
      const data = await response.json();
      displaySearchResults(data);
    } catch (error) {
      console.error("검색 작업 중에 에러가 발생했습니다.:", error);
    }
  } else {
    console.error("검색결과를 찾을 수 없습니다.");
  }
});
