const signupBtn = document.querySelector(".signupBtn");
const emailCheckBtn = document.getElementById("emailCheckBtn");
const nickNameCheckBtn = document.getElementById("nickNameCheckBtn");

let emailCheck = false;
let nickNameCheck = false;

emailCheckBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const emailCheckVerify = document.getElementById("emailCheckVerify");
  try {
    const axiosInstance = axios.create({
      baseURL: "",
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
      emailCheckVerify.innerHTML = "이메일을 작성해주세요.";
      emailCheckVerify.style.color = "red";
      return;
    } else if (emailExists) {
      emailCheckVerify.innerHTML = "중복된 이메일입니다.";
      emailCheckVerify.style.color = "red";
      return;
    } else if (!email.includes("@")) {
      emailCheckVerify.innerHTML = "이메일 형식에 맞게 작성해주세요.";
      emailCheckVerify.style.color = "red";
      return;
    } else {
      emailCheck = true;
      emailCheckVerify.innerHTML = "사용 가능한 이메일입니다.";
      emailCheckVerify.style.color = "blue";
      return;
    }
  } catch (error) {
    console.error("Error:", error.response);
  }
});

nickNameCheckBtn.addEventListener("click", async () => {
  const nickName = document.getElementById("nickName").value;
  const nickNameCheckVerify = document.getElementById("nickNameCheckVerify");

  try {
    const axiosInstance = axios.create({
      baseURL: "",
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
      nickNameCheckVerify.innerHTML = "닉네임을 작성해주세요.";
      nickNameCheckVerify.style.color = "red";
      return;
    } else if (nicknameExists) {
      nickNameCheckVerify.innerHTML = "중복된 닉네임입니다.";
      nickNameCheckVerify.style.color = "red";
      return;
    } else if (!(nickName.length >= 2 && nickName.length <= 6)) {
      nickNameCheckVerify.innerHTML = "닉네임은 2자리 이상 6자리 이하입니다.";
      nickNameCheckVerify.style.color = "red";
      return;
    } else {
      nickNameCheck = true;
      nickNameCheckVerify.innerHTML = "사용 가능한 닉네임입니다.";
      nickNameCheckVerify.style.color = "blue";
      return;
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
  const phone = document.getElementById("signupInputPhone").value;

  const passwordCheckVerify = document.getElementById("passwordCheckVerify");
  const nickNameCheckVerify = document.getElementById("nickNameCheckVerify");
  const emailCheckVerify = document.getElementById("emailCheckVerify");
  const nameCheckVerify = document.getElementById("nameCheckVerify");
  const phoneCheckVerify = document.getElementById("phoneCheckVerify");

  const userInfo = {
    email,
    password,
    passwordCheck,
    name,
    nickName,
    phone
  };

  if (!email) {
    emailCheckVerify.innerHTML = "이메일을 작성해주세요.";
    emailCheckVerify.style.color = "red";
    return;
  }

  if (password !== passwordCheck) {
    passwordCheckVerify.innerHTML = "비밀번호를 다시 입력하세요.";
    passwordCheckVerify.style.color = "red";
    return;
  } else if (password.length < 6) {
    passwordCheckVerify.innerHTML = "비밀번호는 6자리 이상만 가능합니다.";
    passwordCheckVerify.style.color = "red";
    return;
  } else {
    passwordCheckVerify.innerHTML = "";
  }

  if (!(nickName.length >= 2 && nickName.length <= 6)) {
    nickNameCheckVerify.innerHTML = "닉네임은 2자리 이상 6자리 이하만 가능합니다.";
    nickNameCheckVerify.style.color = "red";
    return;
  } else if (!nickNameCheck) {
    nickNameCheckVerify.innerHTML = "닉네임 중복체크를 해주세요.";
    nickNameCheckVerify.style.color = "red";
    return;
  } else if (nickName.includes(" ")) {
    nickNameCheckVerify.innerHTML = "닉네임에는 공백을 사용할 수 없습니다.";
    nickNameCheckVerify.style.color = "red";
    return;
  } else {
    nickNameCheckVerify.innerHTML = "";
  }

  if (!(name.length >= 2 && name.length <= 6)) {
    nameCheckVerify.innerHTML = "이름은 2자리 이상, 6자리 이하만 가능합니다.";
    nameCheckVerify.style.color = "red";
    return;
  } else if (name.includes(" ")) {
    nameCheckVerify.innerHTML = "이름에는 공백을 사용할 수 없습니다..";
    nameCheckVerify.style.color = "red";
    return;
  } else if (/[0-9]/.test(name)) {
    nameCheckVerify.innerHTML = "이름에는 숫자를 포함할 수 없습니다.";
    nameCheckVerify.style.color = "red";
    return;
  } else {
    nameCheckVerify.innerHTML = "";
  }

  if (!emailCheck) {
    emailCheckVerify.innerHTML = "이메일 중복체크를 해주세요.";
    emailCheckVerify.style.color = "red";
    return;
  }

  if (!phone.includes("-") || phone.length !== 13) {
    phoneCheckVerify.innerHTML = "휴대폰 번호 양식에 맞게 작성해주세요.";
    return;
  } else {
    phoneCheckVerify.innerHTML = "";
  }

  try {
    const axiosInstance = axios.create({
      baseURL: "",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const response = await axiosInstance.post("/api/user", userInfo);

    if (response.data.success) {
      alert("이메일 인증 후 로그인 해주세요.");
      window.location.href = "/views/main.html";
    } else {
      const errorMessage = response.data.message;
      alert(errorMessage);
      return;
    }
  } catch (error) {
    console.log(error);
    const errorMessage = error.response.data.message[0];
    if (errorMessage === "이메일을 작성해주세요.") {
      emailCheckVerify.innerHTML = error.response.data.message[0];
      emailCheckVerify.style.color = "red";
    } else if (errorMessage === "이메일 형식으로 작성해주세요.") {
      emailCheckVerify.innerHTML = error.response.data.message[0];
      emailCheckVerify.style.color = "red";
    } else if (errorMessage === "비밀번호를 작성해주세요.") {
      passwordCheckVerify.innerHTML = error.response.data.message[0];
      passwordCheckVerify.style.color = "red";
    } else if (errorMessage === "비밀번호는 특수문자를 포함해야 합니다.") {
      passwordCheckVerify.innerHTML = error.response.data.message[0];
      passwordCheckVerify.style.color = "red";
    } else if (errorMessage === "비밀번호는 특수문자를 포함해야 합니다.") {
      passwordCheckVerify.innerHTML = error.response.data.message[0];
      passwordCheckVerify.style.color = "red";
    } else if (errorMessage === "이름을 작성해주세요.") {
      nameCheckVerify.innerHTML = error.response.data.message[0];
      nameCheckVerify.style.color = "red";
    } else if (errorMessage === "닉네임을 작성해주세요.") {
      nickNameCheckVerify.innerHTML = error.response.data.message[0];
      nickNameCheckVerify.style.color = "red";
    } else if (errorMessage === "휴대폰 번호를 작성해주세요.") {
      phoneCheckVerify.innerHTML = error.response.data.message[0];
      phoneCheckVerify.style.color = "red";
    } else {
      passwordCheckVerify.innerHTML = "";
      console.error("Error:", error.response);
    }
  }
});
