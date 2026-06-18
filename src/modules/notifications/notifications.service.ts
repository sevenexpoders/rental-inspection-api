import {
    Injectable,
} from '@nestjs/common';
import {
    InjectRepository,
} from '@nestjs/typeorm';
import {
    Repository,
} from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationListDto } from './dto/notification-list.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,
    ) { }

    async create(
        userId: string,
        title: string,
        message: string,
        type: string,
        referenceType?: string,
    ) {
        return this.notificationRepo.save({
            user_id: userId,
            title,
            message,
            type,
            reference_type: referenceType,
        });
    }

    async findAll(userId: string, dto: NotificationListDto,) {
        const page = dto.page ?? 1;
        const limit = dto.limit ?? 20;
        const [items, total] =
            await this.notificationRepo.findAndCount({
                where: {
                    user_id: userId,
                },
                order: {
                    created_at: 'DESC',
                },
                skip: (page - 1) * limit,
                take: limit,
            });
        return {
            items,
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit,),
        };
    }

    async unreadCount(userId: string) {
        const count =
            await this.notificationRepo.count({
                where: {
                    user_id: userId,
                    is_read: false,
                },
            });

        return {
            unread_count: count,
        };
    }

    async markAsRead(userId: string,) {
        await this.notificationRepo.update(
            {
                user_id: userId,
                is_read: false
            },
            {
                is_read: true,
                read_at: new Date(),
            },
        );

        return {
            message: 'Notification marked as read',
        };
    }
}