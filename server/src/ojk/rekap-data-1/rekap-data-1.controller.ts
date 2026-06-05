// src/rekap/rekap-data1.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { RekapData1Service } from './rekap-data-1.service';
import { GetRekapData1Dto, RekapData1ResponseDto } from './dto/rekap-data-1.dto';

@ApiTags('Rekap Data 1')
@Controller('rekap1')
@UseInterceptors(ClassSerializerInterceptor)
export class RekapData1Controller {
  constructor(private readonly rekapService: RekapData1Service) {}

  @Get()
  @ApiOperation({ summary: 'Get summary data for all categories' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'quarter', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Data retrieved successfully',
    type: RekapData1ResponseDto,
  })
  async getSummaryData(
    @Query() query: GetRekapData1Dto,
  ): Promise<RekapData1ResponseDto> {
    return this.rekapService.getSummaryData(query);
  }

  @Post('recalculate/:year/:quarter')
  @ApiOperation({ summary: 'Recalculate summary for specific year/quarter' })
  @ApiParam({ name: 'year', type: Number })
  @ApiParam({ name: 'quarter', type: Number })
  async recalculateSummary(
    @Param('year', ParseIntPipe) year: number,
    @Param('quarter', ParseIntPipe) quarter: number,
  ) {
    return this.rekapService.recalculateSummary(year, quarter);
  }

  @Post('recalculate-all')
  @ApiOperation({ summary: 'Recalculate all summaries' })
  async recalculateAllSummaries() {
    return this.rekapService.recalculateAllSummaries();
  }
}
