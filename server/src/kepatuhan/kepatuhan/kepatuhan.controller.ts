// src/features/Dashboard/pages/RiskProfile/pages/Kepatuhan/controllers/kepatuhan.controller.ts
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
import { KepatuhanService } from './kepatuhan.service';
import { CreateKepatuhanSectionDto } from './dto/create-kepatuhan-section.dto';
import { UpdateKepatuhanSectionDto } from './dto/update-kepatuhan-section.dto';
import { CreateKepatuhanDto } from './dto/create-kepatuhan.dto';
import { UpdateKepatuhanDto } from './dto/update-kepatuhan.dto';
import { Quarter } from './entities/kepatuhan.entity';

@ApiTags('Kepatuhan')
@Controller('kepatuhan')
export class KepatuhanController {
  constructor(private readonly kepatuhanService: KepatuhanService) {}

  // ========== SECTION ENDPOINTS ==========

  @Post('sections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new kepatuhan section' })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({ status: 409, description: 'Section already exists' })
  async createSection(@Body() createDto: CreateKepatuhanSectionDto) {
    return await this.kepatuhanService.createSection(createDto);
  }

  @Get('sections')
  @ApiOperation({ summary: 'Get all kepatuhan sections' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getSections(@Query('isActive') isActive?: boolean) {
    return await this.kepatuhanService.findAllSections(isActive);
  }

  @Get('sections/:id')
  @ApiOperation({ summary: 'Get kepatuhan section by ID' })
  async getSection(@Param('id', ParseIntPipe) id: number) {
    return await this.kepatuhanService.findSectionById(id);
  }

  @Get('sections/period')
  @ApiOperation({ summary: 'Get kepatuhan sections by period' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'quarter', required: true, enum: Quarter })
  async getSectionsByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter: Quarter,
  ) {
    return await this.kepatuhanService.findSectionsByPeriod(year, quarter);
  }

  @Put('sections/:id')
  @ApiOperation({ summary: 'Update kepatuhan section' })
  async updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKepatuhanSectionDto,
  ) {
    return await this.kepatuhanService.updateSection(id, updateDto);
  }

  @Delete('sections/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete kepatuhan section' })
  async deleteSection(@Param('id', ParseIntPipe) id: number) {
    return await this.kepatuhanService.deleteSection(id);
  }

  // ========== INDIKATOR ENDPOINTS ==========

  @Post('indikators')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new kepatuhan indikator' })
  @ApiResponse({ status: 201, description: 'Indikator created successfully' })
  @ApiResponse({ status: 409, description: 'Indikator already exists' })
  async createIndikator(@Body() createDto: CreateKepatuhanDto) {
    return await this.kepatuhanService.createIndikator(createDto);
  }

  @Get('indikators')
  @ApiOperation({ summary: 'Get all kepatuhan indikators' })
  async getAllIndikators() {
    return await this.kepatuhanService.findAllIndikators();
  }

  @Get('indikators/period')
  @ApiOperation({ summary: 'Get kepatuhan indikators by period' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'quarter', required: true, enum: Quarter })
  async getIndikatorsByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter: Quarter,
  ) {
    return await this.kepatuhanService.findIndikatorsByPeriod(year, quarter);
  }

  @Get('indikators/search')
  @ApiOperation({ summary: 'Search kepatuhan indikators' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'quarter', required: false, enum: Quarter })
  async searchIndikators(
    @Query('query') query?: string,
    @Query('year') year?: number,
    @Query('quarter') quarter?: Quarter,
  ) {
    return await this.kepatuhanService.searchIndikators(query, year, quarter);
  }

  @Get('indikators/:id')
  @ApiOperation({ summary: 'Get kepatuhan indikator by ID' })
  async getIndikator(@Param('id', ParseIntPipe) id: number) {
    return await this.kepatuhanService.findIndikatorById(id);
  }

  @Put('indikators/:id')
  @ApiOperation({ summary: 'Update kepatuhan indikator' })
  async updateIndikator(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKepatuhanDto,
  ) {
    return await this.kepatuhanService.updateIndikator(id, updateDto);
  }

  @Delete('indikators/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete kepatuhan indikator' })
  async deleteIndikator(@Param('id', ParseIntPipe) id: number) {
    return await this.kepatuhanService.deleteIndikator(id);
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
    return await this.kepatuhanService.getSectionsWithIndicatorsByPeriod(
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
    const total = await this.kepatuhanService.getTotalWeightedByPeriod(
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
      const periods = await this.kepatuhanService.getPeriods();
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
      const periods = await this.kepatuhanService.getPeriods();

      const periodsWithCounts = await Promise.all(
        periods.map(async (period) => {
          const count = await this.kepatuhanService.getIndikatorCountByPeriod(
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
    const count = await this.kepatuhanService.getIndikatorCountByPeriod(
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
    return await this.kepatuhanService.duplicateIndikatorToNewPeriod(
      id,
      year,
      quarter,
    );
  }
}