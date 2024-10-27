import { IsString, IsNumber, IsOptional, Length } from 'class-validator';

export class CreateCategorydto {
  @IsString()
  @Length(3, 100)
  readonly name: string;

  @IsNumber()
  @IsOptional()
  readonly parentId?: number;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsString()
  @IsOptional()
  readonly icon?: string;
}
