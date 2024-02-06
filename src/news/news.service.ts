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
    // 타이틀 가져오기
    const pageContent = await page.content();
    // $에 cheerio를 로드한다.
    const $ = load(pageContent);
    // 복사한 리스트의 Selector로 리스트를 모두 가져온다.
    const lists = $("#yDmH0d > c-wiz.zQTmif.SSPGKf.ccEnac > div > div.e1AOyf > div > div > div.fAThCb > c-wiz:nth-child(4) > section > div:nth-child(2) > div");
    let resultList = [];
    // 모든 리스트를 순환한다.
    for (const list of lists) {
      // 각 리스트의 하위 노드중 호텔 이름에 해당하는 요소를 Selector로 가져와 텍스트값을 가져온다.
      const name = $(list).find("div:nth-child(2) > div > div.z4rs2b > a > div > div.nkXTJ.W8knGc > div.sfyJob").text();
      // 인덱스와 함께 로그를 찍는다.#yDmH0d > c-wiz.zQTmif.SSPGKf.ccEnac > div > div.e1AOyf > div > div > div.fAThCb > c-wiz:nth-child(4) > section > div:nth-child(2) > div > div:nth-child(2) > div > div.z4rs2b > a > div > div.Yfwt5
      console.log({
        name
      });
      resultList.push({
        name
      });
    };

    // 브라우저 닫기
    await browser.close();

    return resultList;
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
