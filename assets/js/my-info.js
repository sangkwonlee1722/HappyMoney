import getToken from "./common.js";

const token = getToken();
const apiBaseUrl = `http://localhost:3000/api/`;

/* 내 정보 가져오는 함수 */
const getMyInfoByToken = async (token) => {
  const apiUrl = apiBaseUrl + "user/mypage";

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        Authorization: token
      }
    });

    const { createdAt, email, name, nickName, phone } = result.data;
    const formattedDate = createdAt.split("T")[0];

    const mainDom = document.querySelector(".profile-wrap");

    mainDom.innerHTML = `
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
                <button class="hm-button me-2 hm-gray-color">
                  <a href="#none" onclick="drPopupOpen('.check-password')">수정하기</a>
                </button>
              </div>
            </div>
    `;
  } catch (error) {
    console.error("에러 발생:", error);
  }
};

await getMyInfoByToken(token);

/* 패스워드 체크 모달창 띄우기 */
const passwordSubmitBtn = $("#submitPasswordBtn");

passwordSubmitBtn.on("click", async function () {
  const apiUrl = apiBaseUrl + "user/check-password";
  const password = $("#passwordChk").val();

  try {
    await axios.post(
      apiUrl,
      { password },
      {
        headers: {
          Authorization: token
        }
      }
    );
    drPopupOpen(".hm-mypage-update");
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
    drPopupOpen(".check-password");
  }
  $("#passwordChk").val("");
});

/* 내 정보 수정하기 */
const updateMyInfo = $("#updateMyInfo");

updateMyInfo.on("click", async function () {
  const apiUrl = apiBaseUrl + "user/mypage";
  const phone = String($("#phone").val());
  const nickName = $("#nickName").val();

  if (!phone.includes("-")) {
    alert("휴대폰 번호에는 하이픈(-)이 포함되어야 합니다.");
    return;
  }

  if (nickName.includes(" ")) {
    alert("닉네임에는 공백을 사용할 수 없습니다.");
    return;
  }

  const updateInfo = {
    phone,
    nickName
  };

  try {
    await axios.patch(apiUrl, updateInfo, {
      headers: {
        Authorization: token
      }
    });
    window.location.reload();
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
  $("#passwordChk").val("");
});
