// rekap/rekap.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RekapService } from './rekap-data.service';
import {
  GetAllRekapDto,
  UpdateNilaiValueDto,
  RekapDataResponseDto,
  UpdateNilaiResponseDto,
} from './dto/rekap-data.dto';

@ApiTags('Rekap Data')
@Controller('rekap')
@UseInterceptors(ClassSerializerInterceptor)
export class RekapController {
  constructor(private readonly rekapService: RekapService) {}

  // ========== GET ALL DATA ==========
  @Get()
  @ApiOperation({ summary: 'Get all rekap data from all categories' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'quarter', required: false, type: Number })
  @ApiQuery({
    name: 'categories',
    required: false,
    type: String,
    description: 'Comma separated category IDs',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'model',
    required: false,
    type: String,
    enum: ['', 'tanpa_model', 'open_end', 'terstruktur'],
  })
  @ApiQuery({
    name: 'prinsip',
    required: false,
    type: String,
    enum: ['', 'syariah', 'konvensional'],
  })
  @ApiQuery({ name: 'jenis', required: false, type: String })
  @ApiQuery({
    name: 'underlying',
    required: false,
    type: String,
    description: 'Comma separated underlying values',
  })
  @ApiResponse({
    status: 200,
    description: 'Data retrieved successfully',
    type: RekapDataResponseDto,
  })
  async getAllRekapData(
    @Query() query: GetAllRekapDto,
  ): Promise<RekapDataResponseDto> {
    return this.rekapService.getAllRekapData(query);
  }

  // ========== GET AVAILABLE CATEGORIES ==========
  @Get('meta/categories')
  @ApiOperation({ summary: 'Get list of available categories' })
  async getAvailableCategories() {
    return {
      success: true,
      data: this.rekapService.getAvailableCategories(),
    };
  }

  // ========== GET SINGLE CATEGORY ==========
  @Get(':categoryId')
  @ApiOperation({ summary: 'Get rekap data for single category' })
  @ApiParam({ name: 'categoryId', type: String, description: 'Category ID' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'quarter', required: false, type: Number })
  async getCategoryData(
    @Param('categoryId') categoryId: string,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('quarter', new ParseIntPipe({ optional: true })) quarter?: number,
  ) {
    const data = await this.rekapService.getCategoryData(
      categoryId,
      year,
      quarter,
    );
    return {
      success: true,
      data,
      categoryId,
      message: `Data untuk kategori ${categoryId} berhasil dimuat`,
    };
  }

  // ========== UPDATE NILAI VALUE ==========
  @Put('nilai')
  @ApiOperation({
    summary: 'Update nilai value (save changes from rekap table)',
  })
  @ApiBody({ type: UpdateNilaiValueDto })
  @ApiResponse({
    status: 200,
    description: 'Nilai updated successfully',
    type: UpdateNilaiResponseDto,
  })
  async updateNilaiValue(
    @Body() dto: UpdateNilaiValueDto,
  ): Promise<UpdateNilaiResponseDto> {
    if (!dto.categoryId || !dto.paramId || !dto.itemId) {
      throw new BadRequestException(
        'categoryId, paramId, dan itemId wajib diisi',
      );
    }

    return this.rekapService.updateNilaiValue(dto);
  }
}
