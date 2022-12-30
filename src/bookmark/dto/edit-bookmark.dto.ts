import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditBookmarkDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  link?: string;
}
