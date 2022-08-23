import {
  Body,
  Controller,
  Post,
  Get,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  userSignUp(@Body() dto: SignUpDto) {
    return this.authService.userSignUp(dto);
  }

  @Post('login')
  userLogin(@Body() dto: LoginDto) {
    return this.authService.userLogin(dto);
  }
}
