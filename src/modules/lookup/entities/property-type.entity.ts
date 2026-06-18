import { Status } from "../../../common/enum/status";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('property_types')
export class PropertyType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: Status, default: Status.ACTIVE, })
  status!: Status;

}