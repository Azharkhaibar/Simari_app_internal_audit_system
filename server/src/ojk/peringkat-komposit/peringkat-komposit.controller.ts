// peringkat-komposit.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PeringkatKompositService } from './peringkat-komposit.service';
import {
  PeringkatKompositQueryDto,
  PeringkatKompositItemDto,
} from './dto/peringkat-komposit.dto';

@ApiTags('Peringkat Komposit OJK')
@Controller('peringkat-komposit')
export class PeringkatKompositController {
  constructor(private readonly service: PeringkatKompositService) {}

  @Get()
  @ApiOperation({ summary: 'Get peringkat komposit semua module' })
  @ApiResponse({
    status: 200,
    description: 'Array peringkat komposit per kategori',
    type: [PeringkatKompositItemDto],
  })
  async getPeringkatKomposit(
    @Query() query: PeringkatKompositQueryDto,
  ): Promise<PeringkatKompositItemDto[]> {
    return this.service.getPeringkatKomposit(query);
  }
}
