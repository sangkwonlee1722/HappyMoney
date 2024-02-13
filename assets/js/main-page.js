import { baseUrl } from "./common.js";
/* 공지사항을 가져오는 함수 */
const getNoticeData = async () => {
  try {
    const apiUrl = baseUrl + `notices?page=1`;

    const result = await axios.get(apiUrl);
    const latestNotices = result.data.list.slice(0, 5);

    const mainDom = document.querySelector(".notice-list");

    if (latestNotices.length === 0) {
      return (mainDom.innerHTML = `<div class="text-center my-5">공지사항이 없습니다.</div>`);
    }

    mainDom.innerHTML = latestNotices
      .map((notice) => {
        const { id, title, createdAt } = notice;

        const formattedDate = createdAt.split("T")[0];

        return `
        <li class="contents">
          <a href="/views/notice-page.html?id=${id}"></a>
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
  } catch (error) {
    console.error(error);
  }
};

await getNoticeData();

/* 자유게시판 최신글 가져오는 함수 */
const getBoardData = async () => {
  try {
    const apiUrl = baseUrl + `posts?page=1`;

    const result = await axios.get(apiUrl);
    const latestPosts = result.data.list.slice(0, 5);

    const mainDom = document.querySelector(".board-list");

    if (latestPosts.length === 0) {
      return (mainDom.innerHTML = `<div class="text-center my-5">글이 없습니다.</div>`);
    }

    mainDom.innerHTML = latestPosts
      .map((post) => {
        const { id, title, nickName, category, createdAt, commentNumbers } = post;

        const formattedDate = createdAt.split("T")[0];
        const commentClass = commentNumbers === 0 ? "comment hidden" : "comment";

        return `
        <li class="contents">
           <a href="post-read.html?id=${id}"></a>
           <div class="list-info">
             <div class="classification">${category}</div>
             <div class="title">${title}</div>
             <div class=${commentClass}>
               <img src="../images/comment.png" alt="comment-icon" class="comment-icon" />
               <span class="comment-number">${commentNumbers}</span>
             </div>
           </div>
           <div class="list-info-2">
             <div class="author">${nickName}</div>
             <div class="date">${formattedDate}</div>
           </div>
        </li>
        <hr />
        `;
      })
      .join("");
  } catch (error) {
    console.error(error);
  }
};

await getBoardData();

/* 뉴스 최신글 가져오는 함수 */
await fetchNewsData(`/api/news/`);

async function fetchNewsData(url) {
  try {
    const response = await axios.get(url);
    const list = response.data.list.slice(0, 5);

    // Display data for the current page
    const dataContainer = document.querySelector(".news-list");

    if (list.length === 0) {
      return (dataContainer.innerHTML = `<div class="text-center my-5">뉴스가 없습니다.</div>`);
    }

    dataContainer.innerHTML = list
      .map((post) => {
        const { newspaper, title, link } = post;
        return `
      <li class="contents">
        <a href="${link}"target="_blank"></a>
        <div class="list-info">
          <div class="title">${title}</div>
        </div>
        <div class="list-info-2">
        <div class="newspaper">${newspaper}</div>
        </div>
      </li>
      <hr />
      `;
      })
      .join("");
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}
