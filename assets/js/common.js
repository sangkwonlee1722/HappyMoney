window.drPopupOpen = drPopupOpen;
window.drPopupClose = drPopupClose;
window.signOut = signOut;

//팝업 열기
export function drPopupOpen(popName) {
  $('body').css('overflow', 'hidden');
  $('.hm-dim').css('display', 'block');
  $(popName).css('display', 'block');
}
//팝업 닫기
export function drPopupClose(im) {
  $('body').css('overflow', 'auto');
  $(im).closest('.hm-popup-wrap').css('display', 'none');
  $('.hm-dim').css('display', 'none');
}

// 헤더, 푸터
$(document).ready(function () {
  $("#header_wrap").load("/views/common/header.html");
  $("#footer_wrap").load("/views/common/footer.html");
});

// 세션 ID를 가져옵니다.
const sessionId = getCookie('connect.sid');

// 세션 ID가 있는지 여부에 따라 탭을 토글합니다.
if (sessionId) {
  // 세션 ID가 있으면 로그인 상태로 간주하고 로그인 탭을 표시합니다.
  $('#loginTab').hide();
  $('#logoutTab').show();
} else {
  // 세션 ID가 없으면 로그아웃 상태로 간주하고 로그아웃 탭을 표시합니다.
  $('#loginTab').show();
  $('#logoutTab').hide();
}

function getCookie(name) {
  // 쿠키 문자열을 가져옵니다.
  const cookieString = document.cookie;

  // 쿠키 문자열을 세미콜론으로 분할합니다.
  const cookies = cookieString.split(';');

  // 주어진 이름에 해당하는 쿠키를 찾습니다.
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim(); // 좌우 공백 제거

    // 쿠키의 이름과 값으로 나눕니다.
    const [cookieName, cookieValue] = cookie.split('=');

    // 주어진 이름에 해당하는 쿠키를 찾으면 해당 값을 반환합니다.
    if (cookieName === name) {
      return cookieValue;
    }
  }

  // 주어진 이름에 해당하는 쿠키를 찾지 못한 경우 null을 반환합니다.
  return null;
}

async function signOut() {
  // 백엔드 조회 api 가져오기
  const response = await fetch(`http://localhost:3000/api/users/signout`);
  const signOut = await response.json();

  alert(signOut.message);
  window.location.href = '/page/main.html';
}
