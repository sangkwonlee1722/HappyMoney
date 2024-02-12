import { baseUrl, getCookie } from "/js/common.js";

const token = `Bearer ${getCookie("accessToken")}`;

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
        titleElement.innerHTML = `[공지사항] ${data.title}`;
        contentsElement.innerHTML = data.contents;
        dateElement.innerHTML = data.createdAt;

        // 날짜 포맷 변경
        const dateObject = new Date(data.createdAt);
        dateObject.setHours(dateObject.getHours() - 9)

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

  // API로 사용자 정보 호출
  const userInfo = await axios.get(baseUrl + "user/mypage", {
    headers: {
      Authorization: token
    }
  });

  const role = userInfo.data.role;

  // 공지사항 수정
  const updateNoticeBtn = document.querySelector("#update-btn");
  if (updateNoticeBtn) {
    if (role === "admin") {
      // admin만 버튼 보이게
      updateNoticeBtn.style.display = "block";
    }

    // 특정 ID를 가지고 수정 페이지로 이동
    updateNoticeBtn.addEventListener("click", () => {
      window.location.href = `/views/notice-update.html?id=${noticeId}`;
    });
  }

  // 공지사항 삭제
  const deleteNoticeBtn = document.querySelector("#delete-btn");
  if (deleteNoticeBtn) {
    const noticeIdToDelete = noticeId;

    // admin만 버튼 보이게
    if (role === "admin") {
      deleteNoticeBtn.style.display = "block";
    }

    const deleteContentsBtn = document.getElementById("delete-contents");
    if (deleteContentsBtn) {
      deleteContentsBtn.addEventListener("click", function () {
        deleteNotice(noticeIdToDelete);
      });
    }
  }

  async function deleteNotice(noticeId) {
    try {
      await axios.delete(`/api/notices/${noticeId}`, {
        headers: {
          Authorization: token
        }
      });
      alert("공지사항이 삭제되었습니다.");
      window.location.href = "/views/notice-main.html?page=1";
    } catch (error) {
      console.error(error);
      const errorMessage = error.response.data.message;
      alert(errorMessage);
    }
  }
});
