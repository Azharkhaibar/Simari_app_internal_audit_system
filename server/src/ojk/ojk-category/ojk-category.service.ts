import { Injectable } from '@nestjs/common';
import { CreateOjkCategoryDto } from './dto/create-ojk-category.dto';
import { UpdateOjkCategoryDto } from './dto/update-ojk-category.dto';

@Injectable()
export class OjkCategoryService {
  create(createOjkCategoryDto: CreateOjkCategoryDto) {
    return 'This action adds a new ojkCategory';
  }

  findAll() {
    return `This action returns all ojkCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ojkCategory`;
  }

  update(id: number, updateOjkCategoryDto: UpdateOjkCategoryDto) {
    return `This action updates a #${id} ojkCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} ojkCategory`;
  }
}
