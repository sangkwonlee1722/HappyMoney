document.addEventListener("DOMContentLoaded", function () {
  const itemsPerPage = 10;
  let currentPage = 1;

  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/posts`);
      const data = response.data.data;

      // Calculate start and end index for current page
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      // Display data for the current page
      const dataContainer = document.querySelector(".board-list");

      dataContainer.innerHTML = "";
      for (let i = startIndex; i < endIndex && i < data.length; i++) {
        const formattedDate = data[i].createdAt.split("T")[0];
        const commentClass = data[i].commentNumbers === 0 ? "comment hidden" : "comment";
        const listItem = `
    <li class="contents">
       <a href="#none"></a>
       <div class="list-info">
         <div class="classification">${data[i].category}</div>
         <div class="title">${data[i].title}</div>
         <div class=${commentClass}>
           <img src="../images/comment.png" alt="comment-icon" class="comment-icon" />
           <span class="comment-number">${data[i].commentNumbers}</span>
         </div>
       </div>
       <div class="list-info-2">
         <div class="author">${data[i].nickName}</div>
         <div class="date">${formattedDate}</div>
       </div>
    </li>
    <hr />
    `;
        dataContainer.insertAdjacentHTML("beforeend", listItem);
      }

      // 데이터 길이와 페이지당 아이템 수를 기반으로 전체 페이지 수 계산
      const totalPages = Math.ceil(data.length / itemsPerPage);

      // HTML에서 pagination 컨테이너에 대한 참조 가져오기
      const paginationContainer = document.querySelector(".pagination");

      // 이전 페이지와 다음 페이지를 표시할 화살표를 추가
      paginationContainer.innerHTML = "";

      // 페이지네이션에 표시될 전체 페이지 아이템 수 설정
      const totalPageItemsToShow = 10;

      // 10 페이지 이상인 경우에만 보이도록 확인
      if (totalPages > totalPageItemsToShow) {
        // 페이지네이션에 표시될 시작 및 끝 페이지 번호 계산
        const startPage = Math.max(1, currentPage - Math.floor(totalPageItemsToShow / 2));
        const endPage = Math.min(totalPages, startPage + totalPageItemsToShow - 1);

        // 현재 페이지가 1보다 큰 경우 이전 화살표 추가
        if (currentPage > 1) {
          const prevArrow = document.createElement("li");
          prevArrow.className = "page-item";
          prevArrow.textContent = "←";
          prevArrow.addEventListener("click", () => {
            currentPage--;
            fetchData();
          });
          paginationContainer.appendChild(prevArrow);
        }

        // 페이지를 순환하면서 각 페이지에 대한 페이지 링크 생성
        for (let i = startPage; i <= endPage; i++) {
          // 페이지 링크를 위한 새로운 list item 엘리먼트 생성
          const pageItem = document.createElement("li");
          pageItem.className = "page-item";

          // 페이지 링크의 텍스트 내용을 페이지 번호로 설정
          pageItem.textContent = i;

          // 현재 페이지인 경우 'current-page' 클래스 추가
          if (i === currentPage) {
            pageItem.classList.add("current-page");
          }

          // 페이지 링크에 클릭 이벤트 리스너 추가
          pageItem.addEventListener("click", () => {
            // 현재 페이지 업데이트 및 새 페이지에 대한 데이터 가져오기
            currentPage = i;
            fetchData();
          });

          // 페이지 링크를 pagination 컨테이너에 추가
          paginationContainer.appendChild(pageItem);
        }

        // 현재 페이지가 전체 페이지보다 작은 경우 다음 화살표 추가
        if (currentPage < totalPages) {
          const nextArrow = document.createElement("li");
          nextArrow.className = "page-item";
          nextArrow.textContent = "→";
          nextArrow.addEventListener("click", () => {
            currentPage++;
            fetchData();
          });
          paginationContainer.appendChild(nextArrow);
        }
      } else {
        // 페이지가 10장 이하인 경우 화살표 없이 모든 페이지를 표시
        for (let i = 1; i <= totalPages; i++) {
          const pageItem = document.createElement("li");
          pageItem.className = "page-item";

          // 현재 페이지인 경우 'current-page' 클래스 추가
          if (i === currentPage) {
            pageItem.classList.add("current-page");
          }

          // 페이지 링크의 텍스트 내용을 페이지 번호로 설정
          pageItem.textContent = i;

          // 페이지 링크에 클릭 이벤트 리스너 추가
          pageItem.addEventListener("click", () => {
            // 현재 페이지 업데이트 및 새 페이지에 대한 데이터 가져오기
            currentPage = i;
            fetchData();
          });

          // 페이지 링크를 pagination 컨테이너에 추가
          paginationContainer.appendChild(pageItem);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Initial data fetch
  fetchData();
});
