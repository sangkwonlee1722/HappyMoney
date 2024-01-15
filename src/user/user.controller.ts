import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Public } from "src/common/decorator/public.decorator";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
@ApiBearerAuth()
@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**

회원가입
@returns
*/
  @Public()
  @Post()
  create(@Body() { email, password, passwordCheck, name, nickName, phone, signupType }: CreateUserDto) {
    if (password !== passwordCheck) throw new BadRequestException("비밀번호를 확인해주세요.");
    return this.userService.createUser(email, password, name, nickName, phone, signupType);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
