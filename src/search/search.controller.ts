import { Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "./search.service";
import { Notice } from "../notice/entities/notice.entity";
import { Post } from "../post/entities/post.entity";
import { Stock } from "../stock/entities/stock.entity";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  /**
   * 통합검색
   * @returns
   */
  @Get()
  async search(@Query("keyword") keyword: string): Promise<{ notices: Notice[]; posts: Post[]; stocks: Stock[] }> {
    return this.searchService.search(keyword);
  }
}
