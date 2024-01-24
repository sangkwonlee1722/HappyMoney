import { addComma } from "./common.js";
import getToken from "./common.js";

const token = getToken()
const apiBaseUrl = `http://localhost:3000/api/`

/* 나의 계좌 가져오는 함수 */
const getMyAccountsByToken = async (token) => {
  const apiUrl = apiBaseUrl + 'accounts'

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    });

    const accounts = result.data.data

    const mainDom = document.querySelector(".accounts-list")

    mainDom.innerHTML = accounts
      .map(account => {
        const { id, name, point, accountNumber } = account;

        const formatPrice = addComma(point)
        // 현재 가치 확인 로직 확인 필요
        return `
        <li class="accounts" data-id="${id}">
        <a href="#none"></a>
        <div class="accounts-left">
          <div class="account-name">
            <span>${name}</span>
            <div class="modify-img">
              <img src="../images/modify-pencil.png" />
            </div>
          </div>
          <span>${accountNumber}</span>
        </div>
        <div class="accounts-right">
          <div class="account-prices">
            <span class="ttl-price">${formatPrice} 원</span>
            <span class="calculate-price">+0 (0.0%)</span>
          </div>
          <button class="hm-button hm-gray-color">삭제</button>
        </div>
      </li>
      <hr />
        `
      }).join("")

  } catch (error) {
    console.error("에러 발생:", error);
  }
}

await getMyAccountsByToken(token)


/* 계좌 이름 수정 */
const modifyBtn = $('.modify-img');
modifyBtn.on('click', modifyAccountName);

/* 연필 클릭 시 Input/저장 버튼 나오게 하는 함수 */
async function modifyAccountName() {
  const accountNameElement = $(this).closest('.account-name');
  const accountId = accountNameElement.closest('.accounts').attr('data-id');

  const accountName = accountNameElement.find('span');
  const modifyBtn = accountNameElement.find('.modify-img');

  const originalName = accountNameElement.find('span').text();

  const inputElement = $('<input >').val(originalName);
  const saveButton = $('<button class="hm-button hm-sub-color">').text('저장');

  accountName.hide();
  modifyBtn.hide();

  saveButton.on('click', async function () {
    const newName = inputElement.val();

    if (newName !== originalName) {
      try {
        await updateAccountName(newName, token, accountId);
      } catch (error) {
        const errorMessage = error.response.data.message;
        alert(errorMessage);
        return;
      }
    }
    accountNameElement.find('span').text(newName);
    inputElement.remove();
    saveButton.remove();

    accountName.show();
    modifyBtn.show();
  });

  accountNameElement.append(inputElement);
  accountNameElement.append(saveButton);
}

/* DB에 새로 입력된 계좌 이름 업데이트하는 함수 */
async function updateAccountName(newName, token, accountId) {
  const apiUrl = apiBaseUrl + `accounts/${accountId}`;

  await axios.patch(apiUrl, { name: newName }, {
    headers: {
      'Authorization': token,
    }
  });
}

/* 계좌 삭제 */
const deleteBtn = $('.accounts-right').find('button');
deleteBtn.on('click', async function () {
  const accountId = $(this).closest('.accounts').attr('data-id');
  const apiUrl = apiBaseUrl + `accounts/${accountId}`;

  try {
    await axios.delete(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })

    $(this).closest('.accounts').next('hr').remove();
    $(this).closest('.accounts').remove();

  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
})


/* 계좌 만들기 */
const createAccountBtn = $('#accountCreate')

createAccountBtn.on('click', async function () {
  const accountName = $('#accountName').val()

  const apiUrl = apiBaseUrl + 'accounts'

  try {
    await axios.post(apiUrl, { name: accountName }, {
      headers: {
        'Authorization': token,
      }
    })
    window.location.reload();
  } catch (error) {
    console.error(error)
    const errorMessage = error.response.data.message;
    alert(errorMessage);
    drPopupOpen('.hm-account-create')
  }
  $('#accountName').val('');
})