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
import { RentabilitasService } from './rentabilitas-ojk.service';
import {
  CreateRentabilitasDto,
  UpdateRentabilitasDto,
  CreateParameterDto,
  UpdateParameterDto,
  CreateNilaiDto,
  UpdateNilaiDto,
  ReorderParametersDto,
  ReorderNilaiDto,
  UpdateSummaryDto,
  ImportExportDto,
} from './dto/rentabilitas-inherent.dto';

@ApiTags('Rentabilitas')
@Controller('rentabilitas')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class RentabilitasController {
  constructor(private readonly rentabilitasService: RentabilitasService) {}

  // === CRUD UTAMA ===

  @Get()
  @ApiOperation({ summary: 'Get all Rentabilitas data or by year/quarter' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'quarter', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Data retrieved successfully' })
  async findAll(
    @Query('year') year?: number,
    @Query('quarter') quarter?: number,
  ) {
    // Jika ada parameter year & quarter, cari spesifik
    if (year && quarter) {
      const yearNum = Number(year);
      const quarterNum = Number(quarter);

      const result = await this.rentabilitasService.findByYearQuarter(
        yearNum,
        quarterNum,
      );

      // ✅ JANGAN throw error. Return response 200 dengan data null.
      return {
        success: true,
        data: result || null, // null jika tidak ditemukan
        exists: !!result, // flag untuk frontend
        message: result
          ? `Data rentabilitas ditemukan untuk ${yearNum} Q${quarterNum}`
          : `Data rentabilitas belum tersedia untuk ${yearNum} Q${quarterNum}`,
      };
    }

    // Jika tidak ada parameter, return semua data
    const allData = await this.rentabilitasService.getAll();
    return {
      success: true,
      data: allData,
      count: allData.length,
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active Rentabilitas data' })
  @ApiResponse({
    status: 200,
    description: 'Active data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No active data found' })
  async getActive() {
    const result = await this.rentabilitasService.findActive();
    if (!result) {
      throw new NotFoundException('Tidak ada data aktif ditemukan');
    }
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Rentabilitas by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Data not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.rentabilitasService.findById(id);
    if (!result) {
      throw new NotFoundException(`Data dengan ID ${id} tidak ditemukan`);
    }
    return result;
  }

  @Post()
  @ApiOperation({ summary: 'Create new Rentabilitas data' })
  @ApiBody({ type: CreateRentabilitasDto })
  @ApiResponse({ status: 201, description: 'Data created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createDto: CreateRentabilitasDto, @Request() req) {
    const userId = req.user?.id || 'system';
    return this.rentabilitasService.create(createDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Rentabilitas data' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateRentabilitasDto })
  @ApiResponse({ status: 200, description: 'Data updated successfully' })
  @ApiResponse({ status: 404, description: 'Data not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRentabilitasDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.rentabilitasService.update(id, updateDto, userId);
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
    return this.rentabilitasService.updateSummary(id, summaryDto, userId);
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
    return this.rentabilitasService.updateActiveStatus(id, isActive, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Rentabilitas data' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Data deleted successfully' })
  @ApiResponse({ status: 404, description: 'Data not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.rentabilitasService.remove(id);
  }

  // === OPERASI PARAMETER ===

  @Get(':id/parameters')
  @ApiOperation({ summary: 'Get all parameters for specific Rentabilitas' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Parameters retrieved successfully',
  })
  async getParameters(@Param('id', ParseIntPipe) rentabilitasId: number) {
    const rentabilitas = await this.getRentabilitasByIdOrThrow(rentabilitasId);
    return rentabilitas.parameters || [];
  }

  @Post(':id/parameters')
  @ApiOperation({ summary: 'Add new parameter' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: CreateParameterDto })
  @ApiResponse({ status: 201, description: 'Parameter added successfully' })
  @ApiResponse({ status: 404, description: 'Data not found' })
  async addParameter(
    @Param('id', ParseIntPipe) rentabilitasId: number,
    @Body() createParamDto: CreateParameterDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.rentabilitasService.addParameter(
      rentabilitasId,
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
    @Param('id', ParseIntPipe) rentabilitasId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Body() updateParamDto: UpdateParameterDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.rentabilitasService.updateParameter(
      rentabilitasId,
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
    @Param('id', ParseIntPipe) rentabilitasId: number,
    @Body() reorderDto: ReorderParametersDto,
  ) {
    return this.rentabilitasService.reorderParameters(
      rentabilitasId,
      reorderDto,
    );
  }

  @Post(':id/parameters/:parameterId/copy')
  @ApiOperation({ summary: 'Copy parameter' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'parameterId', type: Number })
  @ApiResponse({ status: 201, description: 'Parameter copied successfully' })
  @ApiResponse({ status: 404, description: 'Parameter not found' })
  async copyParameter(
    @Param('id', ParseIntPipe) rentabilitasId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.rentabilitasService.copyParameter(
      rentabilitasId,
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
    @Param('id', ParseIntPipe) rentabilitasId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.rentabilitasService.removeParameter(
      rentabilitasId,
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
    @Param('id', ParseIntPipe) rentabilitasId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
  ) {
    const rentabilitas = await this.getRentabilitasByIdOrThrow(rentabilitasId);

    const parameter = rentabilitas.parameters?.find(
      (p) => p.id === parameterId,
    );
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
    @Param('id', ParseIntPipe) rentabilitasId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Body() createNilaiDto: CreateNilaiDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.rentabilitasService.addNilai(
      rentabilitasId,
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
    @Param('id', ParseIntPipe) rentabilitasId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Param('nilaiId', ParseIntPipe) nilaiId: number,
    @Body() updateNilaiDto: UpdateNilaiDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.rentabilitasService.updateNilai(
      rentabilitasId,
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
    @Param('id', ParseIntPipe) rentabilitasId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Body() reorderDto: ReorderNilaiDto,
  ) {
    return this.rentabilitasService.reorderNilai(parameterId, reorderDto);
  }

  @Post(':id/parameters/:parameterId/nilai/:nilaiId/copy')
  @ApiOperation({ summary: 'Copy nilai' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'parameterId', type: Number })
  @ApiParam({ name: 'nilaiId', type: Number })
  @ApiResponse({ status: 201, description: 'Nilai copied successfully' })
  @ApiResponse({ status: 404, description: 'Nilai not found' })
  async copyNilai(
    @Param('id', ParseIntPipe) rentabilitasId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Param('nilaiId', ParseIntPipe) nilaiId: number,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.rentabilitasService.copyNilai(
      rentabilitasId,
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
    @Param('id', ParseIntPipe) rentabilitasId: number,
    @Param('parameterId', ParseIntPipe) parameterId: number,
    @Param('nilaiId', ParseIntPipe) nilaiId: number,
    @Request() req,
  ) {
    const userId = req.user?.id || 'system';
    return this.rentabilitasService.removeNilai(
      rentabilitasId,
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
  async exportToExcel(@Param('id', ParseIntPipe) rentabilitasId: number) {
    return this.rentabilitasService.exportToExcel(rentabilitasId);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import data from Excel format' })
  @ApiBody({ type: ImportExportDto })
  @ApiResponse({ status: 201, description: 'Import successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async importFromExcel(@Body() importData: ImportExportDto, @Request() req) {
    const userId = req.user?.id || 'system';
    return this.rentabilitasService.importFromExcel(importData, userId);
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
    return this.rentabilitasService.getReferences(type);
  }

  // === VALIDATION ENDPOINTS ===

  @Get(':id/validate')
  @ApiOperation({ summary: 'Validate model terstruktur' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  async validateModelTerstruktur(
    @Param('id', ParseIntPipe) rentabilitasId: number,
  ) {
    return this.rentabilitasService.validateModelTerstruktur(rentabilitasId);
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
    const exists = await this.rentabilitasService.findByYearQuarter(
      year,
      quarter,
    );
    return { exists: !!exists, data: exists };
  }

  // === HELPER METHODS ===

  private async getRentabilitasByIdOrThrow(rentabilitasId: number) {
    const rentabilitas =
      await this.rentabilitasService.findById(rentabilitasId);

    if (!rentabilitas) {
      throw new NotFoundException(
        `Data dengan ID ${rentabilitasId} tidak ditemukan`,
      );
    }

    return rentabilitas;
  }
}