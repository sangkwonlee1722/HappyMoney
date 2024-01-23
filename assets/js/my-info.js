import { getToken } from "./common.js"

const token = getToken()
const apiBaseUrl = `http://localhost:3000/api/`


/* 내 정보 가져오는 함수 */
const getMyInfoByToken = async (token) => {

  const apiUrl = apiBaseUrl + "user/mypage";

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    });

    const { createdAt, email, name, nickName, phone } = result.data;
    const formattedDate = createdAt.split("T")[0]

    const mainDom = document.querySelector(".profile-wrap")

    mainDom.innerHTML =
      `
    <h2 class="profile-title">프로필</h2>
            <div class="profile-contents-wrap">
              <div class="profile-left">
                <div class="names">
                  <span class="user-name">${name}</span>
                  <span class="'user-nick-name">(${nickName})</span>
                </div>
                <span>${email}</span>
                <span>${phone}</span>
              </div>
              <div class="profile-right">
                <span>가입일 : ${formattedDate}</span>
                <button class="hm-button hm-gray-color">수정하기</button>
              </div>
            </div>
    `

  } catch (error) {
    console.error("에러 발생:", error);
  }
};

await getMyInfoByToken(token)

