import getToken from '/js/common.js'
import { baseUrl } from '../common.js';
import renderPagination from '/js/pagenation.js'

const params = new URLSearchParams(window.location.search);
const twit_page = params.get("page");

// 탭버튼
$('.twit-tab li').on('click', function () {
  $('.twit-tab li').removeClass('on');
  $(this).addClass('on');
  $('#hm-pagination').html('');
})


getTwitData(`${baseUrl}twits/getReceive?page=${twit_page}`, '보낸사람', '받은시간');

// 받은쪽지 탭 클릭
$('#receive').click(function () {
  window.history.pushState({}, '', `/views/twit/twit.html?page=1`);
  getTwitData(`${baseUrl}twits/getReceive?page=1`, '보낸사람', '받은시간');
})

// 보낸 쪽지 탭 클릭
$('#send').click(function () {
  window.history.pushState({}, '', `/views/twit/twit.html?page=1`);
  getTwitData(`${baseUrl}twits/getSend?page=1`, '받은사람', '보낸시간');
})

// 쪽지 조회API 
async function getTwitData(url, name, time) {
  try {
    const config = {
      headers: {
        'Authorization': `${getToken()}`,
        'Content-Type': 'application/json'
      },
    };
    const result = await axios.get(url, config);
    const list = result.data.list;
    const success = result.data.success;
    const total = result.data.total;

    $('.contents.name .classification').text(name);
    $('.contents.name .list-info-2').text(time);

    const mainDom = document.querySelector("#twitList");

    if (success === false) {
      return mainDom.innerHTML = `<div class="text-center">${list.message}</div>`;
    }

    mainDom.innerHTML = list
      .map(twit => {
        const { senderName, receiverName, contents, createdAt, id } = twit;
        const name = url === `${baseUrl}twits/getSend?page=${twit_page}` ? senderName : receiverName;
        const send = url === `${baseUrl}twits/getReceive?page=${twit_page}` ? false : true;
        const dateObject = new Date(createdAt);
        const formattedDate = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, "0")}-${String(dateObject.getDate()).padStart(2, "0")} ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;
        return `
        <li class="contents">
          <a href="/views/twit/twit-detail.html?send=${send}&id=${id}"></a>
          <div class="list-info">
            <div class="classification">${name}</div>
            <div class="title">${contents}</div>
          </div>
          <div class="list-info-2">
            <div class="date">${formattedDate}</div>
          </div>
        </li>
        <hr />
        `
      }).join("");

    renderPagination(total, twit_page, '/views/twit/twit.html');
  } catch (error) {
    console.error(error);
  }
}
