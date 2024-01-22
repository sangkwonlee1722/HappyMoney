const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const value = `Bearer ${document.cookie}`;

  const parts = value.split(`Bearer ${name}=`);

  if (parts.length === 2) {
    return parts.pop().split("Bearer ").shift().trim();
  }

  return undefined;
};

const body = document.body;
let modalCreated = false;

const login = () => {
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

    const loginConfirmBtn = document.querySelector(".loginConfirmBtn");
    loginConfirm(loginConfirmBtn);
  }
};

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
        setCookie("accessToken", accessToken, 1);
        window.location.href = "/views/main.html";
      }
    } catch (error) {
      alert("아이디 또는 비밀번호가 틀렸습니다.");
      console.error("Error:", error.response);
    }
  });
};

const isTokenPresent = () => {
  const token = getCookie("accessToken");
  return token !== undefined;
};

const hideAndShowBtn = () => {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const mypageBtn = document.getElementById("mypageBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const signoutBtn = document.getElementById("signoutBtn");
  if (isTokenPresent()) {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    mypageBtn.style.display = "block";
    logoutBtn.style.display = "block";
    signoutBtn.style.display = "block";
  } else {
    mypageBtn.style.display = "none";
    logoutBtn.style.display = "none";
    signoutBtn.style.display = "none";
    loginBtn.style.display = "block";
    signupBtn.style.display = "block";
  }
};

hideAndShowBtn();
