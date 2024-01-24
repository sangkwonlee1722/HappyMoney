import getToken from "./common.js";

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

const token = getToken();

async function signout() {
  try {
    const axiosInstance = axios.create({
      baseURL: "http://localhost:3000",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      }
    });

    const response = await axiosInstance.delete("/api/user/delete");

    if (response.data.success) {
      deleteCookie("accessToken");
      alert("이메일 인증 후 회원탈퇴가 진행됩니다.");
      window.location.reload();
    } else {
      alert(`${response.data.errorMessage}`);
      window.location.href = "/views/signin.html";
    }
  } catch (error) {
    console.error("Error:", error.response);
  }
}

const signoutBtn = document.getElementById("signoutBtn");
signoutBtn.addEventListener("click", () => {
  const userConfirmed = window.confirm("정말로 회원탈퇴 하시겠습니까?");
  if (userConfirmed) {
    signout();
  }
});
