import getToken from "./common.js";
import { baseUrl } from "./common.js";

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
document.addEventListener("DOMContentLoaded", function () {
  const submitButton = document.querySelector('input[type="button"]');
  if (submitButton) {
    submitButton.addEventListener("click", submitPost);
  }
});

const submitPost = function () {
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
      .post(
        `${baseUrl}notices`,
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
        alert("공지사항이 성공적으로 등록되었습니다.");
      })
      .catch(function (error) {
        console.error(error);
        alert("공지사항 등록에 실패했습니다.");
      });
  }
};

$(document).ready(function () {
  setupSmartEditor();
});
