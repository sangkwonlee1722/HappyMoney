import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.entity";
import { AuthGuard } from "@nestjs/passport";
import { Account } from "./entities/account.entity";
// import { JwtAuthGuard } from "src/auth/jwt.auth.guard";

@ApiBearerAuth()
@ApiTags("Accounts")
@UseGuards(AuthGuard("jwt"))
@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  /**
   * 계좌 생성하기
   * @param name
   * @returns
   */
  @Post()
  async create(@Body() { name }: CreateAccountDto, @UserInfo() user: User) {
    await this.accountsService.createNewAccount(name, user.id); // 로그인 기능 개발되면 유저 Id는 데코레이터 활용 예정
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 나의 계좌 전체 가치 가져오기
   * @param user
   * @returns
   */
  @Get()
  async getMyAccountValue(@UserInfo() user: User) {
    const account: Account = await this.accountsService.getMyAccountValue(user.id);

    return {
      success: true,
      message: "okay",
      data: account
    };
  }

  /**
   * 나의 계좌 상세 정보 가져오기
   * @param user
   * @returns
   */
  @Get("info")
  async getMyAccountInfo(@UserInfo() user: User) {
    const account: Account = await this.accountsService.getMyAccountDetailInfo(user.id);

    return {
      success: true,
      message: "okay",
      data: account
    };
  }

  /**
   * Top 10 랭킹 가져오기
   * @returns
   */
  @Get("rank")
  async getRankAccounts() {
    const topTenAccounts: Account[] = await this.accountsService.getRankAccounts();

    return {
      success: true,
      message: "okay",
      topTenAccounts
    };
  }

  /**
   * 특정 계좌 수정하기
   * @param id
   * @param name
   * @returns
   */
  @Patch(":accountId")
  async updateMyAccount(
    @Param("accountId") accountId: number,
    @Body() { name }: UpdateAccountDto,
    @UserInfo() user: User
  ) {
    await this.accountsService.updateMyAccount(accountId, user.id, name);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 나의 특정 계좌 삭제하기
   * @param accountId
   * @returns
   */
  @Delete(":accountId")
  async removeMyAccountById(@UserInfo() user: User) {
    await this.accountsService.removeMyAccountById(user.id);
    return {
      success: true,
      message: "okay"
    };
  }
}
