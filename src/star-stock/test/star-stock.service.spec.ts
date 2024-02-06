import { Test, TestingModule } from "@nestjs/testing";
import { StarStockService } from "../star-stock.service";

describe("StarStockService", () => {
  let service: StarStockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StarStockService]
    }).compile();

    service = module.get<StarStockService>(StarStockService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
