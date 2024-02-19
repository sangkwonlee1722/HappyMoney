/* 스톡 헤더(모의투자, 검색창) */
// stock-common.js

$(document).ready(function () {
  $("#stock-header").load("/views/common/stock-header.html", function () {

    $(".stock-search-bar").keydown((event) => {
      if (event.keyCode === 13) {
        event.preventDefault();

        // 유저가 종목 검색창에서 입력한 키워드를 가져오기
        const keyword = $(".stock-search-bar").val();

        const regex = /[^\w\sㄱ-ㅎ가-힣]/;

        // 키워드에 공백이나 특수문자가 포함되어 있는지 확인
        if (keyword.match(regex) || keyword.includes(" ")) {
          alert("공백이나 특수문자는 검색할 수 없습니다.");

          return
        }

        if (keyword.length === 0) {
          alert("검색어를 입력하세요.")
          return
        }

        // 해당 키워드 검색 결과 페이지로 이동
        const redirectUrl = generateUrl(keyword);
        window.location.href = redirectUrl;
      }
    });
  });
});

// URL 만드는 함수
export const generateUrl = (keyword) => {
  const baseUrl = "stock-search.html?keyword=";
  return baseUrl + keyword;
};



