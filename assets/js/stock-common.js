/* 스톡 헤더(모의투자, 검색창) */
// stock-common.js

$(document).ready(function () {
  $("#stock-header").load("/views/common/stock-header.html", function () {

    $(".stock-search-bar").keydown((event) => {
      if (event.keyCode === 13) {
        event.preventDefault();

        // 유저가 종목 검색창에서 입력한 키워드를 가져오기
        const keyword = $(".stock-search-bar").val();

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





