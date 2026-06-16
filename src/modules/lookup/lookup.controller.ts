import { Controller, Get, Param } from "@nestjs/common";
import { LookupService } from "./lookup.service";

@Controller('lookup')
export class LookupController {
  constructor(
    private readonly lookupService: LookupService,
  ) { }

  @Get('states')
  getStates() {
    return this.lookupService.getStates();
  }

  @Get('states/:stateId/cities')
  getCities(
    @Param('stateId') stateId: string,
  ) {
    return this.lookupService.getCities(
      stateId,
    );
  }

  @Get('property-types')
  getPropertyTypes() {
    return this.lookupService.getPropertyTypes();
  }

  @Get('roles')
  getRoles() {
    return this.lookupService.getRoles();
  }

  @Get('inspection-types')
  getInspectionTypes() {
    return this.lookupService.getInspectionTypes();
  }
}