import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { State } from "./entities/state.entity";
import { City } from "./entities/city.entity";
import { PropertyType } from "./entities/property-type.entity";
import { Role } from "./entities/role.entity";
import { Status } from "../../common/enum/status";
import { InspectionType } from "./entities/inspection_types.entity";
import { ROLES } from "src/common/constants/roles.constant";


@Injectable()
export class LookupService {
  constructor(
    @InjectRepository(State)
    private stateRepo: Repository<State>,

    @InjectRepository(City)
    private cityRepo: Repository<City>,

    @InjectRepository(PropertyType)
    private propertyTypeRepo: Repository<PropertyType>,

    @InjectRepository(Role)
    private roleRepo: Repository<Role>,

    @InjectRepository(InspectionType)
    private inspectionTypeRepo: Repository<InspectionType>,
  ) {

  }

  async getStates() {
    return this.stateRepo.find({
      select: {
        id: true,
        name: true,
        code: true,
      },
      order: {
        name: 'ASC',
      },
    });

  }

  async getCities(stateId: string) {
    return this.cityRepo.find({
      where: {
        state: {
          id: stateId,
        },
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async getPropertyTypes() {
    return this.propertyTypeRepo.find({
      where: {
        status: Status.ACTIVE,
      },
      select: {
        id: true,
        name: true
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async getRoles() {
    return this.roleRepo.find({
      where: {
        status: Status.ACTIVE,
        name: Not(ROLES.SUPER_ADMIN),
      },
      select: {
        id: true,
        icon_name: true,
        description: true,
        display_name: true,
      },
      order: {
        order_index: 'ASC',
      },
    });
  }

  async getInspectionTypes() {
    return this.inspectionTypeRepo.find({
      where: {
        status: Status.ACTIVE,
        deleted_at: IsNull(),
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        image: true,
        input_type: true,
        order_index: true,
      },
      order: {
        order_index: 'ASC',
      },
    });
  }
}