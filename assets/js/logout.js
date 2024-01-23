const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

const logout = () => {
  deleteCookie("accessToken");

  alert("로그아웃 되었습니다.");

  window.location.reload();
};
