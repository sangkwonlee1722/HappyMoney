import { baseUrl } from "./common.js";
import getToken from './common.js'
import renderPagination from '/js/pagenation.js'

const token = getToken();
const params = new URLSearchParams(window.location.search)
const commentsPage = params.get("page")

/* 내가 작성한 게시글 목록 가져오기 */
const getMyComments = async () => {
  const apiUrl = baseUrl + `comments/my?page=${commentsPage}`;
  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })
    const myCommentsList = result.data.lists
    const myCommentsTotal = result.data.total

    return { myCommentsList, myCommentsTotal }
  } catch (error) {
    console.error(error)
  }
}

/* 목록을 뿌려주는 함수 */
const spreadCommentsList = async () => {
  const mainDom = document.querySelector('.board-list');
  const { myCommentsList: comments, myCommentsTotal: total } = await getMyComments();

  if (comments.length !== 0) {
    mainDom.innerHTML = comments
      .map(comment => {
        const { id, createdAt, content } = comment
        const { id: titleId, title, commentNumbers } = comment.post
        const dateObject = new Date(createdAt);
        dateObject.setHours(dateObject.getHours() - 9)
        const formattedDate = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, "0")}-${String(dateObject.getDate()).padStart(2, "0")} ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;

        return `
        <li class="comment" data-id="${id}">
        <a href="/views/post-read.html?id=${titleId}"></a>
        <div class="mc-contents-wrap">
          <div class="mc-info-wrap">
            <div class="my-comments">
              ${content}
            </div>
            <div class="comment-date">${formattedDate}</div>
            <div class="mc-posts">
              <div class="posts-title">${title}</div>
              <img src="../images/comment.png" alt="comment-icon" class="comment-icon" />
              <span class="comment-number">${commentNumbers}</span>
            </div>
          </div>
          <div class="mc-btn-wrap">
            <button class="hm-button hm-gray-color delete-comment-btn" onclick="drPopupOpen('.delete-comment-chk')">
              삭제하기
            </button>
          </div>
        </div>
        <hr />
      </li>
      `
      }).join("")
    renderPagination(total, commentsPage, '/views/my-comments.html?');
  } else {
    mainDom.innerHTML = `
    <div class="none-contents">
      <span>작성한 댓글이 없습니다.</span>
    </div>
    `
  }
}

await spreadCommentsList()

$('.delete-comment-btn').on('click', function () {
  const comment = $(this).closest('li');
  const commentId = comment.attr('data-id');

  $('#delete-contents').on('click', function () {
    deleteComment(commentId);
  });
});

async function deleteComment(commentId) {
  const apiUrl = baseUrl + `comments/${commentId}`;
  try {
    await axios.delete(apiUrl, {
      headers: {
        'Authorization': token,
      }
    });
    window.location.reload();
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}
