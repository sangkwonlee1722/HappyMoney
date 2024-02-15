const foundEmaildBtn = document.getElementById("foundEmaildBtn");
foundEmaildBtn.addEventListener("click", async () => {
  try {
    const foundPhoneInput = document.getElementById("foundPhoneInput").value;
    const showEmailModal = document.querySelector(".showEmailModal");

    if (!foundPhoneInput) {
      alert("휴대폰 번호를 입력하세요.");
      return;
    }

    showEmailModal.innerHTML = "";

    const user = {
      phone: foundPhoneInput
    };

    const axiosInstance = axios.create({
      baseURL: "",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const response = await axiosInstance.post("/api/user/found-email", user);

    const notUser = response.data.user;
    if (!notUser.length) {
      alert("회원이 아닙니다.");
    }

    function maskEmail(email) {
      const [username, domain] = email.split("@");
      const maskedUsername = username.length >= 5 ? `${username.substring(0, 3)}***` : `${username.substring(0, 2)}**`;
      return `${maskedUsername}@${domain}`;
    }

    if (response.data.success) {
      const allEmail = response.data.user;
      allEmail.forEach((email) => {
        const maskedEmail = maskEmail(email.email);

        const emailDiv = document.createElement("div");
        emailDiv.style.color = "grey";
        emailDiv.style.borderBottom = "1px solid #000";
        emailDiv.style.fontSize = "15px";
        emailDiv.textContent = `● ${maskedEmail} ●`;
        showEmailModal.style.border = "1px solid rgb(122,122,122)";
        showEmailModal.appendChild(emailDiv);
      });
    }
  } catch (error) {
    const errorMessage = error.response.data.message;
    alert(errorMessage);
    console.error("Error:", error.response);
  }
});
