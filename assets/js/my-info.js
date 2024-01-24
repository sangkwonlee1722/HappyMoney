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
                <button class="hm-button hm-gray-color">
                  <a href="#none" onclick="drPopupOpen('.check-password')">수정하기</a>
                </button>
                 <button class="hm-button hm-gray-color">
                 <a href="#none" onclick="drPopupOpen('.check-password-update')">비밀번호 변경</a>
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

/* 내 정보 가져오기 */
async function getUserInfo() {
  const apiUrl = apiBaseUrl + "user/mypage";
  const user = await axios.get(apiUrl, {
    headers: {
      Authorization: token
    }
  });

  const phone = String($("#phone").val(user.data.phone));
  const nickName = $("#nickName").val(user.data.nickName);
}

getUserInfo();

/* 내 정보 수정하기 */
const updateMyInfo = $("#updateMyInfo");

updateMyInfo.on("click", async function () {
  const apiUrl = apiBaseUrl + "user/mypage";

  const user = await axios.get(apiUrl, {
    headers: {
      Authorization: token
    }
  });
  console.log(user.data.phone, user.data.nickName);
  const phone = String($("#phone").val());
  const nickName = $("#nickName").val();

  if (!phone.includes("-") || phone.length !== 13) {
    alert("휴대폰 번호 양식에 맞게 작성해주세요.");
    drPopupOpen(".hm-mypage-update");
    return;
  }

  if (nickName.includes(" ")) {
    alert("닉네임에는 공백을 사용할 수 없습니다.");
    drPopupOpen(".hm-mypage-update");
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
    alert("내 정보가 변경되었습니다.");
    window.location.reload();
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
    drPopupOpen(".hm-mypage-update");
  }
  $("#passwordChk").val("");
});

/* 패스워드 체크 모달창 띄우기 */
const submitUpdatePasswordBtn = $("#submitUpdatePasswordBtn");

submitUpdatePasswordBtn.on("click", async function () {
  const apiUrl = apiBaseUrl + "user/check-password";
  const password = $("#updatePasswordChk").val();

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
    drPopupOpen(".hm-password-update");
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
    drPopupOpen(".check-password-update");
  }
  $("#updatePasswordChk").val("");
});

/* 비밀번호 변경하기 */
const updatePassword = $("#updatePassword");

updatePassword.on("click", async function () {
  const apiUrl = apiBaseUrl + "user/update-password";
  const newPassword = $("#newPassword").val();
  const newPasswordCheck = $("#newPasswordCheck").val();

  if (newPassword !== newPasswordCheck) {
    alert("비밀번호를 다시 입력하세요.");
    drPopupOpen(".hm-password-update");
    return;
  } else if (newPassword.length < 6) {
    alert("비밀번호는 6자 이상입니다.");
    drPopupOpen(".hm-password-update");
    return;
  }

  const updatePassword = {
    newPassword,
    newPasswordCheck
  };

  try {
    await axios.patch(apiUrl, updatePassword, {
      headers: {
        Authorization: token
      }
    });
    alert("비밀번호가 변경되었습니다.");
    window.location.reload();
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message[0];
    alert(errorMessage);
    drPopupOpen(".hm-password-update");
  }
});
