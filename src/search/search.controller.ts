import { Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "./search.service";
import { Notice } from "../notice/entities/notice.entity";
import { Post } from "../post/entities/post.entity";
import { Stock } from "../stock/entities/stock.entity";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query("keyword") keyword: string): Promise<{ notices: Notice[]; posts: Post[]; stocks: Stock[] }> {
    return this.searchService.search(keyword);
  }
}
