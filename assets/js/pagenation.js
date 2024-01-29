export default function renderPagination(_totalCount, currentPage, url) {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");

  if (_totalCount <= 10) return;

  let totalPage = Math.ceil(_totalCount / 10);
  let pageGroup = Math.ceil(currentPage / 10);

  let last = pageGroup * 10;
  if (last > totalPage) last = totalPage;
  let first = last - (10 - 1) <= 0 ? 1 : last - (10 - 1);
  let next = last + 1;
  let prev = first - 1;

  const fragmentPage = document.createDocumentFragment();
  if (prev > 0) {
    let allpreli = document.createElement('li');
    allpreli.insertAdjacentHTML("beforeend", `<a href='${url}?page=1' id='allprev' class="arrow">《</a>`);

    let preli = document.createElement('li');
    preli.insertAdjacentHTML("beforeend", `<a href='${url}?page=${Number(page) - 1}' id='prev' class="arrow">〈</a>`);

    fragmentPage.appendChild(allpreli);
    fragmentPage.appendChild(preli);
  }

  for (let i = first; i <= last; i++) {
    const li = document.createElement("li");
    li.insertAdjacentHTML("beforeend", `<a href='${url}?page=${i}' id='page-${i}' data-num='${i}'>${i}</a>`);
    fragmentPage.appendChild(li);
  }

  if (last < totalPage) {
    let allendli = document.createElement('li');
    allendli.insertAdjacentHTML("beforeend", `<a href='${url}?page=${totalPage}'  id='allnext' class="arrow">》</a>`);

    let endli = document.createElement('li');
    endli.insertAdjacentHTML("beforeend", `<a  href='${url}?page=${Number(page) + 1}'  id='next' class="arrow">〉</a>`);

    fragmentPage.appendChild(endli);
    fragmentPage.appendChild(allendli);
  }

  document.getElementById('hm-pagination').appendChild(fragmentPage);
  // 페이지 목록 생성

  $(`#hm-pagination a`).removeClass("active");
  $(`#hm-pagination a#page-${page}`).addClass("active");

  $("#hm-pagination a").click(function (e) {
    // e.preventDefault();
    let $item = $(this);
    let $id = $item.attr("id");
    let selectedPage = $item.text();

    if ($id == "next") selectedPage = next;
    if ($id == "prev") selectedPage = prev;
    if ($id == "allprev") selectedPage = 1;
    if ($id == "allnext") selectedPage = totalPage;

    list.renderPagination(selectedPage);//페이지네이션 그리는 함수
    list.search(selectedPage);//페이지 그리는 함수
  });
};