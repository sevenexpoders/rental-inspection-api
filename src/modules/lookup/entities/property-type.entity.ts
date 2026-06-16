import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('property_types')
export class PropertyType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({
    default: true,
  })
  is_active!: boolean;
}