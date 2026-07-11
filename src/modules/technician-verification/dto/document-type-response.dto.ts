export class DocumentTypeResponseDto {
  id!: string;
  name!: string;
  points!: number;
  is_primary!: boolean;
  requires_name!: boolean;
  requires_photo!: boolean;
  requires_address!: boolean;
  requires_signature!: boolean;
}