import { addComma } from "./common.js";
import getToken from "./common.js";

const token = getToken()

/* 나의 계좌 가져오는 함수 */
const getMyAccountsByToken = async (token) => {
  const apiUrl = '/api/accounts/info'

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    });

    const account = result.data.data

    const mainDom = document.querySelector(".accounts-list")

    if (account) {
      const { id, name, accountNumber, totalStockValue, totalOrderPrice, point } = account;

      /* 해당 통장의 총 가치 평가 */
      const baseValue = 100000000
      const ttlAccountValues = point + Number(totalStockValue) + Number(totalOrderPrice)

      const profit = ttlAccountValues - baseValue
      const formatProfit = profit > 0 ? `+${addComma(profit)}` : `${addComma(profit)}`
      const profitPercentage = ((profit / baseValue) * 100).toFixed(1)

      const formatTtlAccountValues = addComma(ttlAccountValues);

      let profitClass

      if (profit > 0) {
        profitClass = 'red'
      } else if (profit < 0) {
        profitClass = 'blue'
      }

      mainDom.innerHTML = `
      <li class="accounts" data-id="${id}">
      <a href="/views/stock-myaccount.html"></a>
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
          <span class="ttl-price">${formatTtlAccountValues} 원</span>
          <span class="calculate-price ${profitClass}">${formatProfit} 원 (${profitPercentage}%)</span>
        </div>
        <button class="hm-button hm-gray-color delete-comment-btn" onclick="drPopupOpen('.delete-account-chk')">삭제</button>
      </div>
    </li>
    <hr />
      `
    } else {
      mainDom.innerHTML = `
      <div class="none-contents">
        <span>개설한 계좌가 없습니다.</span>
      </div>
      `
    }
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
  const apiUrl = `/api/accounts/${accountId}`;

  await axios.patch(apiUrl, { name: newName }, {
    headers: {
      'Authorization': token,
    }
  });
}

/* 계좌 삭제 */
$('.delete-comment-btn').on('click', function () {
  const account = $(this).closest('li');
  const accountId = account.attr('data-id');

  $('#delete-contents').on('click', function () {
    deleteAccount(accountId);
  });
});

async function deleteAccount(accountId) {
  const apiUrl = `/api/accounts/${accountId}`;

  try {
    await axios.delete(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })

    window.location.reload()

  } catch (error) {
    console.error(error);
    const errorMessage = error.response.data.message;
    alert(errorMessage);
  }
}


/* 계좌 만들기 */
const createAccountBtn = $('#accountCreate')

createAccountBtn.on('click', async function () {
  const accountName = $('#accountName').val()

  const apiUrl = '/api/accounts'

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