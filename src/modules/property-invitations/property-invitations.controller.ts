import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards";
import { PropertyInvitationsService } from "./property-invitations.service";
import { CreatePropertyInvitationDto } from "./dto/create-property-invitation.dto";
import { AcceptPropertyInvitationDto } from "./dto/accept-property-invitation.dto";

@Controller('property-invitations')
export class PropertyInvitationsController {

    constructor(
        private readonly propertyInvitationsService: PropertyInvitationsService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @Req() req,
        @Body() dto: CreatePropertyInvitationDto,
    ) {
        return this.propertyInvitationsService.create(
            req.user,
            dto,
        );
    }

    @Get('validate/:token')
    validate(
        @Param('token') token: string,
    ) {
        return this.propertyInvitationsService.validate(token);
    }

    @UseGuards(JwtAuthGuard)
    @Post('accept')
    accept(
        @Req() req: any,
        @Body() dto: AcceptPropertyInvitationDto,
    ) {
        return this.propertyInvitationsService.accept(
            req.user,
            dto,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(
        @Req() req: any,
    ) {
        return this.propertyInvitationsService.findAll(
            req.user,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('received')
    received(
        @Req() req: any,
    ) {
        return this.propertyInvitationsService.received(
            req.user,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        return this.propertyInvitationsService.findOne(
            req.user,
            id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/cancel')
    cancel(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        return this.propertyInvitationsService.cancel(
            req.user,
            id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/resend')
    resend(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        return this.propertyInvitationsService.resend(
            req.user,
            id,
        );
    }
}