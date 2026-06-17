import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

 
  @Post('refresh')
  async refresh(@Body() dto: { refreshToken: string }) {
    return await this.authService.refresh(dto.refreshToken);
  }


  @Post('logout')
  async logout(@Body() dto: { refreshToken: string }) {
    return await this.authService.logout(dto.refreshToken,);
  }
}