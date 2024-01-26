interface PayloadOption {
  title?: string;
  body: string;
  tag?: string;
  renotify?: boolean;
}

export class Payload {
  private payloadOption: PayloadOption;

  constructor(body: string, tag?: string, renotify: boolean = true) {
    this.payloadOption = {
      title: "HAPPY MONEY",
      body,
      tag,
      renotify
    };
  }

  getJsonPayload(): string {
    return JSON.stringify(this.payloadOption);
  }
}
