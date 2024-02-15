import getToken from "/js/common.js";
import { baseUrl } from "/js/common.js";

const token = getToken();

tinymce.init({
  language: "ko_KR", // 한글 언어 설정
  selector: "#editor", // 에디터를 적용할 textarea의 id
  height: 500,
  menubar: false,
  plugins: [
    "advlist",
    "autolink",
    "lists",
    "link",
    "image",
    "charmap",
    "print",
    "preview",
    "anchor",
    "searchreplace",
    "visualblocks",
    "code",
    "fullscreen",
    "insertdatetime",
    "media",
    "table",
    "paste",
    "code",
    "help",
    "wordcount",
    "save"
  ],
  toolbar:
    "formatselect fontselect fontsizeselect | " +
    "forecolor backcolor | " +
    "bold italic underline strikethrough | " +
    "alignjustify alignleft aligncenter alignright | " +
    "bullist numlist | " +
    "table tabledelete | " +
    "link image",

  /*** 이미지 업로드 설정 ***/
  image_title: true,
  automatic_uploads: true,
  file_picker_types: "image",
  file_picker_callback: function (cb, value, meta) {
    var input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");

    input.onchange = function () {
      var file = this.files[0];

      var reader = new FileReader();
      reader.onload = function () {
        var id = "blobid" + new Date().getTime();
        var blobCache = tinymce.activeEditor.editorUpload.blobCache;
        var base64 = reader.result.split(",")[1];
        var blobInfo = blobCache.create(id, file, base64);
        blobCache.add(blobInfo);

        cb(blobInfo.blobUri(), { title: file.name });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },
  /*** 이미지 업로드 설정 ***/

  content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }"
});

// "등록하기" 버튼 클릭 시
$("#posting-button").on("click", function () {
  var content = tinymce.activeEditor.getContent(); // 에디터 내용 가져오기
  var title = $("#title").val(); // 제목 가져오기

  if (!title.trim() || content === "<p>&nbsp;</p>") {
    // 제목 또는 내용이 비어있을 경우
    alert("제목과 내용을 입력해주세요.");
    return;
  }

  // 공지사항 등록 요청 보내기
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
      alert("공지사항이 성공적으로 등록되었습니다.");
      window.location.href = "/views/notice-main.html?page=1";
    })
    .catch(function (error) {
      console.error(error);
      alert("공지사항 등록에 실패했습니다.");
    });
});
