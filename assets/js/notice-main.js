const getNoticeData = async () => {
  try {
    const apiUrl = `/api/notices`;

    const result = await axios.get(apiUrl);
    const latestNotices = result.data.data.slice(0, 10); // 최신 10개

    const mainDom = document.querySelector(".notice-list");

    mainDom.innerHTML = latestNotices
      .map((notice) => {
        const { id, title, createdAt } = notice;

        const formattedDate = createdAt.split("T")[0];

        return `
        <li class="contents">
          <a href="http://localhost:3000/views/notice-page.html#${id}"></a>
          <div class="list-info">
            <div class="classification">NOTICE</div>
            <div class="title">${title}</div>
          </div>
          <div class="list-info-2">
            <div class="author">관리자</div>
            <div class="date">${formattedDate}</div>
          </div>
        </li>
        <hr />
        `;
      })
      .join("");
  } catch (error) {
    console.error(error);
  }
};

await getNoticeData();
