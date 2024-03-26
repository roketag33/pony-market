import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateCategorydto {
  @IsString()
  @Length(3, 100)
  readonly name: string;

  @IsNumber()
  @IsOptional()
  readonly parentId?: number;
}
