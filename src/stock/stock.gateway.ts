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

  constructor(private readonly configService: ConfigService) {}

  handleConnection(socket: WebSocket) {}

  private async initializeWebSocketClient() {
    if (!this.wsClient) {
      try {
        const url = "ws://ops.koreainvestment.com:21000/tryitout/H0STASP0";
        this.wsClient = new WebSocket(url);
        this.wsClient.on("open", () => {});
      } catch (error) {}
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
  async getAskingPrice(@MessageBody() trKey: string) {
    await this.initializeWebSocketClient();

    try {
      if (!this.skToken || !this.tokenExpiresAt || new Date() > this.tokenExpiresAt) {
        await this.getSk();
      }

      this.trKey = trKey;
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
            tr_key: trKey
          }
        }
      };

      this.wsClient.send(JSON.stringify(jsonRequest));

      // 메시지 수신 이벤트 핸들러
      this.wsClient.on("message", (data) => {
        const messageString = data.toString(); // Buffer를 문자열로 변환
        const jsonData = this.stockhoka(messageString);
        try {
          // 클라이언트에게 JSON데이터를 전송
          this.server.emit("asking_price", jsonData);
        } catch (error) {}
      });
    } catch (error) {
      throw new error(error);
    }
  }

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
      ASKP_RSQN10: recvvalue[32],
      ASKP_RSQN9: recvvalue[31],
      ASKP_RSQN8: recvvalue[30],
      ASKP_RSQN7: recvvalue[29],
      ASKP_RSQN6: recvvalue[28],
      ASKP_RSQN5: recvvalue[27],
      ASKP_RSQN4: recvvalue[26],
      ASKP_RSQN3: recvvalue[25],
      ASKP_RSQN2: recvvalue[24],
      ASKP_RSQN1: recvvalue[23],
      BIDP1: recvvalue[13],
      BIDP2: recvvalue[14],
      BIDP3: recvvalue[15],
      BIDP4: recvvalue[16],
      BIDP5: recvvalue[17],
      BIDP6: recvvalue[18],
      BIDP7: recvvalue[19],
      BIDP8: recvvalue[20],
      BIDP9: recvvalue[21],
      BIDP10: recvvalue[22],
      BIDP_RSQN1: recvvalue[33],
      BIDP_RSQN2: recvvalue[34],
      BIDP_RSQN3: recvvalue[35],
      BIDP_RSQN4: recvvalue[36],
      BIDP_RSQN5: recvvalue[37],
      BIDP_RSQN7: recvvalue[39],
      BIDP_RSQN8: recvvalue[40],
      BIDP_RSQN6: recvvalue[38],
      BIDP_RSQN9: recvvalue[41],
      BIDP_RSQN10: recvvalue[42],
      총매도호가: {
        잔량: recvvalue[43],
        잔량_증감: recvvalue[54]
      },
      총매수호가: {
        잔량: recvvalue[44],
        잔량_증감: recvvalue[55]
      },
      시간외_총매도호가: {
        잔량: recvvalue[45],
        증감: recvvalue[56]
      },
      시간외_총매수호가: {
        잔량: recvvalue[46],
        증감: recvvalue[57]
      },
      예상_체결: {
        가격: recvvalue[47],
        체결량: recvvalue[48],
        거래량: recvvalue[49],
        체결_대비: recvvalue[50],
        부호: recvvalue[51],
        체결_전일대비율: recvvalue[52]
      },
      누적_거래량: recvvalue[53]
    };

    return JSON.stringify(result, null, 2); // JSON 문자열로 변환하여 반환
  }
}
