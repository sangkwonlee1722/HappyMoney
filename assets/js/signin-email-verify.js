document.addEventListener("DOMContentLoaded", async () => {
  const queryParams = new URLSearchParams(window.location.search);
  const email = queryParams.get("email");

  const encodedEmail = encodeURIComponent(email);

  try {
    const axiosInstance = axios.create({
      baseURL: "",
      headers: {
        "Content-Type": "application/json"
      }
    });
    alert("[happymoney] 정상적으로 회원가입 되었습니다.");
    window.close();
    const response = await axiosInstance.get(`/api/user/email-verify-signin?email=${encodedEmail}`);

    if (response.data.success) {
      alert("[happymoney] 정상적으로 회원가입 되었습니다.");
      window.close();
    } else {
      alert("이메일 인증이 실패했습니다.");
    }
  } catch (error) {
    console.error("Error:", error.response);
  }
});
