document.addEventListener("DOMContentLoaded", function () {
  const urlSearchParams = new URL(location.href).searchParams;
  const idValue = urlSearchParams.get("id");
  console.log(idValue);
  const fetchOneData = async () => {
    try {
      const response = await axios.get(`/api/posts/${idValue}`);
      const data = response.data.data;
      const comments = response.data.data.comments;
      console.log(data);
      console.log(comments);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  fetchOneData();
});
