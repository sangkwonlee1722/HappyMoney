// // 로그인
// async function googleLogin() {
//   try {
//     const axiosInstance = axios.create({
//       baseURL: "http://localhost:3000"
//     });

//     window.location.href = "http://localhost:3000/api/google/login";
//     // const response = await axiosInstance.post("/api/google/login");
//     // console.log(response);
//     // if (response.data.success) {
//     //   alert(`환영합니다.`);
//     //   const accessToken = response.data.accessToken;
//     //   setCookie("accessToken", accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
//     //   window.location.href = "/views/main.html";
//     // }
//   } catch (error) {
//     // alert("아이디 또는 비밀번호가 틀렸습니다.");
//     console.error("Error:", error);
//   }
// }

// const googleBtn = document.getElementById("googleBtn");
// googleBtn.addEventListener("click", () => {
//   googleLogin();
// });

// Import Axios library

// Function to initiate Google login
async function googleLogin() {
  try {
    // Create an Axios instance
    const axiosInstance = axios.create({
      baseURL: "http://localhost:3000",
      withCredentials: true, // Allow credentials (cookies) to be sent with the request,
      mode: "no-cors" // Add this line
    });

    // Make a GET request to initiate Google login
    const response = await axiosInstance.get("/api/google/login");

    // Check if the server responded with a success message
    if (response.data.success) {
      alert(`Welcome!`);

      // Optionally, handle the received access token
      const accessToken = response.data.accessToken;
      // Perform actions like setting cookies, redirecting, etc.
      // setCookie("accessToken", accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      // window.location.href = "/views/main.html";
    }
  } catch (error) {
    console.error("Error:", error);
    // Handle errors, show user-friendly messages, etc.
  }
}

// Attach the function to the button click event
const googleBtn = document.getElementById("googleBtn");
googleBtn.addEventListener("click", googleLogin);
