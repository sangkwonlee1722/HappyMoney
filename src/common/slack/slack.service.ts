import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { SlackMessage } from "./slack.config";

@Injectable()
export class SlackService {
  constructor(private readonly configService: ConfigService) {}

  // 스케쥴에 대한 알림을 받는 함수
  async sendScheduleNoti(slackMessage: SlackMessage, url: string): Promise<void> {
    try {
      await axios.post(url, slackMessage);
    } catch (error) {
      console.error("스케쥴 알림 전송 중 오류가 발생했습니다:", error);
    }
  }
}
