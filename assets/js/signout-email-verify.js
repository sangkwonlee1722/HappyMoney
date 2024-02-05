document.addEventListener("DOMContentLoaded", async () => {
  const queryParams = new URLSearchParams(window.location.search);
  const email = queryParams.get("email");
  const token = queryParams.get("token");

  const encodedEmail = encodeURIComponent(email);
  const encodedToken = encodeURIComponent(token);
  try {
    const axiosInstance = axios.create({
      baseURL: "",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const response = await axiosInstance.get(
      `/api/user/email-verify-signout?email=${encodedEmail}&token=${encodedToken}`
    );

    if (response.data.success) {
      alert("[happymoney] 정상적으로 회원탈퇴 되었습니다.");
      window.close();
    } else {
      alert("이메일 인증이 실패했습니다.");
      return;
    }
  } catch (error) {
    console.log(error.response);
    alert("이메일 인증이 실패했습니다.");
  }
});
