// src/features/Dashboard/pages/RiskProfile/pages/Kepatuhan/controllers/kpmr-kepatuhan.controller.ts
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
import { KPMRKepatuhanService } from './kpmr-kepatuhan.service';
import {
  CreateKPMRKepatuhanAspectDto,
  UpdateKPMRKepatuhanAspectDto,
  CreateKPMRKepatuhanQuestionDto,
  UpdateKPMRKepatuhanQuestionDto,
  CreateKPMRKepatuhanDefinitionDto,
  UpdateKPMRKepatuhanDefinitionDto,
  CreateKPMRKepatuhanScoreDto,
  UpdateKPMRKepatuhanScoreDto,
} from './dto/kpmr-kepatuhan.dto';

@ApiTags('KPMR Kepatuhan')
@Controller('kpmr-kepatuhan')
export class KPMRKepatuhanController {
  constructor(private readonly kpmrKepatuhanService: KPMRKepatuhanService) {}

  @Post('aspects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new KPMR Kepatuhan aspect' })
  async createAspect(@Body() createDto: CreateKPMRKepatuhanAspectDto) {
    return await this.kpmrKepatuhanService.createAspect(createDto);
  }

  @Get('aspects')
  @ApiOperation({ summary: 'Get all KPMR Kepatuhan aspects' })
  @ApiQuery({ name: 'year', required: false })
  async getAllAspects(@Query('year', ParseIntPipe) year?: number) {
    return await this.kpmrKepatuhanService.findAllAspects(year);
  }

  @Get('aspects/:id')
  @ApiOperation({ summary: 'Get KPMR Kepatuhan aspect by ID' })
  async getAspect(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrKepatuhanService.findAspectById(id);
  }

  @Put('aspects/:id')
  @ApiOperation({ summary: 'Update KPMR Kepatuhan aspect' })
  async updateAspect(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRKepatuhanAspectDto,
  ) {
    return await this.kpmrKepatuhanService.updateAspect(id, updateDto);
  }

  @Delete('aspects/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete KPMR Kepatuhan aspect' })
  async deleteAspect(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrKepatuhanService.deleteAspect(id);
  }

  @Post('questions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new KPMR Kepatuhan question' })
  async createQuestion(@Body() createDto: CreateKPMRKepatuhanQuestionDto) {
    return await this.kpmrKepatuhanService.createQuestion(createDto);
  }

  @Get('questions')
  @ApiOperation({ summary: 'Get all KPMR Kepatuhan questions' })
  @ApiQuery({ name: 'year', required: false })
  async getAllQuestions(@Query('year', ParseIntPipe) year?: number) {
    return await this.kpmrKepatuhanService.findAllQuestions(year);
  }

  @Get('questions/aspect/:aspekNo')
  @ApiOperation({ summary: 'Get questions by aspect' })
  @ApiQuery({ name: 'year', required: false })
  async getQuestionsByAspect(
    @Param('aspekNo') aspekNo: string,
    @Query('year', ParseIntPipe) year?: number,
  ) {
    return await this.kpmrKepatuhanService.findQuestionsByAspect(aspekNo, year);
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get question by ID' })
  async getQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrKepatuhanService.findQuestionById(id);
  }

  @Put('questions/:id')
  @ApiOperation({ summary: 'Update KPMR Kepatuhan question' })
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRKepatuhanQuestionDto,
  ) {
    return await this.kpmrKepatuhanService.updateQuestion(id, updateDto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete KPMR Kepatuhan question' })
  async deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrKepatuhanService.deleteQuestion(id);
  }

  @Post('definitions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update KPMR Kepatuhan definition' })
  async createOrUpdateDefinition(
    @Body() createDto: CreateKPMRKepatuhanDefinitionDto,
  ) {
    return await this.kpmrKepatuhanService.createOrUpdateDefinition(createDto);
  }

  @Get('definitions')
  @ApiOperation({ summary: 'Get all KPMR Kepatuhan definitions' })
  async getAllDefinitions() {
    return await this.kpmrKepatuhanService.findAllDefinitions();
  }

  @Get('definitions/year/:year')
  @ApiOperation({ summary: 'Get definitions by year' })
  async getDefinitionsByYear(@Param('year', ParseIntPipe) year: number) {
    return await this.kpmrKepatuhanService.findDefinitionsByYear(year);
  }

  @Get('definitions/:id')
  @ApiOperation({ summary: 'Get definition by ID' })
  async getDefinition(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrKepatuhanService.findDefinitionById(id);
  }

  @Put('definitions/:id')
  @ApiOperation({ summary: 'Update definition' })
  async updateDefinition(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRKepatuhanDefinitionDto,
  ) {
    return await this.kpmrKepatuhanService.updateDefinition(id, updateDto);
  }

  @Delete('definition/:definitionId/:year')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete definition with scores' })
  async deleteDefinitionPermanent(
    @Param('definitionId', ParseIntPipe) definitionId: number,
    @Param('year', ParseIntPipe) year: number,
  ) {
    console.log('🗑️ DELETE DEFINITION REQUEST:', { definitionId, year });
    const result = await this.kpmrKepatuhanService.deleteDefinition(
      definitionId,
      year,
    );
    return result;
  }

  @Post('scores')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update KPMR Kepatuhan score' })
  async createOrUpdateScore(@Body() createDto: CreateKPMRKepatuhanScoreDto) {
    return await this.kpmrKepatuhanService.createOrUpdateScore(createDto);
  }

  @Get('scores')
  @ApiOperation({ summary: 'Get all scores' })
  async getAllScores() {
    return await this.kpmrKepatuhanService.findAllScores();
  }

  @Get('scores/period')
  @ApiOperation({ summary: 'Get scores by period' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'quarter', required: false })
  async getScoresByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter?: string,
  ) {
    return await this.kpmrKepatuhanService.findScoresByPeriod(year, quarter);
  }

  @Get('scores/definition/:definitionId')
  @ApiOperation({ summary: 'Get scores by definition' })
  async getScoresByDefinition(
    @Param('definitionId', ParseIntPipe) definitionId: number,
  ) {
    return await this.kpmrKepatuhanService.findScoresByDefinition(definitionId);
  }

  @Get('scores/:id')
  @ApiOperation({ summary: 'Get score by ID' })
  async getScore(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrKepatuhanService.findScoreById(id);
  }

  @Put('scores/:id')
  @ApiOperation({ summary: 'Update score' })
  async updateScore(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRKepatuhanScoreDto,
  ) {
    return await this.kpmrKepatuhanService.updateScore(id, updateDto);
  }

  @Delete('scores/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete score' })
  async deleteScore(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrKepatuhanService.deleteScore(id);
  }

  @Post('scores/target/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete score by target' })
  async deleteScoreByTarget(
    @Body() body: { definitionId: number; year: number; quarter: string },
  ) {
    return await this.kpmrKepatuhanService.deleteScoreByTarget(
      body.definitionId,
      body.year,
      body.quarter,
    );
  }

  @Get('full-data/:year')
  @ApiOperation({ summary: 'Get complete KPMR Kepatuhan data with grouping' })
  async getFullData(@Param('year', ParseIntPipe) year: number) {
    return await this.kpmrKepatuhanService.getKPMRFullData(year);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search KPMR Kepatuhan data' })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'aspekNo', required: false })
  async searchKPMR(
    @Query('year', ParseIntPipe) year?: number,
    @Query('query') query?: string,
    @Query('aspekNo') aspekNo?: string,
  ) {
    return await this.kpmrKepatuhanService.searchKPMR(year, query, aspekNo);
  }

  @Get('years')
  @ApiOperation({ summary: 'Get available years' })
  async getAvailableYears() {
    const years = await this.kpmrKepatuhanService.getAvailableYears();
    return { success: true, data: years };
  }

  @Get('periods')
  @ApiOperation({ summary: 'Get available periods' })
  async getPeriods() {
    const periods = await this.kpmrKepatuhanService.getPeriods();
    return { success: true, data: periods };
  }
}
