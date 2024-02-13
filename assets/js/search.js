const keywordInput = document.getElementById("all_search");

keywordInput.addEventListener("keyup", async (event) => {
  if (event.key === "Enter") {
    const keyword = keywordInput.value.trim();

    if (keyword !== "") {
      try {
        window.location.href = `search-result.html?keyword=${encodeURIComponent(keyword)}`;
      } catch (error) {
        console.error("검색 작업 중에 에러가 발생했습니다.:", error);
      }
    }
  }
});
