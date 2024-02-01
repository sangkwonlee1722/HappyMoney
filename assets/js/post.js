import renderPagination from "/js/pagenation.js";
import { getCookie } from "/js/common.js";

const searchParams = new URLSearchParams(window.location.search);
const postPage = searchParams.get("page");

//글쓰기 버튼 숨기기
showWriteBtn();

async function showWriteBtn() {
  const token = `Bearer ${getCookie("accessToken")}`;

  const writeButton = document.querySelector("#write-btn");

  if (token !== "Bearer null") {
    writeButton.style.display = "block";
    writeButton.addEventListener("click", () => {
      window.location.href = "/views/post-posting.html";
    });
  }
}

// Initial data fetch
fetchPostData(`/api/posts/?page=${postPage}`);

async function fetchPostData(url) {
  try {
    const response = await axios.get(url);
    const list = response.data.list;
    const total = response.data.total;

    // Display data for the current page
    const dataContainer = document.querySelector(".board-list");

    if (list.length === 0) {
      return (dataContainer.innerHTML = `<div class="text-center my-5">자유게시판 글이 없습니다.</div>`);
    }

    dataContainer.innerHTML = list
      .map((post) => {
        const { nickName, title, commentNumbers, category, createdAt, id } = post;
        const commentClass = commentNumbers === 0 ? "comment hidden" : "comment";
        const dateObject = new Date(createdAt);
        const formattedDate = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, "0")}-${String(dateObject.getDate()).padStart(2, "0")} ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;
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

    renderPagination(total, postPage, "/views/post.html");
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}
