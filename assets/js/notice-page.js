document.addEventListener("DOMContentLoaded", async () => {
  const idValue = window.location.hash.substring(1); // 해시에서 '#' 문자를 제외한 값을 추출합니다.

  try {
    if (idValue) {
      const response = await axios.get(`/api/notices/${idValue}`);
      const data = response.data.data;

      const titleElement = document.querySelector(".board-title");
      const contentsElement = document.querySelector(".notice-container");

      if (titleElement && contentsElement) {
        titleElement.textContent = data.title;
        contentsElement.textContent = data.contents;
      } else {
        console.error("요소를 찾을 수 없습니다.");
      }
    } else {
      console.error("유효한 ID가 없습니다.");
    }
  } catch (error) {
    console.error(error);
  }
});
