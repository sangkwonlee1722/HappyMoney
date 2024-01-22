import { Test, TestingModule } from "@nestjs/testing";
import { TwitController } from "../twit.controller";
import { TwitService } from "../twit.service";

describe("TwitController", () => {
  let controller: TwitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwitController],
      providers: [TwitService]
    }).compile();

    controller = module.get<TwitController>(TwitController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
