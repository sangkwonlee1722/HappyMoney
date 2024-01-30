import { ConfigService } from "@nestjs/config";
import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import axios from "axios";
import WebSocket from "ws"; // ws 모듈 추가
import { Server } from "http";
@WebSocketGateway({
  namespace: "ws/stock"
})
export class StockGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  private skToken: string;
  private tokenExpiresAt: Date;
  private wsClient: WebSocket | null = null;
  private trKey: string;

  constructor(private readonly configService: ConfigService) {
    this.initializeWebSocketClient(() => {});
  }

  handleConnection(socket: WebSocket) {}

  private async initializeWebSocketClient(callback) {
    // 기존 연결이 있으면 닫고 초기화
    console.log("wsClient1", this.wsClient);
    if (this.wsClient) {
      this.wsClient.close();
      // this.wsClient = null;
      this.wsClient.onclose = () => {
        console.log("연결이 끊겼습니다.");
        try {
          const url = "ws://ops.koreainvestment.com:21000/tryitout/H0STASP0";
          this.wsClient = new WebSocket(url);
          callback();
          // this.wsClient.on("message", (data) => {
          //    console.log("data", data);
          // });
          // this.wsClient.onmessage = function (evt) {
          //   console.log("evt", evt);
          //   console.log("testtest");
          // };
        } catch (error) {
          console.log(error);
        }
      };
    } else {
      try {
        const url = "ws://ops.koreainvestment.com:21000/tryitout/H0STASP0";
        this.wsClient = new WebSocket(url);
        callback();
        // this.wsClient.on("message", (data) => {
        //    console.log("data", data);
        // });
        // this.wsClient.onmessage = function (evt) {
        //   console.log("evt", evt);
        //   console.log("testtest");
        // };
      } catch (error) {
        console.log(error);
      }
    }
  }

  // WebSocket token
  async getSk() {
    // 토큰이 있고 유효기간이 남아있으면 기존 토큰 반환
    if (this.skToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return this.skToken;
    }
    // 토큰이 없거나, 유효기간이 만료된 경우 새로운 토큰 요청
    const data = {
      grant_type: "client_credentials",
      appkey: this.configService.get<string>("PROD_APPKEY"),
      secretkey: this.configService.get<string>("PROD_APPSECRET")
    };
    try {
      const skUrl = "https://openapi.koreainvestment.com:9443/oauth2/Approval";
      const response = await axios.post(`${skUrl}`, data, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      this.skToken = response.data.approval_key;
      this.tokenExpiresAt = new Date(Date.now() + 86400 * 1000);
      return this.skToken;
    } catch (error) {
      throw error;
    }
  }

  // 클라이언트에서 tr_key를 서버로 보낼 때 호출되는 메서드
  @SubscribeMessage("asking_price")
  handleTrKeyFromClient(@MessageBody() trKey: string) {
    this.trKey = trKey;
  }

  // 실시간 호가API
  @SubscribeMessage("asking_price")
  async getAskingPrice() {
    this.initializeWebSocketClient(this.test);
  }

  test = async () => {
    // console.log("wsClient3", this.wsClient);
    try {
      if (!this.skToken || !this.tokenExpiresAt || new Date() > this.tokenExpiresAt) {
        await this.getSk();
      }

      console.log(this.trKey);
      const jsonRequest = {
        header: {
          approval_key: `${this.skToken}`,
          custtype: "P",
          tr_type: "1",
          "content-type": "utf-8"
        },
        body: {
          input: {
            tr_id: "H0STASP0",
            tr_key: this.trKey
          }
        }
      };
      await this.wsClient.send(JSON.stringify(jsonRequest));

      // 메시지 수신 이벤트 핸들러
      this.wsClient.on("message", (data) => {
        const messageString = data.toString(); // Buffer를 문자열로 변환
        const jsonData = this.stockhoka(messageString);
        try {
          // 클라이언트에게 JSON데이터를 전송
          // console.log(this.trKey);
          this.server.emit("asking_price", jsonData);
        } catch (error) {}
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  stockhoka(data: string): string {
    const recvvalue = data.split("^");

    const result = {
      mksc_shrn_iscd: recvvalue[0],
      bsop_hour: recvvalue[1],
      hour_cls_code: recvvalue[2],
      askp10: recvvalue[12],
      askp9: recvvalue[11],
      askp8: recvvalue[10],
      askp7: recvvalue[9],
      askp6: recvvalue[8],
      askp5: recvvalue[7],
      askp4: recvvalue[6],
      askp3: recvvalue[5],
      askp2: recvvalue[4],
      askp1: recvvalue[3],
      askp_rsqn10: recvvalue[32],
      askp_rsqn9: recvvalue[31],
      askp_rsqn8: recvvalue[30],
      askp_rsqn7: recvvalue[29],
      askp_rsqn6: recvvalue[28],
      askp_rsqn5: recvvalue[27],
      askp_rsqn4: recvvalue[26],
      askp_rsqn3: recvvalue[25],
      askp_rsqn2: recvvalue[24],
      askp_rsqn1: recvvalue[23],
      bidp1: recvvalue[13],
      bidp2: recvvalue[14],
      bidp3: recvvalue[15],
      bidp4: recvvalue[16],
      bidp5: recvvalue[17],
      bidp6: recvvalue[18],
      bidp7: recvvalue[19],
      bidp8: recvvalue[20],
      bidp9: recvvalue[21],
      bidp10: recvvalue[22],
      bidp_rsqn1: recvvalue[33],
      bidp_rsqn2: recvvalue[34],
      bidp_rsqn3: recvvalue[35],
      bidp_rsqn4: recvvalue[36],
      bidp_rsqn5: recvvalue[37],
      bidp_rsqn7: recvvalue[39],
      bidp_rsqn8: recvvalue[40],
      bidp_rsqn6: recvvalue[38],
      bidp_rsqn9: recvvalue[41],
      bidp_rsqn10: recvvalue[42]
      // 총매도호가: {
      //   잔량: recvvalue[43],
      //   잔량_증감: recvvalue[54]
      // },
      // 총매수호가: {
      //   잔량: recvvalue[44],
      //   잔량_증감: recvvalue[55]
      // },
      // 시간외_총매도호가: {
      //   잔량: recvvalue[45],
      //   증감: recvvalue[56]
      // },
      // 시간외_총매수호가: {
      //   잔량: recvvalue[46],
      //   증감: recvvalue[57]
      // },
      // 예상_체결: {
      //   가격: recvvalue[47],
      //   체결량: recvvalue[48],
      //   거래량: recvvalue[49],
      //   체결_대비: recvvalue[50],
      //   부호: recvvalue[51],
      //   체결_전일대비율: recvvalue[52]
      // },
      // 누적_거래량: recvvalue[53]
    };

    return JSON.stringify(result, null, 2); // JSON 문자열로 변환하여 반환
  }
}
