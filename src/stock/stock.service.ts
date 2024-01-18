import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class StockService {
  private readonly domain = "https://openapi.koreainvestment.com:9443";
  private readonly tkPath = "/oauth2/tokenP";
  private readonly skPath = "/oauth2/Approval";
  private readonly rankPath = "/uapi/domestic-stock/v1/quotations/volume-rank";
  private token: string;
  private skToken: string;
  private tokenExpiresAt: Date;

  constructor(private readonly configService: ConfigService) {}

  // Bearer token
  async getTk() {
    // 토큰이 있고 유효기간이 남아있으면 기존 토큰 반환
    if (this.token && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return this.token;
    }

    // 토큰이 없거나, 유효기간이 만료된 경우 새로운 토큰 요청
    const data = {
      grant_type: "client_credentials",
      appkey: this.configService.get<string>("PROD_APPKEY"),
      appsecret: this.configService.get<string>("PROD_APPSECRET")
    };

    try {
      const response = await axios.post(`${this.domain}${this.tkPath}`, data, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      this.token = response.data.access_token;
      const expiresInSec = response.data.expires_in;

      // 토큰의 만료 시간 설정
      this.tokenExpiresAt = new Date(Date.now() + expiresInSec * 1000);
      return this.token;
    } catch (error) {
      console.error("Error acquiring token:", error.message);
      throw error;
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
      const response = await axios.post(`${this.domain}${this.skPath}`, data, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      this.skToken = response.data.approval_key;
      return this.skToken;
    } catch (error) {
      throw error;
    }
  }

  // 거래량 순위API
  async getStockRank() {
    if (!this.token || !this.tokenExpiresAt || new Date() > this.tokenExpiresAt) {
      await this.getTk();
    }

    const queryParams = {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_COND_SCR_DIV_CODE: "20171",
      FID_INPUT_ISCD: "0002",
      FID_DIV_CLS_CODE: "0",
      FID_BLNG_CLS_CODE: "0",
      FID_TRGT_CLS_CODE: "111111111",
      FID_TRGT_EXLS_CLS_CODE: "000000",
      FID_INPUT_PRICE_1: "0",
      FID_INPUT_PRICE_2: "0",
      FID_VOL_CNT: "0",
      FID_INPUT_DATE_1: "0"
    };

    try {
      const stockList = await axios.get(`${this.domain}${this.rankPath}`, {
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.token}`,
          appkey: this.configService.get<string>("PROD_APPKEY"),
          appsecret: this.configService.get<string>("PROD_APPSECRET"),
          tr_id: "FHPST01710000",
          custtype: "P"
        },
        params: queryParams
      });
      console.log(stockList.data);

      return stockList.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
