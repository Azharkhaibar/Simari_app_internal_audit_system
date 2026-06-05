// rekap-data.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RekapDataService } from './rekap-data-2.service';
import { RekapDataQueryDto, CategorySummaryDto } from './dto/rekap-data-2.dto';

@ApiTags('Rekap Data OJK')
@Controller('rekap-data-2')
export class RekapDataController {
  constructor(private readonly rekapDataService: RekapDataService) {}

  @Get()
  @ApiOperation({ summary: 'Get rekap data semua module' })
  @ApiResponse({
    status: 200,
    description: 'Array summary per kategori',
    type: [CategorySummaryDto], // <-- Array langsung
  })
  async getRekapData(
    @Query() query: RekapDataQueryDto,
  ): Promise<CategorySummaryDto[]> {
    return this.rekapDataService.getRekapData(query);
  }
}
