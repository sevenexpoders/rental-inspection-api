import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards";
import { PropertyInvitationsService } from "./property-invitations.service";
import { CreatePropertyInvitationDto } from "./dto/create-property-invitation.dto";

@Controller('property-invitations')
export class PropertyInvitationsController {

    constructor(
        private readonly propertyInvitationsService: PropertyInvitationsService,
    ) {}

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

}