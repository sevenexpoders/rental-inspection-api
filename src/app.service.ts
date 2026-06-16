import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcomeMessage(): string {
    return 'Welcome To Rental Inspection API';
  }
}
