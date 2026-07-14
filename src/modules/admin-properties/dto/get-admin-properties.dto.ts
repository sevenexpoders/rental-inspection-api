import {
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class GetAdminPropertiesDto {

    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    propertyTypeId?: string;

    @IsOptional()
    @IsString()
    cityId?: string;

    @IsOptional()
    @IsString()
    stateId?: string;
}