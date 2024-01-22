const signupBtn = document.querySelector(".signupBtn");
const emailCheckBtn = document.getElementById("emailCheckBtn");
const nickNameCheckBtn = document.getElementById("nickNameCheckBtn");

let emailCheck = false;
let nickNameCheck = false;

emailCheckBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  try {
    const axiosInstance = axios.create({
      baseURL: "http://localhost:3000",
      headers: {
        "Content-Type": "application/json"
      }
    });

    let emailExists = false;

    const response = await axiosInstance.get("/api/user");
    const users = response.data.data.users;
    users.forEach((user) => {
      if (user.email === email) {
        emailExists = true;
      }
    });
    if (!email) {
      alert("이메일을 작성해주세요.");
      return;
    }
    if (emailExists) {
      alert("이미 존재하는 이메일입니다.");
    } else {
      emailCheck = true;
      alert("사용 가능한 이메일입니다.");
    }
  } catch (error) {
    console.error("Error:", error.response);
  }
});

nickNameCheckBtn.addEventListener("click", async () => {
  const nickName = document.getElementById("nickName").value;

  try {
    const axiosInstance = axios.create({
      baseURL: "http://localhost:3000",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const response = await axiosInstance.get("/api/user");
    const users = response.data.data.users;

    let nicknameExists = false;

    users.forEach((user) => {
      if (user.nickName === nickName) {
        nicknameExists = true;
      }
    });

    if (!nickName) {
      alert("닉네임을 작성해주세요.");
      return;
    }
    if (nicknameExists) {
      alert("이미 존재하는 닉네임입니다.");
    } else {
      nickNameCheck = true;
      alert("사용 가능한 닉네임입니다.");
    }
  } catch (error) {
    console.error("Error:", error.response);
  }
});

signupBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const passwordCheck = document.getElementById("passwordCheck").value;
  const name = document.getElementById("name").value;
  const nickName = document.getElementById("nickName").value;
  const phone = document.getElementById("phone").value;

  const userInfo = {
    email,
    password,
    passwordCheck,
    name,
    nickName,
    phone
  };

  const specialCharacters = ["!", "@", "#", "$", "%", "^", "&", "*"];

  if (!email || !password || !passwordCheck || !name || !nickName || !phone) {
    alert("빈 칸을 입력하세요.");
  } else {
    if (!specialCharacters.some((char) => password.includes(char))) {
      alert("비밀번호에 특수문자를 포함하세요.");
    }

    if (password !== passwordCheck) {
      alert("비밀번호를 다시 입력해주세요.");
    } else if (password.length < 6) {
      alert("비밀번호는 6자리 이상입니다.");
    }
  }

  if (!(nickName.length >= 2 && nickName.length <= 6)) {
    alert("닉네임은 2자리 이상, 6자리 이하만 가능합니다.");
    return;
  }

  if (!(name.length >= 2 && name.length <= 6)) {
    alert("이름은 2자리 이상, 6자리 이하만 가능합니다.");
    return;
  }

  if (!emailCheck) {
    alert("이메일 중복체크를 해주세요.");
    return;
  }

  if (!nickNameCheck) {
    alert("닉네임 중복체크를 해주세요.");
    return;
  }

  try {
    const axiosInstance = axios.create({
      baseURL: "http://localhost:3000",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const response = await axiosInstance.post("/api/user", userInfo);

    if (response.data.success) {
      alert("이메일 인증 후 로그인 해주세요..");
      window.location.href = "/views/login.html";
    } else {
      alert(`${response.data.errorMessage}`);
      window.location.href = "/page/join.html";
    }
  } catch (error) {
    console.error("Error:", error.response);
  }
});
