import renderPagination from "/js/pagenation.js";

const searchParams = new URLSearchParams(window.location.search);
const newsPage = searchParams.get("page");

fetchNewsData(`/api/news/?page=${newsPage}`);

async function fetchNewsData(url) {
  try {
    const response = await axios.get(url);
    const list = response.data.list;
    const total = response.data.total;

    // Display data for the current page
    const dataContainer = document.querySelector(".board-list");

    if (list.length === 0) {
      return (dataContainer.innerHTML = `<div class="text-center my-5">뉴스가 없습니다.</div>`);
    }

    dataContainer.innerHTML = list
      .map((post) => {
        const { newspaper, title, link } = post;
        return `
      <li class="contents">
        <a href="${link}"target="_blank"></a>
        <div class="list-info">
          <div class="title">${title}</div>
        </div>
        <div class="list-info-2">
        <div class="newspaper">${newspaper}</div>
        </div>
      </li>
      <hr />
      `;
      })
      .join("");

    renderPagination(total, newsPage, "/views/news-main.html?");
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}