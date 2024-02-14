import getToken from "/js/common.js";
import renderPagination from "/js/pagenation.js";

const params = new URLSearchParams(window.location.search);
const twit_page = params.get("page");

// 탭버튼
$(".twit-tab li").on("click", function () {
  $(".twit-tab li").removeClass("on");
  $(this).addClass("on");
  $("#hm-pagination").html("");
});

const pageUrl = window.location.href.includes("receive");
pageUrl ? getTwitData(`/api/twits/getReceive?page=1`) : getTwitData(`/api/twits/getSend?page=1`);

// 쪽지 조회API
async function getTwitData(url) {
  try {
    const config = {
      headers: {
        Authorization: `${getToken()}`,
        "Content-Type": "application/json"
      }
    };
    const result = await axios.get(url, config);
    const list = result.data.list;
    const total = result.data.total;

    const mainDom = document.querySelector("#twitList");

    console.log("list", list.length);
    if (list.length === 0) {
      return (mainDom.innerHTML = `<div class="text-center">메세지가 없습니다.</div>`);
    }

    mainDom.innerHTML = list
      .map((twit) => {
        const { senderName, receiverName, contents, createdAt, id } = twit;
        console.log("receive", receiverName, "send", senderName);
        const send = url === `/api/twits/getReceive?page=${twit_page}` ? false : true;
        const dateObject = new Date(createdAt);
        const formattedDate = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, "0")}-${String(dateObject.getDate()).padStart(2, "0")} ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;
        return `
        <li class="contents">
          <a href="/views/twit/twit-detail.html?send=${send}&id=${id}"></a>
          <div class="list-info">
            <div class="classification">${pageUrl === true ? senderName : receiverName}</div>
            <div class="title">${contents}</div>
          </div>
          <div class="list-info-2">
            <div class="date">${formattedDate}</div>
          </div>
        </li>
        <hr />
        `;
      })
      .join("");

    pageUrl
      ? renderPagination(total, twit_page, "/views/twit/receive-twit.html?")
      : renderPagination(total, twit_page, "/views/twit/twit.html?");
  } catch (error) {
    if (error.response.status === 401) {
      alert("로그인이 필요합니다.");
    } else {
      console.error(error.response);
      const errorMessage = error.response.data.message;
      alert(errorMessage);
    }
  }
}
