import { Body, Controller, Post } from '@nestjs/common';
import { RefreshService } from './refresh.service';
import { RefreshTokenDto } from './refresh.dto';

@Controller('auth')
export class RefreshController {
  constructor(private readonly refreshService: RefreshService) {}

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshService.refreshToken(dto.token);
  }
}