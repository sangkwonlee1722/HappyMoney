const foundPasswordBtn = document.getElementById("foundPasswordBtn");

foundPasswordBtn.addEventListener("click", async () => {
  const foundEmailInput = document.getElementById("foundEmailInput").value;

  const user = {
    email: foundEmailInput
  };

  try {
    const axiosInstance = axios.create({
      baseURL: "http://localhost:3000",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const response = await axiosInstance.post("/api/user/found-password", user);

    if (response.data.success) {
      alert("입력하신 이메일로 임시 비밀번호가 전송됐습니다.");
    }
  } catch (error) {
    const errorMessage = error.response.data.message;
    alert(errorMessage);
    console.error("Error:", error.response);
  }
});
