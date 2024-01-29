import { baseUrl } from "./common.js";
import renderPagination from "/js/pagenation.js";

const params = new URLSearchParams(window.location.search);
const noticePage = params.get("page");
console.log(noticePage);
const getNoticeData = async () => {
  try {
    const apiUrl = baseUrl + `notices?page=${noticePage}`;
    const result = await axios.get(apiUrl);

    const noticeList = result.data.list;
    console.log(noticeList);
    const noticeTotal = result.data.total;
    return { noticeList, noticeTotal };
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  try {
    const { noticeList, noticeTotal } = await getNoticeData();
    const mainDom = document.querySelector(".notice-list");

    mainDom.innerHTML = noticeList
      .map((notice) => {
        const { id, title, createdAt } = notice;
        const formattedDate = createdAt.split("T")[0];

        return `
        <li class="contents">
        <a href="http://localhost:3000/views/notice-page.html#${id}"></a>
          <div class="list-info">
            <div class="classification">NOTICE</div>
            <div class="title">${title}</div>
          </div>
          <div class="list-info-2">
           <div class="author">관리자</div>
           <div class="date">${formattedDate}</div>
         </div>
        </li>
        <hr />
        `;
      })
      .join("");
    renderPagination(noticeTotal, noticePage, "/views/notice-main.html");
  } catch (error) {
    console.error(error);
  }
})();

const writeButton = document.querySelector(".hm-button a");
writeButton.addEventListener("click", () => {
  window.location.href = "http://localhost:3000/views/notice-posting.html#none";
});
