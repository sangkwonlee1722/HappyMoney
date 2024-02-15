import { ConfigService } from "@nestjs/config";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import axios from "axios";
// import WebSocket from "ws"; // ws 모듈 추가
// import { Server } from "http";
import { Socket, Server } from "socket.io";
import { io, Socket as ClientSocket } from "socket.io-client";
@WebSocketGateway({
  namespace: "ws/stock"
})
export class StockGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  private skToken: string;
  private tokenExpiresAt: Date;
  private wsClient: ClientSocket | null = null;
  constructor(private configService: ConfigService) {}

  afterInit(server: Server) {
    console.log("Initialized!");
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  private async initializeWebSocketClient() {
    if (!this.wsClient) {
      try {
        const url = "ws://ops.koreainvestment.com:21000/tryitout/H0STASP0";
        this.wsClient = io(url, {
          transports: ["websocket"]
        });
        this.wsClient.on("connect", () => {
          console.log("Socket.IO connected");
        });
        this.wsClient.on("connect_error", (error) => {
          console.log("Connection Error:", error);
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

  // 실시간 호가API
  @SubscribeMessage("asking_price")
  async getAskingPrice(@MessageBody() tr_key: string, @ConnectedSocket() client: Socket) {
    await this.initializeWebSocketClient();

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
          }
        }
      };
      this.wsClient.emit("message", JSON.stringify(jsonRequest));

      // 'message' 이벤트를 받습니다.
      client.on("message", (data) => {
        const messageString = data.toString();
        const jsonData = this.stockhoka(messageString);
        try {
          client.emit("asking_price", jsonData);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      });

      // 클라이언트에서 서버로 메시지를 보내고, 서버에서 해당 메시지를 받아 로그로 찍는 부분 추가
      client.on("test_message", (message) => {
        console.log("Received test_message from client:", message);
      });
    } catch (error) {
      console.log("Error in getAskingPrice:", error);
      throw error;
    }
  }

  stockhoka(data: string) {
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
      bidp_rsqn10: recvvalue[42],
      antc_cnpr: recvvalue[47]
    };

    // return JSON.stringify(result, null, 2); // JSON 문자열로 변환하여 반환
    return result;
  }
}
