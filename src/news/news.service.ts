import { Injectable } from "@nestjs/common";
import { CreateNewsDto } from "./dto/create-news.dto";
import { UpdateNewsDto } from "./dto/update-news.dto";
import { launch } from "puppeteer";
import { InjectRepository } from "@nestjs/typeorm";
import { News } from "./entities/news.entity";
import { Repository } from "typeorm";
import { load } from "cheerio";

@Injectable()
export class NewsService {
  private readonly newsUrl: string = "https://www.google.com/finance/?hl=ko&gl=KR&source=news";
  private readonly selector: string =
    "#yDmH0d > c-wiz.zQTmif.SSPGKf.ccEnac > div > div.e1AOyf > div > div.ylTiXc > div.fAThCb > c-wiz:nth-child(2) > section > div:nth-child(2) > div > div:nth-child(2)";
  constructor(
    @InjectRepository(News)
    private readonly postRepository: Repository<News>
  ) {}

  async crawlGoogleTitle() {
    // 브라우저 열기
    const browser = await launch({ headless: false });

    // 새 페이지 생성
    const page = await browser.newPage();

    // 페이지 이동
    await page.goto(this.newsUrl);

    const content = await page.content();

    // 브라우저 닫기
    await page.close();
    await browser.close();

    const $ = load(content);
    const news = $('.yY3Lee');
    const result = [];
    news.each((index, element) => {
      const newspaper = $(element).attr("data-article-source-name");
      const title = $(element).text();
      result.push({
        newspaper,
        title
      });
    });

    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} news`;
  }

  update(id: number, updateNewsDto: UpdateNewsDto) {
    return `This action updates a #${id} news`;
  }

  remove(id: number) {
    return `This action removes a #${id} news`;
  }
}
