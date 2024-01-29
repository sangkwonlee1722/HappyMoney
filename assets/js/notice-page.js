document.addEventListener("DOMContentLoaded", async () => {
  const idValue = window.location.hash.substring(1); // 해시에서 '#' 문자를 제외한 값을 추출합니다.

  try {
    if (idValue) {
      const response = await axios.get(`/api/notices/${idValue}`);
      const data = response.data.data;

      const titleElement = document.querySelector(".board-title");
      const contentsElement = document.querySelector(".notice-container");
      const dateElement = document.querySelector(".notice_container");

      if (titleElement && contentsElement) {
        titleElement.innerHTML = data.title;
        contentsElement.innerHTML = data.contents;
        dateElement.innerHTML = data.created_at;
      }
    }
  } catch (error) {
    console.error(error);
  }
});
