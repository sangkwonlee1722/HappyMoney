const signout = async () => {
  try {
    const token = getCookie("accessToken");

    const axiosInstance = axios.create({
      baseURL: "http://localhost:3000",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const response = await axiosInstance.delete("/api/user/delete");

    if (response.data.success) {
      alert("이메일 인증 후 회원탈퇴가 진행됩니다.");
      deleteCookie("accessToken");
      window.location.href = "/views/main.html";
    } else {
      alert(`${response.data.errorMessage}`);
      window.location.href = "/views/signin.html";
    }
  } catch (error) {
    console.error("Error:", error.response);
  }
};
