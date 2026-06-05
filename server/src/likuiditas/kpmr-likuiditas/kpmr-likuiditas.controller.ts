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
import { KPMRLikuiditasService } from './kpmr-likuiditas.service';
import {
  CreateKPMRLikuiditasAspectDto,
  UpdateKPMRLikuiditasAspectDto,
  CreateKPMRLikuiditasQuestionDto,
  UpdateKPMRLikuiditasQuestionDto,
  CreateKPMRLikuiditasDefinitionDto,
  UpdateKPMRLikuiditasDefinitionDto,
  CreateKPMRLikuiditasScoreDto,
  UpdateKPMRLikuiditasScoreDto,
} from './dto/kpmr-likuiditas.dto';

@ApiTags('KPMR Likuiditas')
@Controller('kpmr-likuiditas')
export class KPMRLikuiditasController {
  constructor(
    private readonly kpmrLikuiditasService: KPMRLikuiditasService,
  ) {}

  @Post('aspects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new KPMR Likuiditas aspect' })
  async createAspect(@Body() createDto: CreateKPMRLikuiditasAspectDto) {
    return await this.kpmrLikuiditasService.createAspect(createDto);
  }

  @Get('aspects')
  @ApiOperation({ summary: 'Get all KPMR Likuiditas aspects' })
  @ApiQuery({ name: 'year', required: false })
  async getAllAspects(@Query('year', ParseIntPipe) year?: number) {
    return await this.kpmrLikuiditasService.findAllAspects(year);
  }

  @Get('aspects/:id')
  @ApiOperation({ summary: 'Get KPMR Likuiditas aspect by ID' })
  async getAspect(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrLikuiditasService.findAspectById(id);
  }

  @Put('aspects/:id')
  @ApiOperation({ summary: 'Update KPMR Likuiditas aspect' })
  async updateAspect(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRLikuiditasAspectDto,
  ) {
    return await this.kpmrLikuiditasService.updateAspect(id, updateDto);
  }

  @Delete('aspects/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete KPMR Likuiditas aspect' })
  async deleteAspect(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrLikuiditasService.deleteAspect(id);
  }

  @Post('questions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new KPMR Likuiditas question' })
  async createQuestion(@Body() createDto: CreateKPMRLikuiditasQuestionDto) {
    return await this.kpmrLikuiditasService.createQuestion(createDto);
  }

  @Get('questions')
  @ApiOperation({ summary: 'Get all KPMR Likuiditas questions' })
  @ApiQuery({ name: 'year', required: false })
  async getAllQuestions(@Query('year', ParseIntPipe) year?: number) {
    return await this.kpmrLikuiditasService.findAllQuestions(year);
  }

  @Get('questions/aspect/:aspekNo')
  @ApiOperation({ summary: 'Get questions by aspect' })
  @ApiQuery({ name: 'year', required: false })
  async getQuestionsByAspect(
    @Param('aspekNo') aspekNo: string,
    @Query('year', ParseIntPipe) year?: number,
  ) {
    return await this.kpmrLikuiditasService.findQuestionsByAspect(
      aspekNo,
      year,
    );
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get question by ID' })
  async getQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrLikuiditasService.findQuestionById(id);
  }

  @Put('questions/:id')
  @ApiOperation({ summary: 'Update KPMR Likuiditas question' })
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRLikuiditasQuestionDto,
  ) {
    return await this.kpmrLikuiditasService.updateQuestion(id, updateDto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete KPMR Likuiditas question' })
  async deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrLikuiditasService.deleteQuestion(id);
  }

  @Post('definitions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update KPMR Likuiditas definition' })
  async createOrUpdateDefinition(
    @Body() createDto: CreateKPMRLikuiditasDefinitionDto,
  ) {
    return await this.kpmrLikuiditasService.createOrUpdateDefinition(
      createDto,
    );
  }

  @Get('definitions')
  @ApiOperation({ summary: 'Get all KPMR Likuiditas definitions' })
  async getAllDefinitions() {
    return await this.kpmrLikuiditasService.findAllDefinitions();
  }

  @Get('definitions/year/:year')
  @ApiOperation({ summary: 'Get definitions by year' })
  async getDefinitionsByYear(@Param('year', ParseIntPipe) year: number) {
    return await this.kpmrLikuiditasService.findDefinitionsByYear(year);
  }

  @Get('definitions/:id')
  @ApiOperation({ summary: 'Get definition by ID' })
  async getDefinition(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrLikuiditasService.findDefinitionById(id);
  }

  @Put('definitions/:id')
  @ApiOperation({ summary: 'Update definition' })
  async updateDefinition(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRLikuiditasDefinitionDto,
  ) {
    return await this.kpmrLikuiditasService.updateDefinition(id, updateDto);
  }

  @Delete('definition/:definitionId/:year')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete definition with scores' })
  async deleteDefinitionPermanent(
    @Param('definitionId', ParseIntPipe) definitionId: number,
    @Param('year', ParseIntPipe) year: number,
  ) {
    console.log('🗑️ DELETE DEFINITION REQUEST:', { definitionId, year });
    const result = await this.kpmrLikuiditasService.deleteDefinition(
      definitionId,
      year,
    );
    return result;
  }

  @Post('scores')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update KPMR Likuiditas score' })
  async createOrUpdateScore(@Body() createDto: CreateKPMRLikuiditasScoreDto) {
    return await this.kpmrLikuiditasService.createOrUpdateScore(createDto);
  }

  @Get('scores')
  @ApiOperation({ summary: 'Get all scores' })
  async getAllScores() {
    return await this.kpmrLikuiditasService.findAllScores();
  }

  @Get('scores/period')
  @ApiOperation({ summary: 'Get scores by period' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'quarter', required: false })
  async getScoresByPeriod(
    @Query('year', ParseIntPipe) year: number,
    @Query('quarter') quarter?: string,
  ) {
    return await this.kpmrLikuiditasService.findScoresByPeriod(year, quarter);
  }

  @Get('scores/definition/:definitionId')
  @ApiOperation({ summary: 'Get scores by definition' })
  async getScoresByDefinition(
    @Param('definitionId', ParseIntPipe) definitionId: number,
  ) {
    return await this.kpmrLikuiditasService.findScoresByDefinition(
      definitionId,
    );
  }

  @Get('scores/:id')
  @ApiOperation({ summary: 'Get score by ID' })
  async getScore(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrLikuiditasService.findScoreById(id);
  }

  @Put('scores/:id')
  @ApiOperation({ summary: 'Update score' })
  async updateScore(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKPMRLikuiditasScoreDto,
  ) {
    return await this.kpmrLikuiditasService.updateScore(id, updateDto);
  }

  @Delete('scores/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete score' })
  async deleteScore(@Param('id', ParseIntPipe) id: number) {
    return await this.kpmrLikuiditasService.deleteScore(id);
  }

  @Post('scores/target/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete score by target' })
  async deleteScoreByTarget(
    @Body() body: { definitionId: number; year: number; quarter: string },
  ) {
    return await this.kpmrLikuiditasService.deleteScoreByTarget(
      body.definitionId,
      body.year,
      body.quarter,
    );
  }

  @Get('full-data/:year')
  @ApiOperation({ summary: 'Get complete KPMR Likuiditas data with grouping' })
  async getFullData(@Param('year', ParseIntPipe) year: number) {
    return await this.kpmrLikuiditasService.getKPMRFullData(year);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search KPMR Likuiditas data' })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'aspekNo', required: false })
  async searchKPMR(
    @Query('year', ParseIntPipe) year?: number,
    @Query('query') query?: string,
    @Query('aspekNo') aspekNo?: string,
  ) {
    return await this.kpmrLikuiditasService.searchKPMR(year, query, aspekNo);
  }

  @Get('years')
  @ApiOperation({ summary: 'Get available years' })
  async getAvailableYears() {
    const years = await this.kpmrLikuiditasService.getAvailableYears();
    return { success: true, data: years };
  }

  @Get('periods')
  @ApiOperation({ summary: 'Get available periods' })
  async getPeriods() {
    const periods = await this.kpmrLikuiditasService.getPeriods();
    return { success: true, data: periods };
  }
}
