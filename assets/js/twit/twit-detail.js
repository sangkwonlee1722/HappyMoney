import getToken from '/js/common.js'

const params = new URLSearchParams(window.location.search);
const twit_id = params.get("id");
const twit_send = params.get("send");

getDetailTwitData(`http://localhost:3000/api/twits/${twit_id}`);

// 쪽지 조회API 
async function getDetailTwitData(url) {
  try {
    const config = {
      headers: {
        'Authorization': `${getToken()}`,
        'Content-Type': 'application/json'
      },
    };
    const result = await axios.patch(url, {}, config);
    const item = result.data.data;
    const { senderName, receiverName, createdAt, contents, isRead } = item;
    const mainDom = document.querySelector("#twitDetailWrap");
    const dateObject = new Date(createdAt);
    const formattedDate = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, "0")}-${String(dateObject.getDate()).padStart(2, "0")} ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;

    mainDom.innerHTML = `
        <!-- <h2>${twit_send === 'true' ? '보낸쪽지' : '받은쪽지'}</h2> -->
        <div class="twit-dt-top pb-4">
          <div class="dt-top-l">
            <dl class="mb-2">
              <dt>${twit_send === 'true' ? '받은사람' : '보낸사람'}</dt>
              <dd>${twit_send === 'true' ? receiverName : senderName}</dd>
            </dl>
            <dl>
              <dt>${twit_send === 'true' ? '보낸시간' : '받은시간'}</dt>
              <dd>${formattedDate} <span>${twit_send === 'true' && isRead === true ? '읽음' : ''}</span></dd>
            </dl>
          </div>
          ${twit_send === 'true' ? `
            <div class="dt-top-r">
              <button class="hm-button hm-gray-color">삭제</button>
            </div>
            `: `
            <div class="dt-top-r">
              <button class="hm-button"><a href="/views/twit/twit-send.html?name=${senderName}">답장</a></button>
              <button class="hm-button hm-gray-color">삭제</button>
            </div>`
      }
        </div>
        <div class="twit-dt-bottom">
          ${contents}
        </div>
        `;
    // $('.contents.name .classification').text(name);
    // $('.contents.name .list-info-2').text(time);
  } catch (error) {
    console.error(error);
  }
}
