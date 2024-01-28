// 로그인
async function googleLogin() {
  try {
    // Redirect to Google's login page
    window.location.href = "http://localhost:3000/api/google/login";
  } catch (error) {
    console.error("Error:", error);
  }
}

const googleBtn = document.getElementById("googleBtn");
googleBtn.addEventListener("click", googleLogin);

async function kakaoLogin() {
  try {
    window.location.href = "http://localhost:3000/api/kakao/login";
  } catch (error) {
    // alert("아이디 또는 비밀번호가 틀렸습니다.");
    console.error("Error:", error);
  }
}

const kakaoBtn = document.getElementById("kakaoBtn");
kakaoBtn.addEventListener("click", () => {
  kakaoLogin();
});

async function naverLogin() {
  try {
    window.location.href = "http://localhost:3000/api/naver/login";
  } catch (error) {
    // alert("아이디 또는 비밀번호가 틀렸습니다.");
    console.error("Error:", error);
  }
}

const naverBtn = document.getElementById("naverBtn");
naverBtn.addEventListener("click", () => {
  naverLogin();
});
