// 슬랙 에러 스택 보여주고 싶을 경우, 마크다운 안에 넣어 이쁘게 보여주려고 사용
export interface SlackMrkdwnFormat {
  title: string;
  value: string;
}

// 슬랙 메세지 담을 형태
export interface SlackMessageFormat {
  color: string; // 띠 컬러
  text: string;
  fields?: SlackMrkdwnFormat[];
  footer?: string; // From API Server [production]
}

// mrkdown
export interface MrkdownMessage {
  mrkdwn: boolean;
  text: string;
  attachments: SlackMessageFormat[];
}

export const slackLineColor = {
  error: "#EB5665",
  info: "#000F5D"
};

export class SlackMessage {
  private slackMessage: SlackMessageFormat;
  constructor(color, text: string, footer: string, mrkTitle?: string, mrkValue?: string) {
    this.slackMessage = {
      color,
      text,
      fields: [
        {
          title: mrkTitle,
          value: `\`\`\`${mrkValue}\`\`\``
        }
      ],
      footer
    };
  }
}
