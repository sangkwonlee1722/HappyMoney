import getToken from "./common.js";
// 댓글 생성
document.querySelector(".submit-comment").addEventListener("click", async () => {
  const token = getToken();
  const urlSearchParams = new URL(location.href).searchParams;
  const idValue = urlSearchParams.get("id");
  const content = document.querySelector(".form-control").value;

  if (!content) {
    return alert("댓글을 입력하세요.");
  }
  await axios.post(
    `/api/comments/${idValue}`,
    {
      content
    },
    {
      headers: {
        Authorization: token
      }
    }
  );
  alert("댓글이 작성되었습니다.");
  window.location.reload();
});

// 본문, 댓글 조회
document.addEventListener("DOMContentLoaded", function () {
  const urlSearchParams = new URL(location.href).searchParams;
  const postId = urlSearchParams.get("id");
  fetchPostData(postId);
});

async function fetchPostData(postId) {
  try {
    const commentsBox = document.querySelector(".card-body");
    const postBox = document.querySelector(".row");
    commentsBox.innerHTML = "";
    postBox.innerHTML = "";
    const postResponse = await axios.get(`/api/posts/${postId}`);
    const data = postResponse.data.data;
    const commentsResponse = await axios.get(`/api/comments/post/${postId}`);
    const comments = commentsResponse.data.data;
    postBox.innerHTML = `
    <div class="twit-dt-top pb-4">
      <div class="dt-top-l">
        <dl class="mb-2">
          <dt>${data.title}</dt>
          <dd>${data.nickName}</dd>
        </dl>
        <dl>
          <dt>${data.createdAt}</dt>
          <dd>${data.updatedAt}</dd>
        </dl>
      </div>
    </div>
    <div class="twit-dt-bottom">
      ${data.contents}
    </div>
    `;
    commentsBox.innerHTML = comments
      .map((comment) => {
        const { id, createdAt, content } = comment;
        const { nickName } = comment.commentUser;
        const dateObject = new Date(createdAt);
        const formattedDate = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, "0")}-${String(dateObject.getDate()).padStart(2, "0")} ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;

        return `
      <div class="comment" data-id="${id}">
      <div class="mc-contents-wrap">
        <div class="mc-info-wrap">
          <div class="comment-nickName">${nickName}<button class="send-message-button">
            쪽지 보내기
            </button>
          </div>
          <div class="my-comments">${content}</div>
          <div class="comment-date">${formattedDate}</div>
        </div>
        <div class="mc-btn-wrap text-end" data-id="${id}">
        <button class="hm-button hm-gray-color update-comment-btn">
          수정
        </button>
        <button class="hm-button hm-gray-color delete-comment-btn" onclick="drPopupOpen('.delete-comment-chk')">
          삭제
        </button>
      </div>
      </div>
      <hr />
    </div>
    `;
      })
      .join("");
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

//댓글 삭제
$(document).on("click", ".delete-comment-btn", async (event) => {
  const comment = $(event.target).closest(".mc-btn-wrap");
  const commentId = comment.attr("data-id");

  $("#delete-contents").on("click", function () {
    deleteComment(commentId);
  });
});

async function deleteComment(commentId) {
  const token = getToken();
  try {
    await axios.delete(`/api/comments/${commentId}`, {
      headers: {
        Authorization: token
      }
    });
    alert("댓글이 삭제되었습니다.");
    window.location.reload();
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

//댓글 수정
$(document).on("click", ".update-comment-btn", async (event) => {
  const comment = $(event.target).closest(".mc-btn-wrap");
  const commentId = comment.attr("data-id");
  const parentDiv = $(event.target).closest(".comment");
  const contentDiv = parentDiv.find(".my-comments");
  const original = contentDiv.text();
  contentDiv.data("previous-content", original);
  contentDiv.html(`
  <div class="form-comment">
    <textarea class="form-control update-comment-form" rows="2" placeholder="댓글을 입력하세요.">${original}</textarea>
    <button class="hm-button hm-blue-color update-submit" id="update-contents">수정</button>
    <button class="hm-button hm-blue-color update-cancel">취소</button>
  </div>`);
  $(event.target).hide();

  $("#update-contents").on("click", function () {
    const content = document.querySelector(".update-comment-form").value;
    updateComment(commentId, content);
  });
});

async function updateComment(commentId, content) {
  const token = getToken();
  try {
    await axios.patch(
      `/api/comments/${commentId}`,
      {
        content
      },
      {
        headers: {
          Authorization: token
        }
      }
    );
    alert("댓글이 수정되었습니다.");
    window.location.reload();
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

// 댓글 수정 취소
$(document).on("click", ".update-cancel", (event) => {
  const parentDiv = $(event.target).closest(".comment");
  const contentDiv = parentDiv.find(".my-comments");
  const previousContent = contentDiv.data("previous-content");
  contentDiv.html(previousContent);
  parentDiv.find(".update-comment-btn").show();
});
