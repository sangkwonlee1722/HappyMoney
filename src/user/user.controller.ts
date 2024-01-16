import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UnauthorizedException
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, loginDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorator/public.decorator";
@ApiBearerAuth()
@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 회원가입
   * @param createUserDto
   * @returns
   */
  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const { password, passwordCheck } = createUserDto;
    if (password !== passwordCheck) throw new BadRequestException("비밀번호를 확인해주세요.");
    await this.userService.createUser(createUserDto);
    return {
      success: true,
      message: "okay"
    };
  }

  /**
   * 로그인
   * @param loginDto
   * @returns
   */
  @Public()
  @Post("login")
  async login(@Body() loginDto: loginDto) {
    const { email, password } = loginDto;

    return this.userService.login(email, password);
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
