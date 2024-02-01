import getToken from "/js/common.js";
import { baseUrl } from "/js/common.js";

const token = getToken();
const smartEditors = [];

// 스마트에디터 기본 설정
const setupSmartEditor = function () {
  console.log("Naver SmartEditor");
  nhn.husky.EZCreator.createInIFrame({
    oAppRef: smartEditors,
    elPlaceHolder: "editorTxt",
    sSkinURI: "../smarteditor/SmartEditor2Skin.html",
    fCreator: "createSEditor2"
  });
};

// 버튼에 기능 여기서 설정
document.addEventListener("DOMContentLoaded", async () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const noticeId = urlSearchParams.get("id");

  try {
    if (noticeId) {
      console.log(noticeId);
      const response = await axios.get(`/api/notices/${noticeId}`);
      const data = response.data.data;

      // 기존 내용 입력된 상태로 넘어가게 하기
      const titleElement = document.getElementById("title");
      const contentsElement = document.getElementById("editorTxt");

      if (titleElement && contentsElement) {
        titleElement.value = data.title;
        contentsElement.value = data.contents;
      }
    }
  } catch (error) {
    console.error(error);
  }

  const submitButton = document.querySelector('input[type="button"]');
  if (submitButton) {
    submitButton.addEventListener("click", updatePost);
  }
});

const updatePost = function () {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const noticeId = urlSearchParams.get("id");

  smartEditors.getById["editorTxt"].exec("UPDATE_CONTENTS_FIELD", []);
  let title = document.getElementById("title").value;
  let content = document.getElementById("editorTxt").value;

  if (content == "<p>&nbsp;</p>") {
    // 콘텐츠 빈거 확인
    alert("내용을 입력해주세요.");
    smartEditors.getById["editorTxt"].exec("FOCUS");
    return;
  } else {
    axios
      .patch(
        `${baseUrl}notices/${noticeId}`,
        {
          title: title,
          contents: content
        },
        {
          headers: {
            Authorization: token
          }
        }
      )
      .then(function (response) {
        console.log(response);
        alert("공지사항이 성공적으로 수정되었습니다.");

        window.location.href = `/views/notice-page.html?id=${noticeId}`;
      })
      .catch(function (error) {
        console.error(error);
        alert("공지사항 수정에 실패했습니다.");
      });
  }
};

document.addEventListener("DOMContentLoaded", function () {
  setupSmartEditor();
});
