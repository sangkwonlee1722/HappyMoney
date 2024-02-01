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
document.addEventListener("DOMContentLoaded", function () {
  const submitButton = document.querySelector('input[type="button"]');
  if (submitButton) {
    submitButton.addEventListener("click", submitPost);
  }
});

const submitPost = function () {
  smartEditors.getById["editorTxt"].exec("UPDATE_CONTENTS_FIELD", []);
  let category = document.getElementById("category").value; // 말머리 추가
  console.log(category);
  let title = document.getElementById("title").value;
  let content = document.getElementById("editorTxt").value;
  console.log(content);
  if (content == "<p>&nbsp;</p>") {
    // 콘텐츠 빈거 확인
    alert("내용을 입력해주세요.");
    smartEditors.getById["editorTxt"].exec("FOCUS");
    return;
  } else {
    axios
      .post(
        `${baseUrl}posts`, // "notices"를 "posts"로 변경
        {
          category: category, // 말머리 추가
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
        alert("게시물이 성공적으로 등록되었습니다.");
        window.location.href = "/views/post.html?page=1";
      })
      .catch(function (error) {
        console.error(error);
        const errorMessage = error.response.data.message;
        alert(errorMessage);
      });
  }
};

$(document).ready(function () {
  setupSmartEditor();
});
