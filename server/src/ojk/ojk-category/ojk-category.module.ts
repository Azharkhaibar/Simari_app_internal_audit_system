import { Module } from '@nestjs/common';
import { OjkCategoryService } from './ojk-category.service';
import { OjkCategoryController } from './ojk-category.controller';

@Module({
  controllers: [OjkCategoryController],
  providers: [OjkCategoryService],
})
export class OjkCategoryModule {}
