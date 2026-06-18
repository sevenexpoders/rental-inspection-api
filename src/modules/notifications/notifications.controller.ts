import {
    Controller,
    Get,
    Patch,
    Param,
    Req,
    UseGuards,
    Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationListDto } from './dto/notification-list.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
    ) { }

    @Get()
    async findAll(@CurrentUser() user: any, @Query() dto: NotificationListDto,) {
        return await this.notificationsService.findAll(user.userId, dto);
    }

    @Get('unread-count')
    async unreadCount(@CurrentUser() user: any) {
        return await this.notificationsService.unreadCount(user.userId);
    }

    @Patch('read-all')
    async markAsRead(@CurrentUser() user: any
    ) {
        return await this.notificationsService.markAsRead(user.userId);
    }
}