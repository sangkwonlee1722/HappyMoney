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

export const slackLineColor = {
  error: "#EB5665",
  info: "#000F5D"
};

export class SlackMessage {
  constructor(color: string, text: string, mrkTitle: string, mrkValue: string) {
    this.color = color;
    this.text = text;
    this.fields = [
      {
        title: mrkTitle,
        value: `\`\`\`${mrkValue}\`\`\``
      }
    ];
    this.footer = "Happy Money";
  }

  color: string;
  text: string;
  fields: SlackMrkdwnFormat[];
  footer: string;
}
