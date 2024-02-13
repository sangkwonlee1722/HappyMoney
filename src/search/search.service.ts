import { Injectable } from "@nestjs/common";
import { DatabaseService } from "./database.service";

@Injectable()
export class SearchService {
  constructor(private readonly databaseService: DatabaseService) {}

  async search(keyword: string) {
    return this.databaseService.search(keyword);
  }
}
