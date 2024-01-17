import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserInfo } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.entity";
import { JwtAuthGuard } from "src/auth/jwt.auth.guard";

@ApiBearerAuth()
@ApiTags("Accounts")
@UseGuards(JwtAuthGuard)
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
   * 나의 모든 계좌 조회하기
   * @returns
   */
  @Get()
  async findAllAccount(@UserInfo() user: User) {
    const accounts = await this.accountsService.findAllMyAccountsById(user.id);
    return {
      success: true,
      message: "okay",
      data: accounts
    };
  }

  /**
   * 나의 특정 계좌 조회하기
   * @param accountId
   * @param user
   * @returns
   */
  @Get(":accountId")
  async findOne(@Param("accountId") accountId: number, @UserInfo() user: User) {
    const account = await this.accountsService.findOneMyAccountById(user.id, accountId);

    return {
      success: true,
      message: "okay",
      data: account
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
  async removeMyAccountById(@Param("accountId") accountId: number, @UserInfo() user: User) {
    await this.accountsService.removeMyAccountById(accountId, user.id);
    return {
      success: true,
      message: "okay"
    };
  }
}
