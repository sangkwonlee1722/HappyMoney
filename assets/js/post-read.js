import getToken from "/js/common.js";
import { getCookie } from "/js/common.js";

//댓글 버튼 숨기기
showWriteBtn();

// 본문, 댓글 조회
const urlSearchParams = new URL(location.href).searchParams;
const postId = urlSearchParams.get("id");
fetchPostData(postId);

// 본문, 댓글 가져오는 함수
async function fetchPostData(postId) {
  try {
    const commentsBox = document.querySelector(".card-body");
    const postBox = document.querySelector("#post-box");
    commentsBox.innerHTML = "";
    postBox.innerHTML = "";
    const postResponse = await axios.get(`/api/posts/${postId}`);
    const data = postResponse.data.data;
    const commentsResponse = await axios.get(`/api/comments/post/${postId}`);
    const comments = commentsResponse.data.data;
    const createdAt = new Date(data.createdAt);
    const formattedCreatedAt = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")} ${String(createdAt.getHours()).padStart(2, "0")}:${String(createdAt.getMinutes()).padStart(2, "0")}`;

    postBox.innerHTML = `
    <div class="post-dt-top pb-4">
      <div class="dt-top-l">
        <dl class="mb-2">
        <div style="display: flex;">
          <h2>${data.title}</h2>
          <div class="mc-btn-wrap text-end" data-id="${data.id}" user-id="${data.userId}" style="display: none;">
            <button class="hm-button hm-gray-color update-post-btn">수정</button>
            <button class="hm-button hm-gray-color delete-post-btn" onclick="drPopupOpen('.delete-post-chk')">삭제</button>
          </div>
        </div>
          <dd>작성자:${data.nickName}</dd>
          <dl>
            <dd>${formattedCreatedAt}</dd>
            <a id="twit" user-id="${data.userId}" style="display: none;">쪽지 보내기</a>
          </dl>
        </dl>
      </div>
    </div>
    <div class="post-dt-bottom">
      ${data.contents}
    </div>
    `;
    commentsBox.innerHTML = comments
      .map((comment) => {
        const { id: dataId, createdAt, content } = comment;
        const { nickName, id: userId } = comment.commentUser;
        const dateObject = new Date(createdAt);
        const formattedDate = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, "0")}-${String(dateObject.getDate()).padStart(2, "0")} ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;

        return `
      <div class="comment" data-id="${dataId}">
      <div class="mc-contents-wrap">
        <div class="mc-info-wrap">
          <div class="comment-nickName">${nickName}<a id="twit" user-id="${userId}" style="display: none;">
            쪽지 보내기
            </a>
          </div>
          <div class="my-comments">${content}</div>
          <div class="comment-date">${formattedDate}</div>
        </div>
        <div class="mc-btn-wrap text-end" data-id="${dataId}" user-id="${userId}" style="display: none;">
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
      showUserBtn();
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

// 게시글 수정
$(document).on("click", ".update-post-btn", async (event) => {
  const post = $(event.target).closest(".mc-btn-wrap");
  const postId = post.attr("data-id");
  window.location.href = `/views/post-update.html?id=${postId}`;
});

// 게시글 삭제
$(document).on("click", ".delete-post-btn", async (event) => {
  const post = $(event.target).closest(".mc-btn-wrap");
  const postId = post.attr("data-id");
  $("#delete-posts").off("click");
  $("#delete-posts").on("click", function () {
    deletePost(postId);
  });
});

async function deletePost(postId) {
  const token = getToken();
  try {
    await axios.delete(`/api/posts/${postId}`, {
      headers: {
        Authorization: token
      }
    });
    alert("게시글이 삭제되었습니다.");
    window.location.href = "/views/post.html?page=1";
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

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

// 댓글 삭제
$(document).on("click", ".delete-comment-btn", async (event) => {
  const comment = $(event.target).closest(".mc-btn-wrap");
  const commentId = comment.attr("data-id");
  $("#delete-contents").off("click");
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

// 댓글 수정
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
  $("#update-contents").off("click");
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

// 사용자에 따라 수정삭제, 쪽지버튼 보이는 함수
async function showUserBtn() {
  try {
    const token = `Bearer ${getCookie("accessToken")}`;
    const userInfo = await axios.get("/api/user/mypage", {
      headers: {
        Authorization: token
      }
    });
    const userId = Number(userInfo.data.id);
    const btnForUser = document.querySelectorAll(".mc-btn-wrap");
    for (const btn of btnForUser) {
      const btnId = Number(btn.getAttribute("user-id"));
      if (userId === btnId) {
        btn.style.display = "block";
      }
    }
    const btnForTwit = document.querySelectorAll("#twit");
    for (const btn of btnForTwit) {
      const btnId = Number(btn.getAttribute("user-id"));
      if (userId !== btnId) {
        btn.style.display = "block";
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// 댓글 폼 보이는 함수
async function showWriteBtn() {
  const token = `Bearer ${getCookie("accessToken")}`;

  if (token !== "Bearer null") {
    const writeButton = document.querySelector(".form-comment");
    writeButton.style.display = "block";
  }
}
