// src/features/Dashboard/pages/RiskProfile/pages/Hukum/controllers/hukum.controller.ts
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
// import { HukumService } from '../services/new-hukum.service';
// import { CreateHukumSectionDto } from '../dto/create-hukum-section.dto';
// import { UpdateHukumSectionDto } from '../dto/update-hukum-section.dto';
// import { CreateHukumDto } from '../dto/create-new-hukum.dto';
// import { UpdateHukumDto } from '../dto/update-new-hukum.dto';
// import { Quarter } from '../entities/new-hukum.entity';

import { HukumService } from './hukum.service';
import { CreateHukumSectionDto } from './dto/create-hukum-section.dto';
// import { UpdateHukumSectionDto } from './dto/update-new-hukum-section.dto';
// import { CreateHukumDto } from './dto/create-new-hukum.dto';
// import { UpdateHukumDto } from './dto/update-new-hukum.dto';
// import { Quarter } from './entities/new-hukum.entity';
import { UpdateHukumSectionDto } from './dto/update-hukum-section.dto';
import { CreateHukumDto } from './dto/create-hukum.dto';
import { UpdateHukumDto } from './dto/update-hukum.dto';
import { Quarter } from './entities/hukum.entity';
@ApiTags('Hukum')
@Controller('hukum')
export class HukumController {
  constructor(private readonly hukumService: HukumService) {}

  // ========== SECTION ENDPOINTS ==========

  @Post('sections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new hukum section' })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({ status: 409, description: 'Section already exists' })
  async createSection(@Body() createDto: CreateHukumSectionDto) {
    return await this.hukumService.createSection(createDto);
  }

  @Get('sections')
  @ApiOperation({ summary: 'Get all hukum sections' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getSections(@Query('isActive') isActive?: boolean) {
    return await this.hukumService.findAllSections(isActive);
  }

  @Get('sections/:id')
  @ApiOperation({ summary: 'Get hukum section by ID' })
  async getSection(@Param('id', ParseIntPipe) id: number) {
    return await this.hukumService.findSectionById(id);
  }

  @Get('sections/period')
  @ApiOperation({ summary: 'Get hukum sections by period' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'quarter', required: true, enum: Quarter })
  async getSectionsByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter: Quarter,
  ) {
    return await this.hukumService.findSectionsByPeriod(year, quarter);
  }

  @Put('sections/:id')
  @ApiOperation({ summary: 'Update hukum section' })
  async updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHukumSectionDto,
  ) {
    return await this.hukumService.updateSection(id, updateDto);
  }

  @Delete('sections/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete hukum section' })
  async deleteSection(@Param('id', ParseIntPipe) id: number) {
    return await this.hukumService.deleteSection(id);
  }

  // ========== INDIKATOR ENDPOINTS ==========

  @Post('indikators')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new hukum indikator' })
  @ApiResponse({ status: 201, description: 'Indikator created successfully' })
  @ApiResponse({ status: 409, description: 'Indikator already exists' })
  async createIndikator(@Body() createDto: CreateHukumDto) {
    return await this.hukumService.createIndikator(createDto);
  }

  @Get('indikators')
  @ApiOperation({ summary: 'Get all hukum indikators' })
  async getAllIndikators() {
    return await this.hukumService.findAllIndikators();
  }

  @Get('indikators/period')
  @ApiOperation({ summary: 'Get hukum indikators by period' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'quarter', required: true, enum: Quarter })
  async getIndikatorsByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter: Quarter,
  ) {
    return await this.hukumService.findIndikatorsByPeriod(year, quarter);
  }

  @Get('indikators/search')
  @ApiOperation({ summary: 'Search hukum indikators' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'quarter', required: false, enum: Quarter })
  async searchIndikators(
    @Query('query') query?: string,
    @Query('year') year?: number,
    @Query('quarter') quarter?: Quarter,
  ) {
    return await this.hukumService.searchIndikators(query, year, quarter);
  }

  @Get('indikators/:id')
  @ApiOperation({ summary: 'Get hukum indikator by ID' })
  async getIndikator(@Param('id', ParseIntPipe) id: number) {
    return await this.hukumService.findIndikatorById(id);
  }

  @Put('indikators/:id')
  @ApiOperation({ summary: 'Update hukum indikator' })
  async updateIndikator(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHukumDto,
  ) {
    return await this.hukumService.updateIndikator(id, updateDto);
  }

  @Delete('indikators/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete hukum indikator' })
  async deleteIndikator(@Param('id', ParseIntPipe) id: number) {
    return await this.hukumService.deleteIndikator(id);
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
    return await this.hukumService.getSectionsWithIndicatorsByPeriod(
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
    const total = await this.hukumService.getTotalWeightedByPeriod(
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
      const periods = await this.hukumService.getPeriods();
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
      const periods = await this.hukumService.getPeriods();

      const periodsWithCounts = await Promise.all(
        periods.map(async (period) => {
          const count = await this.hukumService.getIndikatorCountByPeriod(
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
    const count = await this.hukumService.getIndikatorCountByPeriod(
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
  // Note: Frontend juga punya fitur cloning sendiri, endpoint ini opsional
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
    return await this.hukumService.duplicateIndikatorToNewPeriod(
      id,
      year,
      quarter,
    );
  }
}
