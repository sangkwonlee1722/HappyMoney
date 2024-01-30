import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import { SlackService } from "./slack/slack.service";
import { SlackMessage, slackLineColor } from "./slack/slack.config";
import { ConfigService } from "@nestjs/config";

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly slackService: SlackService,
    private readonly configService: ConfigService
  ) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).json(exception.getResponse());
    } else {
      // 슬랙으로 알림을 보내는 로직 추가
      const slackHookUrl: string = this.configService.get("SLACK_ALARM_URI_ERROR");
      const color: string = slackLineColor.error;
      const text: string = "Internal Server Error";
      const mrkTitle: string = "Error Message";
      const mrkValue: string = exception.stack || "No error message available";

      const slackMessage = new SlackMessage(color, text, mrkTitle, mrkValue);
      await this.slackService.sendScheduleNoti(slackMessage, slackHookUrl);

      // 기본 에러 응답
      response.status(500).json({
        statusCode: 500,
        success: false,
        message: "서버에 문제가 있습니다. 관리자에게 문의하세요."
      });
    }
  }
}
