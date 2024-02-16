import { baseUrl } from "./common.js";
import getToken from './common.js'

// 내가 읽지 않은 알림이 있을 경우 빨간 점 표시
export async function checkPushNotis() {
  const apiUrl = baseUrl + 'push/unread-notis'
  const token = getToken();

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      },
    })

    return result.data.unReadNotisCounts
  } catch (error) {
    console.error(error)
  }
}

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
  const mainDom = document.querySelector('.hm-alarm-list')
  const pushNotis = await getMyAllPushNotis()

  if (pushNotis.length !== 0) {
    mainDom.innerHTML =
      pushNotis.map(noti => {
        const { id, createdAt, serviceType, isRead, contents1, contents2, contents3, contentId } = noti

        const readStatus = isRead === false ? "안읽음" : "읽음";
        const readStatusClass = isRead === false ? "unread" : "read";

        const dateObject = new Date(createdAt);
        const formattedDate = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, "0")}-${String(dateObject.getDate()).padStart(2, "0")} ${String(dateObject.getHours()).padStart(2, "0")}:${String(dateObject.getMinutes()).padStart(2, "0")}`;

        let message
        let contentUrl
        switch (serviceType) {
          case "댓글":
            message = `[${contents2}]님이 게시글에 댓글을 남겼습니다.`
            contentUrl = `/views/post-read.html?id=${contentId}`
            break

          case "쪽지":
            message = `[${contents2}]님이 쪽지를 보냈습니다.`
            contentUrl = `/views/twit/twit-detail.html?send=false&id=${contentId}`
            break

          case "주식":
            message = `[${contents2}] 주문이 체결되었습니다.`
            contentUrl = `/views/stock-detail-my.html?code=${contents3[0]}&name=${contents3[1]}&page=1`
            break
        }

        return `
      <li class="hm-alarm" data-id="${id}">
        <a href="${contentUrl}" class="contents-url"></a>
        <div class="alarm-list-contnents">
          <div class="alarm-top">
            <h6>${serviceType}</h6>
            <button class="alarm-delete-btn">X</button>
          </div>
          <div class="alarm-body">
            <p class="alarm-message">${message}</p>
            <p class="alarm-contents">${contents1}</p>
          </div>
          <div class="alarm-footer">
            <p class=${readStatusClass}>${readStatus}</p>
            <p class="alarm-date">${formattedDate}</p>
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
  $('.alarm-delete-btn').on('click', async function () {
    const pushNoti = $(this).closest('li');
    const pushNotiId = pushNoti.attr('data-id');

    await deletePushNoti(pushNotiId, pushNoti);
  });

  // 전체 알림 삭제
  $('.delete-all-alarm').on('click', deleteAllPushNoti);

  // 전체 알림 읽음 처리
  $('.all-read-btn').on('click', updateReadStatusAllPushNoti)

  // 알림 클릭 시 읽음 처리
  $('.contents-url').on('click', async function () {
    const pushNoti = $(this).closest('li');
    const pushNotiId = pushNoti.attr('data-id');

    updateReadStatusPushNoti(pushNotiId);
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
    spreadMyAllPushNotis()
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
    spreadMyAllPushNotis()
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
    spreadMyAllPushNotis()
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
    spreadMyAllPushNotis()
  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}