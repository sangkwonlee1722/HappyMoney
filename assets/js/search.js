const keywordInput = document.getElementById("all_search");

keywordInput.addEventListener("keyup", async (event) => {
  if (event.key === "Enter") {
    const keyword = keywordInput.value.trim();

    if (keyword !== "") {
      // try {
      // 여기서 검색 결과 페이지로 이동하는 대신에 알림창을 띄우도록 수정합니다.
      //   alert("해당 기능은 준비중입니다.");
      // } catch (error) {
      //   console.error("검색 작업 중에 에러가 발생했습니다.:", error);
      // }

      // 검색 키워드 보내기
      try {
        window.location.href = `search-result.html?keyword=${encodeURIComponent(keyword)}`;
      } catch (error) {
        console.error("검색 작업 중에 에러가 발생했습니다.:", error);
      }
    }
  }
});
