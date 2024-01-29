interface PayloadOption {
  title?: string;
  body: string;
  tag?: string;
  renotify?: boolean;
  data: Object;
}

export class Payload {
  private payloadOption: PayloadOption;

  constructor(body: string, url: string, renotify: boolean = true, tag?: string) {
    this.payloadOption = {
      title: "HAPPY MONEY",
      body,
      tag,
      renotify,
      data: {
        url
      }
    };
  }

  getJsonPayload(): string {
    return JSON.stringify(this.payloadOption);
  }
}
