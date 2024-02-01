import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import { Stock } from "./entities/stock.entity";
import { Repository, getConnection } from "typeorm";
import { Cron } from "@nestjs/schedule";
import webpush from "web-push";
import { SlackService } from "src/common/slack/slack.service";
import { SlackMessage, slackLineColor } from "src/common/slack/slack.config";

@Injectable()
export class StockService {
  private readonly domain: string = "https://openapi.koreainvestment.com:9443";
  private readonly tkPath: string = "/oauth2/tokenP";
  private readonly skPath: string = "/oauth2/Approval";
  private readonly rankPath: string = "/uapi/domestic-stock/v1/quotations/volume-rank";
  private readonly pricePath: string = "/uapi/domestic-stock/v1/quotations/inquire-asking-price-exp-ccn";
  private readonly publicBaseUrl: string = "https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService";
  private readonly publicGetStocksApi: string = "/getStockPriceInfo";
  private token: string;
  private skToken: string;
  private tokenExpiresAt: Date;

  constructor(
    private readonly configService: ConfigService,
    private readonly slackService: SlackService,

    @InjectRepository(Stock)
    private readonly stocksRepository: Repository<Stock>
  ) {}

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

  // 주식현재가 호가API
  async getStockPrice(code: string) {
    if (!this.token || !this.tokenExpiresAt || new Date() > this.tokenExpiresAt) {
      await this.getTk();
    }

    const queryParams = {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: code
    };

    try {
      const stockPrice = await axios.get(`${this.domain}${this.pricePath}`, {
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.token}`,
          appkey: this.configService.get<string>("PROD_APPKEY"),
          appsecret: this.configService.get<string>("PROD_APPSECRET"),
          tr_id: "FHKST01010200"
        },
        params: queryParams
      });
      // console.log(stockPrice.data);

      return stockPrice.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // 주식 전체 목록 API 불러오기 (공공 데이터)
  async getStocksFromPublicApi() {
    const queryParams = {
      serviceKey: this.configService.get<string>("PUBLIC_ACCESS_KEY"),
      resultType: "json",
      beginBasDt: new Date(),
      numOfRows: 3000 // 전체 데이터를 어떻게 가져와야하나..?
    };

    try {
      const stockList = await axios.get(`${this.publicBaseUrl}${this.publicGetStocksApi}`, {
        params: queryParams
      });

      const data = stockList.data.response.body.items;

      const stocks: Stock[] = data.item.map((stock: Stock) => {
        return {
          srtnCd: stock.srtnCd,
          itmsNm: stock.itmsNm,
          mrktCtg: stock.mrktCtg,
          mrktTotAmt: stock.mrktTotAmt,
          lstgStCnt: stock.lstgStCnt
        };
      });

      return stocks;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({
        success: false,
        message: "공공 데이터 API 호출에 실패하였습니다."
      });
    }
  }

  @Cron("0 0 11 * * 1-5") // 공공데이터 업데이트 시간 확인 (월-금 오전 11시 1회 업데이트)
  async saveStocks() {
    console.log("스톡정보를 업데이트 합니다.");
    let start = new Date();

    const stocksList: Stock[] = await this.getStocksFromPublicApi();

    await this.stocksRepository
      .createQueryBuilder()
      .insert()
      .into(Stock)
      .values(stocksList)
      .orUpdate(["srtn_cd", "itms_nm", "mrkt_ctg", "mrkt_tot_amt", "lstg_st_cnt"], "srtn_cd", {
        skipUpdateIfNoValuesChanged: true,
        upsertType: "on-conflict-do-update"
      })
      .execute();

    let end = new Date();
    const time = end.getTime() - start.getTime();

    // 슬랙으로 알림 보내기
    const slackHookUrl: string = this.configService.get("SLACK_ALARM_URI_SCHEDULE");
    const color: string = slackLineColor.info;
    const text: string = "Stock Update Schedule";
    const mrkTitle: string = "주식 정보 업데이트 성공";
    const mrkValue: string = `업데이트 걸린 시간: ${time}`;

    const message = new SlackMessage(color, text, mrkTitle, mrkValue);

    this.slackService.sendScheduleNoti(message, slackHookUrl);

    console.log("걸린 시간 : ", time);
  }

  async findStocksByKeyword(keyword: string): Promise<Stock[]> {
    const stocks: Stock[] = await this.stocksRepository
      .createQueryBuilder("s")
      .where("s.itms_nm LIKE :keyword OR s.srtn_cd = :exactKeyword", { keyword: `%${keyword}%`, exactKeyword: keyword })
      .addOrderBy("CAST(s.mrkt_tot_amt AS SIGNED)", "DESC")
      .getMany();

    return stocks;
  }

  async generateKeys() {
    const keys = webpush.generateVAPIDKeys();
    console.log(keys);
  }
}
