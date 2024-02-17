import { Controller, Get, Query } from "@nestjs/common";
import { NewsService } from "./news.service";
import { ApiTags } from "@nestjs/swagger";
import { PaginatePostDto } from "src/common/dto/paginate.dto";

@ApiTags("News")
@Controller("news")
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /**
   * 뉴스 조회 페이지네이션
   * @params ?page=페이지
   * @returns
   */
  @Get()
  async findAll(@Query() query: PaginatePostDto) {
    let { page } = query;
    if (page === null) {
      page = 1;
    }
    const { news, count } = await this.newsService.findAll(query);
    return {
      success: true,
      message: "okay",
      list: news,
      total: count
    };
  }
}
