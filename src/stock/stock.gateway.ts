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

  constructor(private readonly configService: ConfigService) {}

  handleConnection(socket: WebSocket) {
    console.log(`on connect called: ${socket}`);
  }

  private async initializeWebSocketClient() {
    if (!this.wsClient) {
      try {
        // const url = "ws://ops.koreainvestment.com:21000/tryitout/H0STASP0";
        const url = "ws://ops.koreainvestment.com:31000/tryitout/H0STASP0";
        this.wsClient = new WebSocket(url);
        this.wsClient.on("open", () => {
          console.log("WebSocket connected");
        });
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
      // const skUrl = "https://openapi.koreainvestment.com:9443/oauth2/Approval";
      const skUrl = "https://openapivts.koreainvestment.com:29443/oauth2/Approval";
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

  // 실시간 호가API
  @SubscribeMessage("asking_price")
  async getAskingPrice(@MessageBody() tr_key: string) {
    await this.initializeWebSocketClient();
    console.log(tr_key);
    // asking_price 이벤트 발생
    try {
      if (!this.skToken || !this.tokenExpiresAt || new Date() > this.tokenExpiresAt) {
        await this.getSk();
      }

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
            tr_key: tr_key
            // tr_key: "005930"
          }
        }
      };
      console.log("jsonRequest", jsonRequest);
      this.wsClient.send(JSON.stringify(jsonRequest));

      // 메시지 수신 이벤트 핸들러
      this.wsClient.on("message", (data) => {
        const messageString = data.toString(); // Buffer를 문자열로 변환
        console.log("Received asking_price:", messageString);
        try {
          this.server.emit("asking_price", messageString);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      });

      // 클라이언트에서 서버로 메시지를 보내고, 서버에서 해당 메시지를 받아 로그로 찍는 부분 추가
      this.wsClient.on("test_message", (message) => {
        console.log("Received test_message from client:", message);
      });
    } catch (error) {
      console.log("Error in getAskingPrice:", error);
      throw new error(error);
    }
  }
}
