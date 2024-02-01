import axios from "axios";

import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, catchError, tap, throwError } from "rxjs";
import { ConfigService } from "@nestjs/config";
import { SlackMessage, slackLineColor } from "./slack.config";
import { SlackService } from "./slack.service";

@Injectable()
export class SlackAlarmInterceptor implements NestInterceptor {
  constructor(
    private readonly configService: ConfigService,
    private readonly slackService: SlackService
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException && error.getStatus() >= 500) {
          const slackHookUrl: string = this.configService.get("SLACK_ALARM_URI_ERROR");
          const color: string = slackLineColor.error;
          const text: string = "Internal Server Error";
          const mrkTitle: string = "Error Stack";
          const mrkValue: string = `${error.stack}`;

          const message = new SlackMessage(color, text, mrkTitle, mrkValue);

          this.slackService.sendScheduleNoti(message, slackHookUrl);
        }

        return throwError(error);
      })
    );
  }
}
