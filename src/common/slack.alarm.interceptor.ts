import axios from "axios";

import { CallHandler, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class SlackAlarmInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log("this is pre custom interceptor");

    return next.handle().pipe(tap(() => console.log(`this is post custom route interceptor`)));
  }
}
