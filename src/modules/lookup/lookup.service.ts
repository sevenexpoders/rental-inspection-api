import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { State } from "./entities/state.entity";
import { City } from "./entities/city.entity";
import { PropertyType } from "./entities/property-type.entity";

@Injectable()
export class LookupService {
  constructor(
    @InjectRepository(State)
    private stateRepo: Repository<State>,

    @InjectRepository(City)
    private cityRepo: Repository<City>,

    @InjectRepository(PropertyType)
    private propertyTypeRepo: Repository<PropertyType>,
  ) {}

  async getStates() {
    return this.stateRepo.find({
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
        is_active: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }
}