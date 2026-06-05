// src/features/Dashboard/pages/RiskProfile/pages/Stratejik/controllers/stratejik.controller.ts
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
import { StratejikService } from './stratejik.service';
import { CreateStratejikSectionDto } from './dto/create-stratejik-section.dto';
import { UpdateStratejikSectionDto } from './dto/update-stratejik-section.dto';
import { CreateStratejikDto } from './dto/create-stratejik.dto';
import { UpdateStratejikDto } from './dto/update-stratejik.dto';
import { Quarter } from './entities/stratejik.entity';

@ApiTags('Stratejik')
@Controller('stratejik')
export class StratejikController {
  constructor(private readonly stratejikService: StratejikService) {}

  // ========== SECTION ENDPOINTS ==========

  @Post('sections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new stratejik section' })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({ status: 409, description: 'Section already exists' })
  async createSection(@Body() createDto: CreateStratejikSectionDto) {
    return await this.stratejikService.createSection(createDto);
  }

  @Get('sections')
  @ApiOperation({ summary: 'Get all stratejik sections' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getSections(@Query('isActive') isActive?: boolean) {
    return await this.stratejikService.findAllSections(isActive);
  }

  @Get('sections/:id')
  @ApiOperation({ summary: 'Get stratejik section by ID' })
  async getSection(@Param('id', ParseIntPipe) id: number) {
    return await this.stratejikService.findSectionById(id);
  }

  @Get('sections/period')
  @ApiOperation({ summary: 'Get stratejik sections by period' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'quarter', required: true, enum: Quarter })
  async getSectionsByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter: Quarter,
  ) {
    return await this.stratejikService.findSectionsByPeriod(year, quarter);
  }

  @Put('sections/:id')
  @ApiOperation({ summary: 'Update stratejik section' })
  async updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateStratejikSectionDto,
  ) {
    return await this.stratejikService.updateSection(id, updateDto);
  }

  @Delete('sections/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete stratejik section' })
  async deleteSection(@Param('id', ParseIntPipe) id: number) {
    return await this.stratejikService.deleteSection(id);
  }

  // ========== INDIKATOR ENDPOINTS ==========

  @Post('indikators')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new stratejik indikator' })
  @ApiResponse({ status: 201, description: 'Indikator created successfully' })
  @ApiResponse({ status: 409, description: 'Indikator already exists' })
  async createIndikator(@Body() createDto: CreateStratejikDto) {
    return await this.stratejikService.createIndikator(createDto);
  }

  @Get('indikators')
  @ApiOperation({ summary: 'Get all stratejik indikators' })
  async getAllIndikators() {
    return await this.stratejikService.findAllIndikators();
  }

  @Get('indikators/period')
  @ApiOperation({ summary: 'Get stratejik indikators by period' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'quarter', required: true, enum: Quarter })
  async getIndikatorsByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter: Quarter,
  ) {
    return await this.stratejikService.findIndikatorsByPeriod(year, quarter);
  }

  @Get('indikators/search')
  @ApiOperation({ summary: 'Search stratejik indikators' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'quarter', required: false, enum: Quarter })
  async searchIndikators(
    @Query('query') query?: string,
    @Query('year') year?: number,
    @Query('quarter') quarter?: Quarter,
  ) {
    return await this.stratejikService.searchIndikators(query, year, quarter);
  }

  @Get('indikators/:id')
  @ApiOperation({ summary: 'Get stratejik indikator by ID' })
  async getIndikator(@Param('id', ParseIntPipe) id: number) {
    return await this.stratejikService.findIndikatorById(id);
  }

  @Put('indikators/:id')
  @ApiOperation({ summary: 'Update stratejik indikator' })
  async updateIndikator(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateStratejikDto,
  ) {
    return await this.stratejikService.updateIndikator(id, updateDto);
  }

  @Delete('indikators/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete stratejik indikator' })
  async deleteIndikator(@Param('id', ParseIntPipe) id: number) {
    return await this.stratejikService.deleteIndikator(id);
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
    return await this.stratejikService.getSectionsWithIndicatorsByPeriod(
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
    const total = await this.stratejikService.getTotalWeightedByPeriod(
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
      const periods = await this.stratejikService.getPeriods();
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
      const periods = await this.stratejikService.getPeriods();

      const periodsWithCounts = await Promise.all(
        periods.map(async (period) => {
          const count = await this.stratejikService.getIndikatorCountByPeriod(
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
    const count = await this.stratejikService.getIndikatorCountByPeriod(
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
    return await this.stratejikService.duplicateIndikatorToNewPeriod(
      id,
      year,
      quarter,
    );
  }
}
