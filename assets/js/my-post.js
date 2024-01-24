import { baseUrl } from "./common.js";
import getToken from './common.js'

const token = getToken();

/* 내가 작성한 게시글 목록 가져오기 */
const getMyPosts = async () => {
  const apiUrl = baseUrl + 'posts/my';
  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })

    return result.data.data;
  } catch (error) {
    console.error(error)
  }
}

/* 목록을 뿌려주는 함수 */
const spreadPostsList = async () => {
  const mainDom = document.querySelector('.board-list');
  const posts = await getMyPosts();

  if (posts.length !== 0) {
    mainDom.innerHTML = posts
      .map(post => {
        const { id, category, title, nickName, createdAt, commentNumbers } = post
        const formattedDate = createdAt.split("T")[0]

        const commentClass = commentNumbers === 0 ? "comment hidden" : "comment";

        return `
      <li class="contents" data-id=${id}>
         <a href="#none"></a>
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
  } else {
    mainDom.innerHTML = `
    <div class="none-contents">
      <span>작성한 게시글이 없습니다.</span>
    </div>
    `
  }
}

await spreadPostsList()