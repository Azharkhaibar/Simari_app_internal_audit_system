// kredit-produk-ojk.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  NotFoundException,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { KreditService } from './kredit-produk-ojk.service';
import {
  CreateKreditDto,
  UpdateKreditDto,
  CreateParameterDto,
  UpdateParameterDto,
  CreateNilaiDto,
  UpdateNilaiDto,
  ReorderParametersDto,
  ReorderNilaiDto,
  UpdateSummaryDto,
  ImportExportDto,
} from './dto/kredit-produk-inherent.dto';

@ApiTags('Kredit')
@Controller('kredit')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class KreditController {
  constructor(private readonly kreditService: KreditService) {}

  // === CRUD UTAMA ===

  @Get()
  @ApiOperation({ summary: 'Get all Kredit data or by year/quarter' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'quarter', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Data retrieved successfully' })
  async findAll(
    @Query('year') year?: number,
    @Query('quarter') quarter?: number,
  ) {
    if (year && quarter) {
      const yearNum = Number(year);
      const quarterNum = Number(quarter);

      const result = await this.kreditService.findByYearQuarter(
        yearNum,
        quarterNum,
      );

      return {
        success: true,
        data: result || null,
        exists: !!result,
        message: result
          ? `Data kredit ditemukan untuk ${yearNum} Q${quarterNum}`
          : `Data kredit belum tersedia untuk ${yearNum} Q${quarterNum}`,
      };
    }

    const allData = await this.kreditService.getAll();
    return {
      success: true,
      data: allData,
      count: allData.length,
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active Kredit data' })
  @ApiResponse({
    status: 200,
    description: 'Active data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No active data found' })
  async getActive() {
    const result = await this.kreditService.findActive();
    if (!result) {
      throw new NotFoundException('Tidak ada data aktif ditemukan');
    }
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Kredit by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Data not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.kreditService.findById(id);
    if (!result) {
      throw new NotFoundException(`Data dengan ID ${id} tidak ditemukan`);
    }
    return result;
  }

  @Post()
  @ApiOperation({ summary: 'Create new Kredit data' })
  @ApiBody({ type: CreateKreditDto })
  @ApiResponse({ status: 201, description: 'Data created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createDto: CreateKreditDto, @Request() req) {
    const userId = req.user?.id || 'system';
    return this.kreditService.create(createDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Kredit data' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateKreditDto })
  @ApiResponse({ status: 200, description: 'Data updated successfully' })
  @ApiResponse({ status: 404, description: 'Data not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateKreditDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.kreditService.update(id, updateDto, userId);
  }

  @Put(':id/summary')
  @ApiOperation({ summary: 'Update summary only' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateSummaryDto })
  @ApiResponse({ status: 200, description: 'Summary updated successfully' })
  @ApiResponse({ status: 404, description: 'Data not found' })
  async updateSummary(
    @Param('id', ParseIntPipe) id: number,
    @Body() summaryDto: UpdateSummaryDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.kreditService.updateSummary(id, summaryDto, userId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update active status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { properties: { isActive: { type: 'boolean' } } } })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Data not found' })
  async updateActiveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.kreditService.updateActiveStatus(id, isActive, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Kredit data' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Data deleted successfully' })
  @ApiResponse({ status: 404, description: 'Data not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.kreditService.remove(id);
  }

  // === OPERASI PARAMETER ===

  @Get(':id/parameters')
  @ApiOperation({ summary: 'Get all parameters for specific Kredit' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Parameters retrieved successfully',
  })
  async getParameters(@Param('id', ParseIntPipe) kreditId: number) {
    const kredit = await this.getKreditByIdOrThrow(kreditId);
    return kredit.parameters || [];
  }

  @Post(':id/parameters')
  @ApiOperation({ summary: 'Add new parameter' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: CreateParameterDto })
  @ApiResponse({ status: 201, description: 'Parameter added successfully' })
  @ApiResponse({ status: 404, description: 'Data not found' })
  async addParameter(
    @Param('id', ParseIntPipe) kreditId: number,
    @Body() createParamDto: CreateParameterDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.kreditService.addParameter(
      kreditId,
      createParamDto,
      userId,
    );
  }

  @Put(':id/parameters/:parameterId')
  @ApiOperation({ summary: 'Update parameter' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'parameterId', type: Number })
  @ApiBody({ type: UpdateParameterDto })
  @ApiResponse({ status: 200, description: 'Parameter updated successfully' })
  @ApiResponse({ status: 404, description: 'Parameter not found' })
  async updateParameter(
    @Param('id', ParseIntPipe) kreditId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Body() updateParamDto: UpdateParameterDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.kreditService.updateParameter(
      kreditId,
      parameterId,
      updateParamDto,
      userId,
    );
  }

  @Put(':id/parameters/reorder')
  @ApiOperation({ summary: 'Reorder parameters' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: ReorderParametersDto })
  @ApiResponse({
    status: 200,
    description: 'Parameters reordered successfully',
  })
  async reorderParameters(
    @Param('id', ParseIntPipe) kreditId: number,
    @Body() reorderDto: ReorderParametersDto,
  ) {
    return this.kreditService.reorderParameters(kreditId, reorderDto);
  }

  @Post(':id/parameters/:parameterId/copy')
  @ApiOperation({ summary: 'Copy parameter' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'parameterId', type: Number })
  @ApiResponse({ status: 201, description: 'Parameter copied successfully' })
  @ApiResponse({ status: 404, description: 'Parameter not found' })
  async copyParameter(
    @Param('id', ParseIntPipe) kreditId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.kreditService.copyParameter(
      kreditId,
      parameterId,
      userId,
    );
  }

  @Delete(':id/parameters/:parameterId')
  @ApiOperation({ summary: 'Delete parameter' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'parameterId', type: Number })
  @ApiResponse({ status: 200, description: 'Parameter deleted successfully' })
  @ApiResponse({ status: 404, description: 'Parameter not found' })
  async removeParameter(
    @Param('id', ParseIntPipe) kreditId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.kreditService.removeParameter(
      kreditId,
      parameterId,
      userId,
    );
  }

  // === OPERASI NILAI ===

  @Get(':id/parameters/:parameterId/nilai')
  @ApiOperation({ summary: 'Get all nilai for specific parameter' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'parameterId', type: Number })
  @ApiResponse({ status: 200, description: 'Nilai retrieved successfully' })
  async getNilai(
    @Param('id', ParseIntPipe) kreditId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
  ) {
    const kredit = await this.getKreditByIdOrThrow(kreditId);

    const parameter = kredit.parameters?.find((p) => p.id === parameterId);
    if (!parameter) {
      throw new NotFoundException(
        `Parameter dengan ID ${parameterId} tidak ditemukan`,
      );
    }
    return parameter.nilaiList || [];
  }

  @Post(':id/parameters/:parameterId/nilai')
  @ApiOperation({ summary: 'Add new nilai' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'parameterId', type: Number })
  @ApiBody({ type: CreateNilaiDto })
  @ApiResponse({ status: 201, description: 'Nilai added successfully' })
  @ApiResponse({ status: 404, description: 'Parameter not found' })
  async addNilai(
    @Param('id', ParseIntPipe) kreditId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Body() createNilaiDto: CreateNilaiDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.kreditService.addNilai(
      kreditId,
      parameterId,
      createNilaiDto,
      userId,
    );
  }

  @Put(':id/parameters/:parameterId/nilai/:nilaiId')
  @ApiOperation({ summary: 'Update nilai' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'parameterId', type: Number })
  @ApiParam({ name: 'nilaiId', type: Number })
  @ApiBody({ type: UpdateNilaiDto })
  @ApiResponse({ status: 200, description: 'Nilai updated successfully' })
  @ApiResponse({ status: 404, description: 'Nilai not found' })
  async updateNilai(
    @Param('id', ParseIntPipe) kreditId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Param('nilaiId', ParseIntPipe) nilaiId: number,
    @Body() updateNilaiDto: UpdateNilaiDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.kreditService.updateNilai(
      kreditId,
      parameterId,
      nilaiId,
      updateNilaiDto,
      userId,
    );
  }

  @Put(':id/parameters/:parameterId/nilai/reorder')
  @ApiOperation({ summary: 'Reorder nilai' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'parameterId', type: Number })
  @ApiBody({ type: ReorderNilaiDto })
  @ApiResponse({ status: 200, description: 'Nilai reordered successfully' })
  async reorderNilai(
    @Param('id', ParseIntPipe) kreditId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Body() reorderDto: ReorderNilaiDto,
  ) {
    return this.kreditService.reorderNilai(parameterId, reorderDto);
  }

  @Post(':id/parameters/:parameterId/nilai/:nilaiId/copy')
  @ApiOperation({ summary: 'Copy nilai' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'parameterId', type: Number })
  @ApiParam({ name: 'nilaiId', type: Number })
  @ApiResponse({ status: 201, description: 'Nilai copied successfully' })
  @ApiResponse({ status: 404, description: 'Nilai not found' })
  async copyNilai(
    @Param('id', ParseIntPipe) kreditId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Param('nilaiId', ParseIntPipe) nilaiId: number,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.kreditService.copyNilai(
      kreditId,
      parameterId,
      nilaiId,
      userId,
    );
  }

  @Delete(':id/parameters/:parameterId/nilai/:nilaiId')
  @ApiOperation({ summary: 'Delete nilai' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'parameterId', type: Number })
  @ApiParam({ name: 'nilaiId', type: Number })
  @ApiResponse({ status: 200, description: 'Nilai deleted successfully' })
  @ApiResponse({ status: 404, description: 'Nilai not found' })
  async removeNilai(
    @Param('id', ParseIntPipe) kreditId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Param('nilaiId', ParseIntPipe) nilaiId: number,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.kreditService.removeNilai(
      kreditId,
      parameterId,
      nilaiId,
      userId,
    );
  }

  // === IMPORT/EXPORT ===

  @Get(':id/export')
  @ApiOperation({ summary: 'Export data to Excel format' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Export successful' })
  @ApiResponse({ status: 404, description: 'Data not found' })
  async exportToExcel(@Param('id', ParseIntPipe) kreditId: number) {
    return this.kreditService.exportToExcel(kreditId);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import data from Excel format' })
  @ApiBody({ type: ImportExportDto })
  @ApiResponse({ status: 201, description: 'Import successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async importFromExcel(@Body() importData: ImportExportDto, @Request() req) {
    const userId = req.user?.id || 'system';
    return this.kreditService.importFromExcel(importData, userId);
  }

  // === REFERENCE DATA ===

  @Get('references')
  @ApiOperation({ summary: 'Get reference data' })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'References retrieved successfully',
  })
  async getReferences(@Query('type') type?: string) {
    return this.kreditService.getReferences(type);
  }

  // === VALIDATION ENDPOINTS ===

  @Get(':id/validate')
  @ApiOperation({ summary: 'Validate model terstruktur' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  async validateModelTerstruktur(
    @Param('id', ParseIntPipe) kreditId: number,
  ) {
    return this.kreditService.validateModelTerstruktur(kreditId);
  }

  // === UTILITY ENDPOINTS ===

  @Get('check/:year/:quarter')
  @ApiOperation({ summary: 'Check if data exists for year/quarter' })
  @ApiParam({ name: 'year', type: Number })
  @ApiParam({ name: 'quarter', type: Number })
  @ApiResponse({ status: 200, description: 'Check completed' })
  async checkExists(
    @Param('year', ParseIntPipe) year: number,
    @Param('quarter', ParseIntPipe) quarter: number,
  ) {
    const exists = await this.kreditService.findByYearQuarter(
      year,
      quarter,
    );
    return { exists: !!exists, data: exists };
  }

  // === HELPER METHODS ===

  private async getKreditByIdOrThrow(kreditId: number) {
    const kredit = await this.kreditService.findById(kreditId);

    if (!kredit) {
      throw new NotFoundException(
        `Data dengan ID ${kreditId} tidak ditemukan`,
      );
    }

    return kredit;
  }
}