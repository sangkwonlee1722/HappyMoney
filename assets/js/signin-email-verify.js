document.addEventListener("DOMContentLoaded", async () => {
  const queryParams = new URLSearchParams(window.location.search);
  const email = queryParams.get("email");

  const encodedEmail = encodeURIComponent(email);
  try {
    const axiosInstance = axios.create({
      baseURL: "http://localhost:3000",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const response = await axiosInstance.get(`/api/user/email-verify-signin?email=${encodedEmail}`);
    console.log(response);
    console.log("ah");
    alert("이메일 인증이 완료되었습니다.");
    window.location.href = "/views/login.html";
  } catch (error) {
    console.error("Error:", error.response);
  }
});
