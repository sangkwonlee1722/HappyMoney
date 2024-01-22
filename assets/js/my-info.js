import { addComma } from "./common.js";

const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInRva2VuVHlwZSI6ImFjY2VzcyIsImlhdCI6MTcwNTkxMzM3NywiZXhwIjoxNzA1OTk5Nzc3fQ.4Qgzi2t8YVYwJzXvZUYk2lESGUBjuFwrK9PL2schyro"
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

    console.log("나오나요? :", result);
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
                <button>수정하기</button>
              </div>
            </div>
    `

  } catch (error) {
    console.error("에러 발생:", error);
  }
};

await getMyInfoByToken(token)

/* 나의 계좌 가져오는 함수 */
const getMyAccountsByToken = async (token) => {
  const apiUrl = apiBaseUrl + 'accounts'

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    });

    const accounts = result.data.data
    console.log('accounts: ', accounts);

    const mainDom = document.querySelector(".accounts-list")

    mainDom.innerHTML = accounts
      .map(account => {
        const { name, point, accountNumber } = account;

        const formatPrice = addComma(point)
        // 현재 가치 확인 로직 확인 필요
        return `
        <li class="accounts">
        <a href="#none"></a>
        <div class="accounts-left">
          <div class="account-name">
            <span>${name}</span>
            <img src="../images/modify-pencil.png" />
          </div>
          <span>${accountNumber}</span>
        </div>
        <div class="accounts-right">
          <div class="account-prices">
            <span class="ttl-price">${formatPrice} 원</span>
            <span class="calculate-price">+100,000 (0.1%)</span>
          </div>
          <button>삭제</button>
        </div>
      </li>
      <hr />
        `
      }).join("")

  } catch (error) {
    console.error("에러 발생:", error);
  }
}

await getMyAccountsByToken(token)