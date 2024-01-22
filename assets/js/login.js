document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  let modalCreated = false;

  window.login = () => {
    if (!modalCreated) {
      const overlay = document.createElement("div");
      overlay.className = "overlay";
      body.appendChild(overlay);

      const temp_html = `
      <div class="loginModal">
        <div class="loginInput">
          <div class="login">로그인</div>
          <input type="email" class="loginInputValue" id="email" placeholder="이메일 주소" />
          <input type="password" class="loginInputValue" id="password" placeholder="비밀번호" />
          <button class="loginConfirmBtn">로그인</button>
          <div class="signupExplain">아직 회원이 아니신가요? <a href="/views/signup.html"><span class="blue"> 회원가입</span></a></div>
        </div>
      </div>
    `;

      body.insertAdjacentHTML("beforeend", temp_html);
      modalCreated = true;

      overlay.addEventListener("click", () => {
        body.removeChild(overlay);
        body.removeChild(document.querySelector(".loginModal"));
        modalCreated = false;
      });
    }

    const loginConfirmBtn = document.querySelector(".loginConfirmBtn");
    loginConfirm(loginConfirmBtn);
  };
});

const loginConfirm = (loginConfirmBtn) => {
  loginConfirmBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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
        sessionStorage.setItem("accessToken", accessToken);
        window.location.reload();
      }

      const loginBtn = document.getElementById("loginBtn");
      const signupBtn = document.getElementById("signupBtn");
      const mypageBtn = document.getElementById("mypageBtn");
      const logoutBtn = document.getElementById("logoutBtn");

      handleButtonVisibility(loginBtn, signupBtn, mypageBtn, logoutBtn);
    } catch (error) {
      alert("아이디 또는 비밀번호가 틀렸습니다.");
      console.error("Error:", error.response);
    }
  });
};

const isTokenPresent = () => {
  const token = sessionStorage.getItem("accessToken");
  return token !== null;
};

const handleButtonVisibility = (loginBtn, signupBtn, mypageBtn, logoutBtn) => {
  if (isTokenPresent()) {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    mypageBtn.style.display = "block";
    logoutBtn.style.display = "block";
  } else {
    loginBtn.style.display = "block";
    signupBtn.style.display = "block";
    mypageBtn.style.display = "none";
    logoutBtn.style.display = "none";
  }
};
