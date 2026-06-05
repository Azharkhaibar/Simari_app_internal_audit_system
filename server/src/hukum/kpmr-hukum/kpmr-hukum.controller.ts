// src/features/Dashboard/pages/RiskProfile/pages/Hukum/controllers/kpmr-hukum.controller.ts

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
import { KPMRHukumService } from './kpmr-hukum.service';
import {
  CreateKPMRHukumAspectDto,
  UpdateKPMRHukumAspectDto,
  CreateKPMRHukumQuestionDto,
  UpdateKPMRHukumQuestionDto,
  CreateKPMRHukumDefinitionDto,
  UpdateKPMRHukumDefinitionDto,
  CreateKPMRHukumScoreDto,
  UpdateKPMRHukumScoreDto,
} from './dto/kpmr-hukum.dto';

@ApiTags('KPMR Hukum')
@Controller('kpmr-hukum')
export class KPMRHukumController {
  constructor(private readonly kpmrHukumService: KPMRHukumService) {}

  // ========== ASPECT ENDPOINTS ==========
  @Post('aspects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new KPMR aspect' })
  async createAspect(@Body() createDto: CreateKPMRHukumAspectDto) {
    return await this.kpmrHukumService.createAspect(createDto);
  }

  @Get('aspects')
  @ApiOperation({ summary: 'Get all KPMR aspects' })
  @ApiQuery({ name: 'year', required: false })
  async getAllAspects(@Query('year', ParseIntPipe) year?: number) {
    return await this.kpmrHukumService.findAllAspects(year);
  }

  @Get('aspects/:id')
  @ApiOperation({ summary: 'Get KPMR aspect by ID' })
  async getAspect(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrHukumService.findAspectById(id);
  }

  @Put('aspects/:id')
  @ApiOperation({ summary: 'Update KPMR aspect' })
  async updateAspect(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRHukumAspectDto,
  ) {
    return await this.kpmrHukumService.updateAspect(id, updateDto);
  }

  @Delete('aspects/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete KPMR aspect' })
  async deleteAspect(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrHukumService.deleteAspect(id);
  }

  // ========== QUESTION ENDPOINTS ==========
  @Post('questions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new KPMR question' })
  async createQuestion(@Body() createDto: CreateKPMRHukumQuestionDto) {
    return await this.kpmrHukumService.createQuestion(createDto);
  }

  @Get('questions')
  @ApiOperation({ summary: 'Get all KPMR questions' })
  @ApiQuery({ name: 'year', required: false })
  async getAllQuestions(@Query('year', ParseIntPipe) year?: number) {
    return await this.kpmrHukumService.findAllQuestions(year);
  }

  @Get('questions/aspect/:aspekNo')
  @ApiOperation({ summary: 'Get questions by aspect' })
  @ApiQuery({ name: 'year', required: false })
  async getQuestionsByAspect(
    @Param('aspekNo') aspekNo: string,
    @Query('year', ParseIntPipe) year?: number,
  ) {
    return await this.kpmrHukumService.findQuestionsByAspect(aspekNo, year);
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get question by ID' })
  async getQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrHukumService.findQuestionById(id);
  }

  @Put('questions/:id')
  @ApiOperation({ summary: 'Update KPMR question' })
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRHukumQuestionDto,
  ) {
    return await this.kpmrHukumService.updateQuestion(id, updateDto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete KPMR question' })
  async deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrHukumService.deleteQuestion(id);
  }

  // ========== DEFINITION ENDPOINTS ==========
  @Post('definitions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update KPMR definition' })
  async createOrUpdateDefinition(
    @Body() createDto: CreateKPMRHukumDefinitionDto,
  ) {
    return await this.kpmrHukumService.createOrUpdateDefinition(createDto);
  }

  @Get('definitions')
  @ApiOperation({ summary: 'Get all KPMR definitions' })
  async getAllDefinitions() {
    return await this.kpmrHukumService.findAllDefinitions();
  }

  @Get('definitions/year/:year')
  @ApiOperation({ summary: 'Get definitions by year' })
  async getDefinitionsByYear(@Param('year', ParseIntPipe) year: number) {
    return await this.kpmrHukumService.findDefinitionsByYear(year);
  }

  @Get('definitions/:id')
  @ApiOperation({ summary: 'Get definition by ID' })
  async getDefinition(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrHukumService.findDefinitionById(id);
  }

  @Put('definitions/:id')
  @ApiOperation({ summary: 'Update definition' })
  async updateDefinition(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRHukumDefinitionDto,
  ) {
    return await this.kpmrHukumService.updateDefinition(id, updateDto);
  }

  @Delete('definition/:definitionId/:year')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete definition with scores' })
  async deleteDefinitionPermanent(
    @Param('definitionId', ParseIntPipe) definitionId: number,
    @Param('year', ParseIntPipe) year: number,
  ) {
    console.log('🗑️ DELETE DEFINITION REQUEST:', { definitionId, year });
    const result = await this.kpmrHukumService.deleteDefinition(
      definitionId,
      year,
    );
    return result;
  }

  // ========== SCORE ENDPOINTS ==========
  @Post('scores')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update KPMR score' })
  async createOrUpdateScore(@Body() createDto: CreateKPMRHukumScoreDto) {
    return await this.kpmrHukumService.createOrUpdateScore(createDto);
  }

  @Get('scores')
  @ApiOperation({ summary: 'Get all scores' })
  async getAllScores() {
    return await this.kpmrHukumService.findAllScores();
  }

  @Get('scores/period')
  @ApiOperation({ summary: 'Get scores by period' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'quarter', required: false })
  async getScoresByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter?: string,
  ) {
    return await this.kpmrHukumService.findScoresByPeriod(year, quarter);
  }

  @Get('scores/definition/:definitionId')
  @ApiOperation({ summary: 'Get scores by definition' })
  async getScoresByDefinition(
    @Param('definitionId', ParseIntPipe) definitionId: number,
  ) {
    return await this.kpmrHukumService.findScoresByDefinition(definitionId);
  }

  @Get('scores/:id')
  @ApiOperation({ summary: 'Get score by ID' })
  async getScore(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrHukumService.findScoreById(id);
  }

  @Put('scores/:id')
  @ApiOperation({ summary: 'Update score' })
  async updateScore(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRHukumScoreDto,
  ) {
    return await this.kpmrHukumService.updateScore(id, updateDto);
  }

  @Delete('scores/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete score' })
  async deleteScore(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrHukumService.deleteScore(id);
  }

  @Post('scores/target/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete score by target' })
  async deleteScoreByTarget(
    @Body() body: { definitionId: number; year: number; quarter: string },
  ) {
    return await this.kpmrHukumService.deleteScoreByTarget(
      body.definitionId,
      body.year,
      body.quarter,
    );
  }

  // ========== COMPLEX QUERIES ==========
  @Get('full-data/:year')
  @ApiOperation({ summary: 'Get complete KPMR data with grouping' })
  async getFullData(@Param('year', ParseIntPipe) year: number) {
    return await this.kpmrHukumService.getKPMRFullData(year);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search KPMR data' })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'aspekNo', required: false })
  async searchKPMR(
    @Query('year', ParseIntPipe) year?: number,
    @Query('query') query?: string,
    @Query('aspekNo') aspekNo?: string,
  ) {
    return await this.kpmrHukumService.searchKPMR(year, query, aspekNo);
  }

  @Get('years')
  @ApiOperation({ summary: 'Get available years' })
  async getAvailableYears() {
    const years = await this.kpmrHukumService.getAvailableYears();
    return { success: true, data: years };
  }

  @Get('periods')
  @ApiOperation({ summary: 'Get available periods' })
  async getPeriods() {
    const periods = await this.kpmrHukumService.getPeriods();
    return { success: true, data: periods };
  }
}
