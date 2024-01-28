import { baseUrl } from "./common.js";
import getToken from './common.js'

// 내가 읽지 않은 알림이 있을 경우 빨간 점 표시

// 나의 모든 알림 데이터 가져오기 
export async function getMyAllPushNotis() {
  const apiUrl = baseUrl + 'push'
  const token = getToken();

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      },
    })

    return result.data.pushNotis
  } catch (error) {
    console.error(error)
  }
}

// 나의 알림 데이터 뿌려주기
export async function spreadMyAllPushNotis() {
  const mainDom = document.querySelector('.hm-alram-list')
  const pushNotis = await getMyAllPushNotis()

  if (pushNotis.length !== 0) {
    mainDom.innerHTML =
      pushNotis.map(noti => {
        const { id, createdAt, serviceType, isRead, contents1, contents2, contentId } = noti

        const readStatus = isRead === false ? "안읽음" : "읽음";
        const readStatusClass = isRead === false ? "unread" : "read";

        const dateObject = new Date(createdAt);
        const formattedDate = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, "0")}-${String(dateObject.getDate()).padStart(2, "0")} ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;

        let message
        let contentUrl
        switch (serviceType) {
          case "댓글":
            message = `[${contents2}]님이 게시글에 댓글을 남겼습니다.`
            break

          case "쪽지":
            message = `[${contents2}]님이 쪽지를 보냈습니다.`
            contentUrl = `http://localhost:3000/views/twit/twit-detail.html?send=false&id=${contentId}`
            break

          case "주식":
            message = `주식 ${contents1}에 성공하였습니다.`
            break
        }

        return `
      <li class="hm-alram" data-id="${id}">
        <a href="${contentUrl}" class="contents-url"></a>
        <div class="alram-list-contnents">
          <div class="alram-top">
            <h6>${serviceType}</h6>
            <button class="alram-delete-btn">X</button>
          </div>
          <div class="alram-body">
            <p class="alram-message">${message}</p>
            <p class="alram-contents">${contents1}</p>
          </div>
          <div class="alram-footer">
            <p class=${readStatusClass}>${readStatus}</p>
            <p class="alram-date">${formattedDate}</p>
          </div>
        </div>
      </li>
      <hr />
        `
      }).join("")
  } else {
    mainDom.innerHTML = `
    <div class="none-contents">
      <span>알림이 없습니다.</span>
    </div>
    `
  }

  // X 버튼 클릭 시 해당 알림을 삭제하는 함수
  $('.alram-delete-btn').on('click', async function () {
    const pushNoti = $(this).closest('li');
    const pushNotiId = pushNoti.attr('data-id');

    await deletePushNoti(pushNotiId, pushNoti);
  });

  // 전체 알림 삭제
  $('.delete-all-alram').on('click', deleteAllPushNoti);

  // 전체 알림 읽음 처리
  $('.all-read-btn').on('click', updateReadStatusAllPushNoti)

  // 알림 클릭 시 읽음 처리
  $('.contents-url').on('click', async function () {
    const pushNoti = $(this).closest('li');
    const pushNotiId = pushNoti.attr('data-id');

    await updateReadStatusPushNoti(pushNotiId);
  });
}

// 특정 알림 삭제 함수
export async function deletePushNoti(pushNotiId, pushNoti) {
  const apiUrl = baseUrl + `push/${pushNotiId}`;
  const token = getToken()
  try {
    await axios.delete(apiUrl, {
      headers: {
        'Authorization': token,
      }
    });
    await spreadMyAllPushNotis()
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

// 전체 알림 삭제 함수
export async function deleteAllPushNoti() {
  const apiUrl = baseUrl + `push`;
  const token = getToken()
  try {
    await axios.delete(apiUrl, {
      headers: {
        'Authorization': token,
      }
    });
    await spreadMyAllPushNotis()
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

// 전체 알림 읽음 처리
export async function updateReadStatusAllPushNoti() {
  const apiUrl = baseUrl + `push`;
  const token = getToken()

  try {
    await axios.patch(apiUrl, null, {
      headers: {
        'Authorization': token,
      }
    });
    await spreadMyAllPushNotis()
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}

// 특정 알림 읽음 처리 함수
export async function updateReadStatusPushNoti(pushNotiId) {
  const apiUrl = baseUrl + `push/${pushNotiId}`;
  const token = getToken()
  try {
    await axios.patch(apiUrl, null, {
      headers: {
        'Authorization': token,
      }
    });
    await spreadMyAllPushNotis()
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}