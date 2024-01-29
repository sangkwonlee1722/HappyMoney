import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, catchError, tap } from "rxjs";
import { SlackService } from "./slack.service";
import { SlackMessage, slackLineColor } from "./slack.config";

@Injectable()
export class SlackScheduleAlarmInterceptor implements NestInterceptor {
  constructor(private readonly slackService: SlackService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const fileName = request.originalUrl;

    return next.handle().pipe(
      tap(() => {
        const color: string = slackLineColor.info;
        const title = "스케쥴 API 호출 알림";
        const text = "스케쥴 API가 정상 작동되었습니다.";
        const footer = `From API Server [${fileName}]`;

        const message = new SlackMessage(color, title, text, footer);
        console.log("message: ", message);

        // this.slackService.sendScheduleNoti(message);
      }),
      catchError((error) => {
        throw error;
      })
    );
  }
}
