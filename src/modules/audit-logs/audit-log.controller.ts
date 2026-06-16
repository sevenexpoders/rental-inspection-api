import { Controller, Get } from '@nestjs/common';

@Controller('audit-logs')
export class AuditLogController {

  @Get()
  findAll() {
    return 'Audit logs API';
  }
}