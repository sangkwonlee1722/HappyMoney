import { Controller } from '@nestjs/common';
import { StarStockService } from './star-stock.service';

@Controller('star-stock')
export class StarStockController {
  constructor(private readonly starStockService: StarStockService) {}
}
