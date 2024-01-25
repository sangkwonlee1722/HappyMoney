const kakaoBtn = document.getElementById("kakaoBtn");

kakaoBtn.addEventListener("click", () => {
  window.Kakao.init("7e510a88b68e84e4377a5326486ba9be");
  function KakaoLogin() {
    window.Kakao.Auth.login({
      scope: "	profile_nickname,account_email",
      success: function (authObj) {
        console.log(authObj);
        window.Kakao.API.request({
          url: "/v2/user/me",
          success: (res) => {
            const kakao_account = res.kakao_account;
            console.log(kakao_account);
          }
        });
      }
    });
  }

  KakaoLogin();
});
