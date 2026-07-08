import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@Controller('invitations')
export class InvitationsController {
    constructor(
        private readonly invitationsService: InvitationsService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('allowed-roles')
    getAllowedRoles(@Req() req: any) {
        return this.invitationsService.getAllowedRoles(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @Req() req: any,
        @Body() dto: CreateInvitationDto,
    ) {
        return this.invitationsService.create(req.user, dto);
    }

    // Public API
    @Get('validate/:token')
    validate(@Param('token') token: string) {
        return this.invitationsService.validate(token);
    }

    @Post('accept')
    accept(
        @Body() dto: AcceptInvitationDto,
    ) {
        return this.invitationsService.accept(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(
        @Req() req: any,
    ) {
        return this.invitationsService.findAll(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/cancel')
    cancel(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        return this.invitationsService.cancel(req.user, id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/resend')
    resend(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        return this.invitationsService.resend(req.user, id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        return this.invitationsService.findOne(req.user, id);
    }
}