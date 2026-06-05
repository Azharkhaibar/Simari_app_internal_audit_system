import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OjkCategoryService } from './ojk-category.service';
import { CreateOjkCategoryDto } from './dto/create-ojk-category.dto';
import { UpdateOjkCategoryDto } from './dto/update-ojk-category.dto';

@Controller('ojk-category')
export class OjkCategoryController {
  constructor(private readonly ojkCategoryService: OjkCategoryService) {}

  @Post()
  create(@Body() createOjkCategoryDto: CreateOjkCategoryDto) {
    return this.ojkCategoryService.create(createOjkCategoryDto);
  }

  @Get()
  findAll() {
    return this.ojkCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ojkCategoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOjkCategoryDto: UpdateOjkCategoryDto) {
    return this.ojkCategoryService.update(+id, updateOjkCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ojkCategoryService.remove(+id);
  }
}
