// 로그인
async function googleLogin() {
  try {
    const axiosInstance = axios.create({
      baseURL: "http://localhost:3000"
    });

    window.location.href = "http://localhost:3000/api/google/login";
    // const response = await axiosInstance.post("/api/google/login");
    // console.log(response);
    // if (response.data.success) {
    //   alert(`환영합니다.`);
    //   const accessToken = response.data.accessToken;
    //   setCookie("accessToken", accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    //   window.location.href = "/views/main.html";
    // }
  } catch (error) {
    // alert("아이디 또는 비밀번호가 틀렸습니다.");
    console.error("Error:", error);
  }
}

const googleBtn = document.getElementById("googleBtn");
googleBtn.addEventListener("click", () => {
  googleLogin();
});
