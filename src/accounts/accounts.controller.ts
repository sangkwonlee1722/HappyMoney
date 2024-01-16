import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Accounts")
@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  /**
   * 계좌 생성하기
   * @param name
   * @returns
   */
  @Post()
  async create(@Body() { name }: CreateAccountDto) {
    await this.accountsService.createNewAccount(name, 1); // 로그인 기능 개발되면 유저 Id는 데코레이터 활용 예정
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
  async findAllAccount() {
    const accounts = await this.accountsService.findAllMyAccountsById(1);
    return {
      success: true,
      message: "okay",
      data: accounts
    };
  }

  /**
   * 특정 계좌 상세 조회하기
   * @param accountId
   * @returns
   */
  @Get(":accountId")
  async findOne(@Param("accountId") accountId: number) {
    const account = await this.accountsService.findOneMyAccountById(1, accountId);

    return {
      success: true,
      message: "okay",
      data: account
    };
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(+id, updateAccountDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.accountsService.remove(+id);
  }
}
