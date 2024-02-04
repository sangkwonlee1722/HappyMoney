import { Test, TestingModule } from "@nestjs/testing";
import { StarStockController } from "../star-stock.controller";
import { StarStockService } from "../star-stock.service";

describe("StarStockController", () => {
  let controller: StarStockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StarStockController],
      providers: [StarStockService]
    }).compile();

    controller = module.get<StarStockController>(StarStockController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
