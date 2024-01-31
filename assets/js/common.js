import { spreadMyAllPushNotis, checkPushNotis } from "./push-noti.js";

export const baseUrl = "http://localhost:3000/api/";

window.drPopupOpen = drPopupOpen;
window.drPopupClose = drPopupClose;
window.loginConfirm = loginConfirm;
window.alarmOpen = alarmOpen;
window.alarmClose = alarmClose;
window.logout = logout;
window.googleLogin = googleLogin;
window.naverLogin = naverLogin;
window.kakaoLogin = kakaoLogin;
window.handleKeyPress = handleKeyPress;

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

// 알림 열기
export function alarmOpen() {
  $(".hm-popup-alarm").css("display", "flex");
  $(".hm-alarm-dim").css("display", "block");
}

// 알림 닫기
export function alarmClose() {
  $(".hm-popup-alarm").css("display", "none");
  $(".hm-alarm-dim").css("display", "none");
}

// 헤더, 푸터
$.get("/views/common/favicon.html", function (data) {
  $("head").append(data);
});
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

$(document).ready(function () {
  const token = getCookie("accessToken");
  setTimeout(async function () {
    // 세션 ID가 있는지 여부에 따라 탭을 토글합니다.
    if (token) {
      // 세션 ID가 있으면 로그인 상태로 간주하고 로그인 탭을 표시합니다.
      $("#loginTab").hide();
      $("#logoutTab").show();

      // 로그인 시 푸시알림 구독 정보 및 서비스워커 등록
      setTimeout(() => {
        registerNotificationService();
      }, 100);

      const pushNoitsNumbers = await checkPushNotis();

      if (pushNoitsNumbers !== 0) {
        $(".hm-red-dot-right").show();
      }

      $(".push-noti-icon").on("click", spreadMyAllPushNotis);
    } else {
      // 세션 ID가 없으면 로그아웃 상태로 간주하고 로그아웃 탭을 표시합니다.
      $("#loginTab").show();
      $("#logoutTab").hide();
    }

    const inputBox = document.querySelector("#login-input-box");

    const temp_html = `
      <input type="email" class="loginInputValue" id="loginEmail" placeholder="이메일 주소"  onkeypress="handleKeyPress(event)" />
      <input type="password" class="loginInputValue" id="loginPassword" placeholder="비밀번호"  onkeypress="handleKeyPress(event)" />
      `;
    inputBox.innerHTML = temp_html;
  }, 50);
});

function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export function getCookie(name) {
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

export function handleKeyPress(event) {
  if (event.key === "Enter") {
    loginConfirm();
  }
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
      setCookie("accessToken", accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
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

  window.location.href = "/views/main.html";
}
export function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// 숫자 함수
export function addComma(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 알림 권한 확인 및 서비스 워크 등록
async function registerNotificationService() {
  try {
    const status = await Notification.requestPermission();
    console.log("Notification 상태", status);

    const vapidPublicKey = await getVAPIDPublicKey();
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    if (status === "denied") {
      console.log("Notification 상태", status);
      return;
    } else if (navigator.serviceWorker) {
      const registration = await navigator.serviceWorker.register("sw.js");
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      };
      const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
      postSubscription(pushSubscription);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// 구독 정보를 user 테이블에 저장하는 함수
async function postSubscription(pushSubscription) {
  const subscription = pushSubscription.toJSON();

  const apiUrl = baseUrl + "user/subscription";
  const token = getToken();

  try {
    await axios.patch(
      apiUrl,
      {
        subscription
      },
      {
        headers: {
          Authorization: token
        }
      }
    );
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

async function getVAPIDPublicKey() {
  const apiUrl = baseUrl + "push/VAPIDKeys";

  const token = getToken();
  const result = await axios.get(apiUrl, {
    headers: {
      Authorization: token
    }
  });

  const publicKey = result.data.publicKey;
  return publicKey;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function googleLogin() {
  window.location.href = "http://localhost:3000/api/google/login";
}

function kakaoLogin() {
  window.location.href = "http://localhost:3000/api/kakao/login";
}

function naverLogin() {
  window.location.href = "http://localhost:3000/api/naver/login";
}
