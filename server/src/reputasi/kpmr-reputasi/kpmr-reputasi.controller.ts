// src/features/Dashboard/pages/RiskProfile/pages/Reputasi/controllers/kpmr-reputasi.controller.ts
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
import { KPMRReputasiService } from './kpmr-reputasi.service';
import {
  CreateKPMRReputasiAspectDto,
  UpdateKPMRReputasiAspectDto,
  CreateKPMRReputasiQuestionDto,
  UpdateKPMRReputasiQuestionDto,
  CreateKPMRReputasiDefinitionDto,
  UpdateKPMRReputasiDefinitionDto,
  CreateKPMRReputasiScoreDto,
  UpdateKPMRReputasiScoreDto,
} from './dto/kpmr-reputasi.dto';

@ApiTags('KPMR Reputasi')
@Controller('kpmr-reputasi')
export class KPMRReputasiController {
  constructor(private readonly kpmrReputasiService: KPMRReputasiService) {}

  @Post('aspects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new KPMR Reputasi aspect' })
  async createAspect(@Body() createDto: CreateKPMRReputasiAspectDto) {
    return await this.kpmrReputasiService.createAspect(createDto);
  }

  @Get('aspects')
  @ApiOperation({ summary: 'Get all KPMR Reputasi aspects' })
  @ApiQuery({ name: 'year', required: false })
  async getAllAspects(@Query('year', ParseIntPipe) year?: number) {
    return await this.kpmrReputasiService.findAllAspects(year);
  }

  @Get('aspects/:id')
  @ApiOperation({ summary: 'Get KPMR Reputasi aspect by ID' })
  async getAspect(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrReputasiService.findAspectById(id);
  }

  @Put('aspects/:id')
  @ApiOperation({ summary: 'Update KPMR Reputasi aspect' })
  async updateAspect(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRReputasiAspectDto,
  ) {
    return await this.kpmrReputasiService.updateAspect(id, updateDto);
  }

  @Delete('aspects/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete KPMR Reputasi aspect' })
  async deleteAspect(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrReputasiService.deleteAspect(id);
  }

  @Post('questions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new KPMR Reputasi question' })
  async createQuestion(@Body() createDto: CreateKPMRReputasiQuestionDto) {
    return await this.kpmrReputasiService.createQuestion(createDto);
  }

  @Get('questions')
  @ApiOperation({ summary: 'Get all KPMR Reputasi questions' })
  @ApiQuery({ name: 'year', required: false })
  async getAllQuestions(@Query('year', ParseIntPipe) year?: number) {
    return await this.kpmrReputasiService.findAllQuestions(year);
  }

  @Get('questions/aspect/:aspekNo')
  @ApiOperation({ summary: 'Get questions by aspect' })
  @ApiQuery({ name: 'year', required: false })
  async getQuestionsByAspect(
    @Param('aspekNo') aspekNo: string,
    @Query('year', ParseIntPipe) year?: number,
  ) {
    return await this.kpmrReputasiService.findQuestionsByAspect(aspekNo, year);
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get question by ID' })
  async getQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrReputasiService.findQuestionById(id);
  }

  @Put('questions/:id')
  @ApiOperation({ summary: 'Update KPMR Reputasi question' })
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRReputasiQuestionDto,
  ) {
    return await this.kpmrReputasiService.updateQuestion(id, updateDto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete KPMR Reputasi question' })
  async deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrReputasiService.deleteQuestion(id);
  }

  @Post('definitions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update KPMR Reputasi definition' })
  async createOrUpdateDefinition(
    @Body() createDto: CreateKPMRReputasiDefinitionDto,
  ) {
    return await this.kpmrReputasiService.createOrUpdateDefinition(createDto);
  }

  @Get('definitions')
  @ApiOperation({ summary: 'Get all KPMR Reputasi definitions' })
  async getAllDefinitions() {
    return await this.kpmrReputasiService.findAllDefinitions();
  }

  @Get('definitions/year/:year')
  @ApiOperation({ summary: 'Get definitions by year' })
  async getDefinitionsByYear(@Param('year', ParseIntPipe) year: number) {
    return await this.kpmrReputasiService.findDefinitionsByYear(year);
  }

  @Get('definitions/:id')
  @ApiOperation({ summary: 'Get definition by ID' })
  async getDefinition(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrReputasiService.findDefinitionById(id);
  }

  @Put('definitions/:id')
  @ApiOperation({ summary: 'Update definition' })
  async updateDefinition(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRReputasiDefinitionDto,
  ) {
    return await this.kpmrReputasiService.updateDefinition(id, updateDto);
  }

  @Delete('definition/:definitionId/:year')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete definition with scores' })
  async deleteDefinitionPermanent(
    @Param('definitionId', ParseIntPipe) definitionId: number,
    @Param('year', ParseIntPipe) year: number,
  ) {
    console.log('🗑️ DELETE DEFINITION REQUEST:', { definitionId, year });
    const result = await this.kpmrReputasiService.deleteDefinition(
      definitionId,
      year,
    );
    return result;
  }

  @Post('scores')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update KPMR Reputasi score' })
  async createOrUpdateScore(@Body() createDto: CreateKPMRReputasiScoreDto) {
    return await this.kpmrReputasiService.createOrUpdateScore(createDto);
  }

  @Get('scores')
  @ApiOperation({ summary: 'Get all scores' })
  async getAllScores() {
    return await this.kpmrReputasiService.findAllScores();
  }

  @Get('scores/period')
  @ApiOperation({ summary: 'Get scores by period' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'quarter', required: false })
  async getScoresByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter?: string,
  ) {
    return await this.kpmrReputasiService.findScoresByPeriod(year, quarter);
  }

  @Get('scores/definition/:definitionId')
  @ApiOperation({ summary: 'Get scores by definition' })
  async getScoresByDefinition(
    @Param('definitionId', ParseIntPipe) definitionId: number,
  ) {
    return await this.kpmrReputasiService.findScoresByDefinition(definitionId);
  }

  @Get('scores/:id')
  @ApiOperation({ summary: 'Get score by ID' })
  async getScore(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrReputasiService.findScoreById(id);
  }

  @Put('scores/:id')
  @ApiOperation({ summary: 'Update score' })
  async updateScore(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRReputasiScoreDto,
  ) {
    return await this.kpmrReputasiService.updateScore(id, updateDto);
  }

  @Delete('scores/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete score' })
  async deleteScore(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrReputasiService.deleteScore(id);
  }

  @Post('scores/target/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete score by target' })
  async deleteScoreByTarget(
    @Body() body: { definitionId: number; year: number; quarter: string },
  ) {
    return await this.kpmrReputasiService.deleteScoreByTarget(
      body.definitionId,
      body.year,
      body.quarter,
    );
  }

  @Get('full-data/:year')
  @ApiOperation({ summary: 'Get complete KPMR Reputasi data with grouping' })
  async getFullData(@Param('year', ParseIntPipe) year: number) {
    return await this.kpmrReputasiService.getKPMRFullData(year);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search KPMR Reputasi data' })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'aspekNo', required: false })
  async searchKPMR(
    @Query('year', ParseIntPipe) year?: number,
    @Query('query') query?: string,
    @Query('aspekNo') aspekNo?: string,
  ) {
    return await this.kpmrReputasiService.searchKPMR(year, query, aspekNo);
  }

  @Get('years')
  @ApiOperation({ summary: 'Get available years' })
  async getAvailableYears() {
    const years = await this.kpmrReputasiService.getAvailableYears();
    return { success: true, data: years };
  }

  @Get('periods')
  @ApiOperation({ summary: 'Get available periods' })
  async getPeriods() {
    const periods = await this.kpmrReputasiService.getPeriods();
    return { success: true, data: periods };
  }
}
