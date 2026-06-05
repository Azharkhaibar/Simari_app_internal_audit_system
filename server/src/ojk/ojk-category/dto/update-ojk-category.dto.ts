import { PartialType } from '@nestjs/swagger';
import { CreateOjkCategoryDto } from './create-ojk-category.dto';

export class UpdateOjkCategoryDto extends PartialType(CreateOjkCategoryDto) {}
