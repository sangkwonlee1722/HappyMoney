/* 공지사항을 가져오는 함수 */
const getNoticeData = async () => {
  try {
    const apiUrl = `http://localhost:3000/api/notices`

    const result = await axios.get(apiUrl)
    const latestNotices = result.data.data.slice(0, 3);

    const mainDom = document.querySelector(".notice-list")

    mainDom.innerHTML = latestNotices
      .map(notice => {
        const { title, createdAt } = notice

        const formattedDate = createdAt.split("T")[0];

        return `
        <li class="contents">
          <a href="#none"></a>
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
        `
      }).join("")


  } catch (error) {
    console.error(error)
  }
}

await getNoticeData()

/* 자유게시판 최신글 가져오는 함수 */
const getBoardData = async () => {
  try {
    const apiUrl = `http://localhost:3000/api/posts?page=1`

    const result = await axios.get(apiUrl)
    const latestPosts = result.data.list.slice(0, 3);
    const mainDom = document.querySelector(".board-list")

    mainDom.innerHTML = latestPosts
      .map(post => {
        const { id, title, nickName, category, createdAt, commentNumbers } = post

        const formattedDate = createdAt.split("T")[0];
        const commentClass = commentNumbers === 0 ? "comment hidden" : "comment";

        return `
        <li class="contents">
           <a href="post-read.html?id=${id}"></a>
           <div class="list-info">
             <div class="classification">${category}</div>
             <div class="title">${title}</div>
             <div class=${commentClass}>
               <img src="../images/comment.png" alt="comment-icon" class="comment-icon" />
               <span class="comment-number">${commentNumbers}</span>
             </div>
           </div>
           <div class="list-info-2">
             <div class="author">${nickName}</div>
             <div class="date">${formattedDate}</div>
           </div>
        </li>
        <hr />
        `
      }).join("")
  } catch (error) {
    console.error(error)
  }
}

await getBoardData()