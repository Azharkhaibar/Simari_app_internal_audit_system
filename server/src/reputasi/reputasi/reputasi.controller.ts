// src/features/Dashboard/pages/RiskProfile/pages/Reputasi/controllers/reputasi.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReputasiService } from './reputasi.service';
import { CreateReputasiSectionDto } from './dto/create-reputasi-section.dto';
import { UpdateReputasiSectionDto } from './dto/update-reputasi-section.dto';
import { CreateReputasiDto } from './dto/create-reputasi.dto';
import { UpdateReputasiDto } from './dto/update-reputasi.dto';
import { Quarter } from './entities/reputasi.entity';

@ApiTags('Reputasi')
@Controller('reputasi')
export class ReputasiController {
  constructor(private readonly reputasiService: ReputasiService) {}

  // ========== SECTION ENDPOINTS ==========

  @Post('sections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new reputasi section' })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({ status: 409, description: 'Section already exists' })
  async createSection(@Body() createDto: CreateReputasiSectionDto) {
    return await this.reputasiService.createSection(createDto);
  }

  @Get('sections')
  @ApiOperation({ summary: 'Get all reputasi sections' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getSections(@Query('isActive') isActive?: boolean) {
    return await this.reputasiService.findAllSections(isActive);
  }

  @Get('sections/:id')
  @ApiOperation({ summary: 'Get reputasi section by ID' })
  async getSection(@Param('id', ParseIntPipe) id: number) {
    return await this.reputasiService.findSectionById(id);
  }

  @Get('sections/period')
  @ApiOperation({ summary: 'Get reputasi sections by period' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'quarter', required: true, enum: Quarter })
  async getSectionsByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter: Quarter,
  ) {
    return await this.reputasiService.findSectionsByPeriod(year, quarter);
  }

  @Put('sections/:id')
  @ApiOperation({ summary: 'Update reputasi section' })
  async updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateReputasiSectionDto,
  ) {
    return await this.reputasiService.updateSection(id, updateDto);
  }

  @Delete('sections/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete reputasi section' })
  async deleteSection(@Param('id', ParseIntPipe) id: number) {
    return await this.reputasiService.deleteSection(id);
  }

  // ========== INDIKATOR ENDPOINTS ==========

  @Post('indikators')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new reputasi indikator' })
  @ApiResponse({ status: 201, description: 'Indikator created successfully' })
  @ApiResponse({ status: 409, description: 'Indikator already exists' })
  async createIndikator(@Body() createDto: CreateReputasiDto) {
    return await this.reputasiService.createIndikator(createDto);
  }

  @Get('indikators')
  @ApiOperation({ summary: 'Get all reputasi indikators' })
  async getAllIndikators() {
    return await this.reputasiService.findAllIndikators();
  }

  @Get('indikators/period')
  @ApiOperation({ summary: 'Get reputasi indikators by period' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'quarter', required: true, enum: Quarter })
  async getIndikatorsByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter: Quarter,
  ) {
    return await this.reputasiService.findIndikatorsByPeriod(year, quarter);
  }

  @Get('indikators/search')
  @ApiOperation({ summary: 'Search reputasi indikators' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'quarter', required: false, enum: Quarter })
  async searchIndikators(
    @Query('query') query?: string,
    @Query('year') year?: number,
    @Query('quarter') quarter?: Quarter,
  ) {
    return await this.reputasiService.searchIndikators(query, year, quarter);
  }

  @Get('indikators/:id')
  @ApiOperation({ summary: 'Get reputasi indikator by ID' })
  async getIndikator(@Param('id', ParseIntPipe) id: number) {
    return await this.reputasiService.findIndikatorById(id);
  }

  @Put('indikators/:id')
  @ApiOperation({ summary: 'Update reputasi indikator' })
  async updateIndikator(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateReputasiDto,
  ) {
    return await this.reputasiService.updateIndikator(id, updateDto);
  }

  @Delete('indikators/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete reputasi indikator' })
  async deleteIndikator(@Param('id', ParseIntPipe) id: number) {
    return await this.reputasiService.deleteIndikator(id);
  }

  // ========== COMPLEX QUERIES ENDPOINTS ==========

  @Get('data/with-indicators')
  @ApiOperation({
    summary: 'Get sections with their indicators for a period',
    description:
      'Returns sections with nested indicators for a specific year and quarter',
  })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'quarter', required: true, enum: Quarter })
  async getSectionsWithIndicatorsByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter: Quarter,
  ) {
    return await this.reputasiService.getSectionsWithIndicatorsByPeriod(
      year,
      quarter,
    );
  }

  @Get('total-weighted')
  @ApiOperation({ summary: 'Get total weighted value by period' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'quarter', required: true, enum: Quarter })
  async getTotalWeighted(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter: Quarter,
  ) {
    const total = await this.reputasiService.getTotalWeightedByPeriod(
      year,
      quarter,
    );
    return {
      success: true,
      year,
      quarter,
      total,
    };
  }

  @Get('periods')
  @ApiOperation({
    summary: 'Get available periods',
    description: 'Get list of distinct years and quarters that have data',
  })
  async getAvailablePeriods() {
    try {
      const periods = await this.reputasiService.getPeriods();
      return {
        success: true,
        data: periods,
        count: periods.length,
      };
    } catch (error) {
      console.error('Error in getAvailablePeriods:', error);
      throw error;
    }
  }

  @Get('periods/with-counts')
  @ApiOperation({
    summary: 'Get all periods with indicator counts',
    description: 'Get periods with indicator counts for each period',
  })
  async getAllPeriodsWithCounts() {
    try {
      const periods = await this.reputasiService.getPeriods();

      const periodsWithCounts = await Promise.all(
        periods.map(async (period) => {
          const count = await this.reputasiService.getIndikatorCountByPeriod(
            period.year,
            period.quarter,
          );
          return {
            ...period,
            indicatorCount: count,
          };
        }),
      );

      return {
        success: true,
        data: periodsWithCounts,
        count: periodsWithCounts.length,
      };
    } catch (error) {
      console.error('Error in getAllPeriodsWithCounts:', error);
      throw error;
    }
  }

  @Get('indikators/count')
  @ApiOperation({ summary: 'Get indikator count by period' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'quarter', required: true, enum: Quarter })
  async getIndikatorCount(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter: Quarter,
  ) {
    const count = await this.reputasiService.getIndikatorCountByPeriod(
      year,
      quarter,
    );
    return {
      success: true,
      year,
      quarter,
      count,
    };
  }

  // ========== DUPLICATION ENDPOINT ==========
  @Post('indikators/:id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Duplicate indikator to new period',
    description: 'Copy an existing indikator to a different period',
  })
  async duplicateIndikator(
    @Param('id', ParseIntPipe) id: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter: Quarter,
  ) {
    return await this.reputasiService.duplicateIndikatorToNewPeriod(
      id,
      year,
      quarter,
    );
  }
}
