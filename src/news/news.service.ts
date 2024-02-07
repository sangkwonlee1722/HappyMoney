import { Injectable } from "@nestjs/common";
import { CreateNewsDto } from "./dto/create-news.dto";
import { UpdateNewsDto } from "./dto/update-news.dto";
import { launch } from "puppeteer";
import { InjectRepository } from "@nestjs/typeorm";
import { News } from "./entities/news.entity";
import { Repository } from "typeorm";
import { load } from "cheerio";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class NewsService {
  private readonly newsUrl: string = "https://www.google.com/finance/?hl=ko&gl=KR&source=news";
  private readonly newsSelector: string = "div[data-tab-id = localMarketNews]";
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>
  ) {}

  async crawlNews() {
    // 브라우저 열기
    const browser = await launch({ headless: false });

    // 새 페이지 생성
    const page = await browser.newPage();

    // 페이지 이동 후 원하는 기사 출력
    await page.goto(this.newsUrl);
    await page.waitForSelector(this.newsSelector);
    await page.click(this.newsSelector);
    await page.waitForSelector("div[class = Yfwt5]");
    const content = await page.content();

    // 브라우저 닫기
    await page.close();
    await browser.close();

    const $ = load(content);
    const news = $(".yY3Lee");
    const result = [];
    news.each((i, element) => {
      const $data = load(element);
      const newspaper = $(element).attr("data-article-source-name");
      const link = $data("a").attr("href");
      const title = $data(".Yfwt5").text();
      result.push({
        newspaper,
        title,
        link
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

  @Cron("0 30 * * * *") //매 시각의 30분마다 갱신
  async saveCrawledNews() {
    console.log("뉴스 크롤링 시작");
    let start = new Date();

    const newsList = await this.crawlNews();
    for (const newsItem of newsList) {
      await this.newsRepository
        .createQueryBuilder()
        .insert()
        .into(News)
        .values(newsItem)

        .execute();
    }

    let end = new Date();
    const time = end.getTime() - start.getTime();
    console.log("걸린 시간 : ", time);
    console.log("뉴스 크롤링 완료");
  }
}
