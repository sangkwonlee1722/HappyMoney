import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { SlackMessage, SlackMessageFormat } from "./slack.config";

@Injectable()
export class SlackService {
  constructor(private readonly configService: ConfigService) {}

  // 스케쥴에 대한 알림을 받는 함수
  async sendScheduleNoti(slackMessage): Promise<void> {
    const scheduleWebhookUrl: string = this.configService.get("SLACK_ALARM_URI_SCHEDULE");
    try {
      await axios.post(scheduleWebhookUrl, slackMessage);
      console.log("스케쥴 알림이 성공적으로 전송되었습니다.");
    } catch (error) {
      console.error("스케쥴 알림 전송 중 오류가 발생했습니다:", error);
    }
  }
}
