export const baseUrl = "http://localhost:3000/api/";

window.drPopupOpen = drPopupOpen;
window.drPopupClose = drPopupClose;
window.loginConfirm = loginConfirm;
window.logout = logout;

//팝업 열기
export function drPopupOpen(popName) {
  $("body").css("overflow", "hidden");
  $(".hm-dim").css("display", "block");
  $(popName).css("display", "block");
}
//팝업 닫기
export function drPopupClose(im) {
  $("body").css("overflow", "auto");
  $(".hm-popup-wrap").css("display", "none");
  $(".hm-dim").css("display", "none");
}

// 헤더, 푸터
$("#header_wrap").load("/views/common/header.html");
$("#footer_wrap").load("/views/common/footer.html");

// 토큰 가져오기
export default function getToken() {
  const token = `Bearer ${getCookie("accessToken")}`;

  if (token === "Bearer null") {
    alert("로그인이 필요합니다.");
    window.location.href = "/views/main.html";
  }

  return token;
}

$(document).ready(async function () {
  const token = getCookie("accessToken");
  setTimeout(function () {
    // 세션 ID가 있는지 여부에 따라 탭을 토글합니다.
    if (token) {
      // 세션 ID가 있으면 로그인 상태로 간주하고 로그인 탭을 표시합니다.
      $("#loginTab").hide();
      $("#logoutTab").show();
    } else {
      // 세션 ID가 없으면 로그아웃 상태로 간주하고 로그아웃 탭을 표시합니다.
      $("#loginTab").show();
      $("#logoutTab").hide();
    }

    const inputBox = document.querySelector("#login-input-box");

    const temp_html = `
      <input type="email" class="loginInputValue" id="loginEmail" placeholder="이메일 주소" />
      <input type="password" class="loginInputValue" id="loginPassword" placeholder="비밀번호" />
      `;
    inputBox.innerHTML = temp_html;
  }, 50);
});

function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
  // 쿠키 문자열을 가져옵니다.
  const cookieString = document.cookie;

  // 쿠키 문자열을 세미콜론으로 분할합니다.
  const cookies = cookieString.split(";");

  // 주어진 이름에 해당하는 쿠키를 찾습니다.
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim(); // 좌우 공백 제거

    // 쿠키의 이름과 값으로 나눕니다.
    const [cookieName, cookieValue] = cookie.split("=");

    // 주어진 이름에 해당하는 쿠키를 찾으면 해당 값을 반환합니다.
    if (cookieName === name) {
      return cookieValue;
    }
  }
  // 주어진 이름에 해당하는 쿠키를 찾지 못한 경우 null을 반환합니다.
  return null;
}

// 로그인
async function loginConfirm() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const userInfo = {
    email,
    password
  };

  try {
    const axiosInstance = axios.create({
      baseURL: "http://localhost:3000",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const response = await axiosInstance.post("/api/user/login", userInfo);

    if (response.data.success) {
      alert(`환영합니다.`);
      const accessToken = response.data.accessToken;
      setCookie("accessToken", accessToken, 1);
      window.location.href = "/views/main.html";
    }
  } catch (error) {
    alert("아이디 또는 비밀번호가 틀렸습니다.");
    console.error("Error:", error.response);
  }
}

// 로그아웃
export function logout() {
  deleteCookie("accessToken");
  alert("로그아웃 되었습니다.");
  window.location.reload();
}
export function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// 숫자 함수
export function addComma(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
