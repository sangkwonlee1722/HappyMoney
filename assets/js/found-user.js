const foundEmaildBtn = document.getElementById("foundEmaildBtn");
let btnCheck = true;
foundEmaildBtn.addEventListener("click", async () => {
  if (btnCheck) {
    try {
      const foundPhoneInput = document.getElementById("foundPhoneInput").value;
      const showEmailModal = document.querySelector(".showEmailModal");

      const user = {
        phone: foundPhoneInput
      };

      const axiosInstance = axios.create({
        baseURL: "http://localhost:3000",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const response = await axiosInstance.post("/api/user/found-email", user);

      const notUser = response.data.user;
      if (!notUser.length) {
        alert("회원이 아닙니다.");
      }

      if (response.data.success) {
        const allEmail = response.data.user;
        allEmail.forEach((email) => {
          const emailDiv = document.createElement("div");
          emailDiv.style.color = "grey";
          emailDiv.style.borderBottom = "1px solid #000";
          emailDiv.style.fontSize = "15px";
          emailDiv.textContent = `● ${email.email} ●`;
          showEmailModal.style.border = "1px solid rgb(122,122,122)";
          showEmailModal.appendChild(emailDiv);
        });
      }
    } catch (error) {
      const errorMessage = error.response.data.message;
      alert(errorMessage);
      console.error("Error:", error.response);
    } finally {
      btnCheck = false;
    }
  }
});
