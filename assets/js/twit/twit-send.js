import getToken from '/js/common.js'

const params = new URLSearchParams(window.location.search);
const receive_name = params.get("name");
$('#receiverPersonName').text(receive_name);

$('#sendTwit').on('click', function () {
  getDetailTwitData(`/api/twits`);
})

// 쪽지 조회API 
async function getDetailTwitData(url) {
  try {
    const content = document.querySelector('#sendContent').value;
    const processedText = content.replace(/\n/g, '<br>');
    const header = {
      headers: {
        'Authorization': `${getToken()}`,
        'Content-Type': 'application/json'
      },
    };
    const body = {
      receiveNickname: receive_name,
      contents: processedText
    };
    console.log(header);
    console.log(body);
    const result = await axios.post(url, body, header);
    const data = result.data;
    if (data.success === true) {
      alert(`${receive_name}님께 쪽지를 보냈습니다!`);
      window.location.href = '/views/twit/twit.html';
    } else {
      alert('상대방이 존재하지 않습니다.');
      window.location.href = '/views/twit/twit.html';
    }
  } catch (error) {
    alert(error.response.data.message);
    console.error(error);
  }
}
