// src/features/Dashboard/pages/RiskProfile/pages/Stratejik/controllers/kpmr-stratejik.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { KPMRStratejikService } from './kpmr-stratejik.service';
import {
  CreateKPMRStratejikAspectDto,
  UpdateKPMRStratejikAspectDto,
  CreateKPMRStratejikQuestionDto,
  UpdateKPMRStratejikQuestionDto,
  CreateKPMRStratejikDefinitionDto,
  UpdateKPMRStratejikDefinitionDto,
  CreateKPMRStratejikScoreDto,
  UpdateKPMRStratejikScoreDto,
} from './dto/kpmr-stratejik.dto';

@ApiTags('KPMR Stratejik')
@Controller('kpmr-stratejik')
export class KPMRStratejikController {
  constructor(private readonly kpmrStratejikService: KPMRStratejikService) {}

  @Post('aspects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new KPMR Stratejik aspect' })
  async createAspect(@Body() createDto: CreateKPMRStratejikAspectDto) {
    return await this.kpmrStratejikService.createAspect(createDto);
  }

  @Get('aspects')
  @ApiOperation({ summary: 'Get all KPMR Stratejik aspects' })
  @ApiQuery({ name: 'year', required: false })
  async getAllAspects(@Query('year', ParseIntPipe) year?: number) {
    return await this.kpmrStratejikService.findAllAspects(year);
  }

  @Get('aspects/:id')
  @ApiOperation({ summary: 'Get KPMR Stratejik aspect by ID' })
  async getAspect(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrStratejikService.findAspectById(id);
  }

  @Put('aspects/:id')
  @ApiOperation({ summary: 'Update KPMR Stratejik aspect' })
  async updateAspect(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRStratejikAspectDto,
  ) {
    return await this.kpmrStratejikService.updateAspect(id, updateDto);
  }

  @Delete('aspects/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete KPMR Stratejik aspect' })
  async deleteAspect(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrStratejikService.deleteAspect(id);
  }

  @Post('questions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new KPMR Stratejik question' })
  async createQuestion(@Body() createDto: CreateKPMRStratejikQuestionDto) {
    return await this.kpmrStratejikService.createQuestion(createDto);
  }

  @Get('questions')
  @ApiOperation({ summary: 'Get all KPMR Stratejik questions' })
  @ApiQuery({ name: 'year', required: false })
  async getAllQuestions(@Query('year', ParseIntPipe) year?: number) {
    return await this.kpmrStratejikService.findAllQuestions(year);
  }

  @Get('questions/aspect/:aspekNo')
  @ApiOperation({ summary: 'Get questions by aspect' })
  @ApiQuery({ name: 'year', required: false })
  async getQuestionsByAspect(
    @Param('aspekNo') aspekNo: string,
    @Query('year', ParseIntPipe) year?: number,
  ) {
    return await this.kpmrStratejikService.findQuestionsByAspect(aspekNo, year);
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get question by ID' })
  async getQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrStratejikService.findQuestionById(id);
  }

  @Put('questions/:id')
  @ApiOperation({ summary: 'Update KPMR Stratejik question' })
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRStratejikQuestionDto,
  ) {
    return await this.kpmrStratejikService.updateQuestion(id, updateDto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete KPMR Stratejik question' })
  async deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrStratejikService.deleteQuestion(id);
  }

  @Post('definitions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update KPMR Stratejik definition' })
  async createOrUpdateDefinition(
    @Body() createDto: CreateKPMRStratejikDefinitionDto,
  ) {
    return await this.kpmrStratejikService.createOrUpdateDefinition(createDto);
  }

  @Get('definitions')
  @ApiOperation({ summary: 'Get all KPMR Stratejik definitions' })
  async getAllDefinitions() {
    return await this.kpmrStratejikService.findAllDefinitions();
  }

  @Get('definitions/year/:year')
  @ApiOperation({ summary: 'Get definitions by year' })
  async getDefinitionsByYear(@Param('year', ParseIntPipe) year: number) {
    return await this.kpmrStratejikService.findDefinitionsByYear(year);
  }

  @Get('definitions/:id')
  @ApiOperation({ summary: 'Get definition by ID' })
  async getDefinition(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrStratejikService.findDefinitionById(id);
  }

  @Put('definitions/:id')
  @ApiOperation({ summary: 'Update definition' })
  async updateDefinition(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRStratejikDefinitionDto,
  ) {
    return await this.kpmrStratejikService.updateDefinition(id, updateDto);
  }

  @Delete('definition/:definitionId/:year')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete definition with scores' })
  async deleteDefinitionPermanent(
    @Param('definitionId', ParseIntPipe) definitionId: number,
    @Param('year', ParseIntPipe) year: number,
  ) {
    console.log('🗑️ DELETE DEFINITION REQUEST:', { definitionId, year });
    const result = await this.kpmrStratejikService.deleteDefinition(
      definitionId,
      year,
    );
    return result;
  }

  @Post('scores')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update KPMR Stratejik score' })
  async createOrUpdateScore(@Body() createDto: CreateKPMRStratejikScoreDto) {
    return await this.kpmrStratejikService.createOrUpdateScore(createDto);
  }

  @Get('scores')
  @ApiOperation({ summary: 'Get all scores' })
  async getAllScores() {
    return await this.kpmrStratejikService.findAllScores();
  }

  @Get('scores/period')
  @ApiOperation({ summary: 'Get scores by period' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'quarter', required: false })
  async getScoresByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter?: string,
  ) {
    return await this.kpmrStratejikService.findScoresByPeriod(year, quarter);
  }

  @Get('scores/definition/:definitionId')
  @ApiOperation({ summary: 'Get scores by definition' })
  async getScoresByDefinition(
    @Param('definitionId', ParseIntPipe) definitionId: number,
  ) {
    return await this.kpmrStratejikService.findScoresByDefinition(definitionId);
  }

  @Get('scores/:id')
  @ApiOperation({ summary: 'Get score by ID' })
  async getScore(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrStratejikService.findScoreById(id);
  }

  @Put('scores/:id')
  @ApiOperation({ summary: 'Update score' })
  async updateScore(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRStratejikScoreDto,
  ) {
    return await this.kpmrStratejikService.updateScore(id, updateDto);
  }

  @Delete('scores/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete score' })
  async deleteScore(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrStratejikService.deleteScore(id);
  }

  @Post('scores/target/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete score by target' })
  async deleteScoreByTarget(
    @Body() body: { definitionId: number; year: number; quarter: string },
  ) {
    return await this.kpmrStratejikService.deleteScoreByTarget(
      body.definitionId,
      body.year,
      body.quarter,
    );
  }

  @Get('full-data/:year')
  @ApiOperation({ summary: 'Get complete KPMR Stratejik data with grouping' })
  async getFullData(@Param('year', ParseIntPipe) year: number) {
    return await this.kpmrStratejikService.getKPMRFullData(year);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search KPMR Stratejik data' })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'aspekNo', required: false })
  async searchKPMR(
    @Query('year', ParseIntPipe) year?: number,
    @Query('query') query?: string,
    @Query('aspekNo') aspekNo?: string,
  ) {
    return await this.kpmrStratejikService.searchKPMR(year, query, aspekNo);
  }

  @Get('years')
  @ApiOperation({ summary: 'Get available years' })
  async getAvailableYears() {
    const years = await this.kpmrStratejikService.getAvailableYears();
    return { success: true, data: years };
  }

  @Get('periods')
  @ApiOperation({ summary: 'Get available periods' })
  async getPeriods() {
    const periods = await this.kpmrStratejikService.getPeriods();
    return { success: true, data: periods };
  }
}
