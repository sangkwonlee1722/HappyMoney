try {
  const axiosInstance = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const response = await axiosInstance.get(`/api/user//email-verify-signin?email=${email}`);
  console.log(response);

  if (response.data.success) {
    alert("이메일 인증이 완료되었습니다.");
    // Redirect to a success page or perform other actions
  } else {
    alert("이메일 인증에 실패했습니다.");
    // Handle the case when email verification fails
  }
} catch (error) {
  console.error("Error:", error.response);
}
