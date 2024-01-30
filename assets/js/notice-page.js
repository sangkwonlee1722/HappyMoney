import getToken from "./common.js";
import { baseUrl } from "./common.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const noticeId = urlSearchParams.get("id");

  try {
    if (noticeId) {
      const response = await axios.get(`${baseUrl}notices/${noticeId}`);
      const data = response.data.data;

      const titleElement = document.querySelector(".board-title");
      const contentsElement = document.querySelector(".notice-contents");
      const dateElement = document.querySelector(".notice-createdate");

      if (titleElement && contentsElement) {
        titleElement.innerHTML = data.title;
        contentsElement.innerHTML = data.contents;
        dateElement.innerHTML = data.createdAt;

        // 날짜 포맷 변경
        const dateObject = new Date(data.createdAt);
        const formattedDate = `${dateObject.getFullYear()}
        -${String(dateObject.getMonth() + 1).padStart(2, "0")}
        -${String(dateObject.getDate()).padStart(2, "0")}
         ${String(dateObject.getHours()).padStart(2, "0")}
         :${String(dateObject.getMinutes()).padStart(2, "0")}`;

        dateElement.innerHTML = formattedDate;
      }
    }
  } catch (error) {
    console.error(error);
  }

  // 공지사항 수정 버튼 클릭 시
  $(document).on("click", ".update-notice-btn", (event) => {
    const notice = $(event.target).closest(".mc-btn-wrap");

    // 특정 ID를 가지고 수정 페이지로 이동
    window.location.href = `http://localhost:3000/views/notice-update.html?id=${noticeId}`;
  });

  // 공지사항 삭제
  $(document).on("click", ".delete-notice-btn", async (event) => {
    const notice = $(event.target).closest(".mc-btn-wrap");
    const noticeIdToDelete = noticeId;
    console.log(notice);
    console.log(noticeId);
    console.log(noticeIdToDelete);

    $("#delete-contents").on("click", function () {
      deleteNotice(noticeIdToDelete);
    });
  });

  async function deleteNotice(noticeId) {
    const token = getToken();
    try {
      await axios.delete(`/api/notices/${noticeId}`, {
        headers: {
          Authorization: token
        }
      });
      alert("공지사항이 삭제되었습니다.");
      window.location.href = "http://localhost:3000/views/notice-main.html?page=1";
    } catch (error) {
      console.error(error);
      const errorMessage = error.response.data.message;
      alert(errorMessage);
    }
  }
});
