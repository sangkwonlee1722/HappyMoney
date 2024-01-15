import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Accounts")
@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async create(@Body() { name }: CreateAccountDto) {
    await this.accountsService.createNewAccount(name, 1); // 로그인 기능 개발되면 유저 Id는 데코레이터 활용 예정
    return {
      success: true,
      message: "okay"
    };
  }

  @Get()
  findAll() {
    return this.accountsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.accountsService.findOne(+id);
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
