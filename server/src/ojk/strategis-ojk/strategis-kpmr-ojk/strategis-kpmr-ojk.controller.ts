import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  BadRequestException,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

// PERBAIKAN: Import service dengan path yang benar
import { KpmrStrategisService } from './strategis-kpmr-ojk.service';

import {
  CreateKpmrStrategisOjkDto,
  CreateKpmrAspekStrategisDto,
  CreateKpmrPertanyaanStrategisDto,
  UpdateKpmrAspekStrategisDto,
  UpdateKpmrStrategisOjkDto,
  UpdateKpmrPertanyaanStrategisDto,
  UpdateSkorDto,
  UpdateSummaryDto,
  BulkUpdateSkorDto,
  ReorderAspekDto,
  ReorderPertanyaanDto,
  FrontendAspekResponseDto,
  FrontendKpmrResponseDto,
  FrontendPertanyaanResponseDto,
} from './dto/strategis-kpmr.dto';

@ApiTags('StrategisKpmr')
@Controller('kpmr-strategis')
@UseInterceptors(ClassSerializerInterceptor)
export class KpmrStrategisController {
  constructor(private readonly kpmrService: KpmrStrategisService) {}

  // ========== KPMR ENDPOINTS ==========
  @Post()
  @ApiOperation({ summary: 'Buat KPMR baru' })
  async create(
    @Body() createDto: CreateKpmrStrategisOjkDto,
    @Request() req, // ✅ TAMBAHKAN REQUEST
  ): Promise<FrontendKpmrResponseDto> {
    const userId = req.user?.id || 'system'; // ✅ AMBIL USER ID
    return this.kpmrService.createKpmr(createDto, userId); // ✅ KIRIM 2 PARAMETER!
  }

  @Get()
  @ApiOperation({ summary: 'Get semua KPMR dengan filter' })
  async findAll(
    @Query('year') year?: string,
    @Query('quarter') quarter?: string,
    @Query('isActive') isActive?: string,
    @Query('isLocked') isLocked?: string,
    @Query('search') search?: string,
    @Query('withRelations') withRelations?: string,
  ): Promise<FrontendKpmrResponseDto[]> {
    const filter: any = {};

    if (year && year.trim() !== '') {
      const parsedYear = parseInt(year, 10);
      if (!isNaN(parsedYear)) {
        filter.year = parsedYear;
      }
    }

    if (quarter && quarter.trim() !== '') {
      const parsedQuarter = parseInt(quarter, 10);
      if (!isNaN(parsedQuarter) && parsedQuarter >= 1 && parsedQuarter <= 4) {
        filter.quarter = parsedQuarter;
      }
    }

    if (isActive && isActive.trim() !== '') {
      filter.isActive =
        isActive === 'true' || isActive === '1' || isActive === 'on';
    }

    if (isLocked && isLocked.trim() !== '') {
      filter.isLocked =
        isLocked === 'true' || isLocked === '1' || isLocked === 'on';
    }

    if (withRelations && withRelations.trim() !== '') {
      filter.withRelations =
        withRelations === 'true' ||
        withRelations === '1' ||
        withRelations === 'on';
    }

    if (search && search.trim() !== '') {
      filter.search = search;
    }

    return this.kpmrService.findAll(filter);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get KPMR aktif saat ini' })
  async getActive(): Promise<FrontendKpmrResponseDto | null> {
    return this.kpmrService.getActiveKpmr();
  }

  @Get(':year/:quarter')
  @ApiOperation({ summary: 'Get KPMR berdasarkan tahun dan quarter' })
  async findByYearQuarter(
    @Param('year') year: string,
    @Param('quarter') quarter: string,
  ): Promise<FrontendKpmrResponseDto> {
    const yearNum = parseInt(year, 10);
    const quarterNum = parseInt(quarter, 10);

    if (isNaN(yearNum) || isNaN(quarterNum)) {
      throw new BadRequestException('Year dan quarter harus berupa angka');
    }

    if (quarterNum < 1 || quarterNum > 4) {
      throw new BadRequestException('Quarter harus antara 1 dan 4');
    }

    return this.kpmrService.findByYearQuarter(yearNum, quarterNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get KPMR by ID' })
  async findOne(@Param('id') id: string): Promise<FrontendKpmrResponseDto> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }
    return this.kpmrService.findOne(idNum);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update KPMR' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateKpmrStrategisOjkDto,
  ): Promise<FrontendKpmrResponseDto> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }
    return this.kpmrService.updateKpmr(idNum, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus KPMR' })
  async remove(@Param('id') id: string): Promise<void> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }
    await this.kpmrService.deleteKpmr(idNum);
  }

  @Post(':id/lock')
  @ApiOperation({ summary: 'Kunci KPMR' })
  async lockKpmr(
    @Param('id') id: string,
    @Body('lockedBy') lockedBy: string,
  ): Promise<FrontendKpmrResponseDto> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }
    if (!lockedBy) {
      throw new BadRequestException('lockedBy harus diisi');
    }
    return this.kpmrService.lockKpmr(idNum, lockedBy);
  }

  @Post(':id/unlock')
  @ApiOperation({ summary: 'Buka kunci KPMR' })
  async unlockKpmr(
    @Param('id') id: string,
    @Body('unlockedBy') unlockedBy?: string,
  ): Promise<FrontendKpmrResponseDto> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }
    return this.kpmrService.unlockKpmr(idNum, unlockedBy);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplikasi KPMR' })
  async duplicate(
    @Param('id') id: string,
    @Body('year') year: number,
    @Body('quarter') quarter: number,
    @Body('createdBy') createdBy?: string,
    @Body('copyScores') copyScores?: boolean,
  ): Promise<FrontendKpmrResponseDto> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }

    if (!year || !quarter) {
      throw new BadRequestException('Year dan quarter harus diisi');
    }

    return this.kpmrService.duplicateKpmr(
      idNum,
      year,
      quarter,
      createdBy,
      copyScores || false,
    );
  }

  // ========== SUMMARY ENDPOINTS ==========
  @Get(':id/summary')
  @ApiOperation({ summary: 'Get summary KPMR' })
  async getSummary(@Param('id') id: string): Promise<UpdateSummaryDto> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }
    return this.kpmrService.getSummary(idNum);
  }

  @Patch(':id/summary')
  @ApiOperation({ summary: 'Update summary KPMR' })
  async updateSummary(
    @Param('id') id: string,
    @Body() updateDto: UpdateSummaryDto,
  ): Promise<UpdateSummaryDto> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }
    return this.kpmrService.updateSummary(idNum, updateDto);
  }

  // ========== ASPEK ENDPOINTS ==========
  @Post(':kpmrId/aspek')
  @ApiOperation({ summary: 'Tambah aspek baru' })
  async createAspek(
    @Param('kpmrId') kpmrId: string,
    @Body() createDto: CreateKpmrAspekStrategisDto,
  ): Promise<FrontendAspekResponseDto> {
    const kpmrIdNum = parseInt(kpmrId, 10);
    if (isNaN(kpmrIdNum)) {
      throw new BadRequestException('kpmrId harus berupa angka');
    }

    // ✅ LOG BUAT DEBUG
    console.log(`📝 Creating aspek for KPMR ${kpmrIdNum}:`, {
      judul: createDto.judul,
      bobot: createDto.bobot,
      nomor: createDto.nomor,
    });

    return this.kpmrService.createAspek(kpmrIdNum, createDto);
  }

  @Patch('aspek/:id')
  @ApiOperation({ summary: 'Update aspek' })
  async updateAspek(
    @Param('id') id: string,
    @Body() updateDto: UpdateKpmrAspekStrategisDto,
  ): Promise<FrontendAspekResponseDto> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }
    return this.kpmrService.updateAspek(idNum, updateDto);
  }

  @Delete('aspek/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus aspek' })
  async removeAspek(@Param('id') id: string): Promise<void> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }
    await this.kpmrService.deleteAspek(idNum);
  }

  @Post(':kpmrId/aspek/reorder')
  @ApiOperation({ summary: 'Reorder aspek' })
  async reorderAspek(
    @Param('kpmrId') kpmrId: string,
    @Body() reorderDto: ReorderAspekDto,
  ): Promise<void> {
    const kpmrIdNum = parseInt(kpmrId, 10);
    if (isNaN(kpmrIdNum)) {
      throw new BadRequestException('kpmrId harus berupa angka');
    }
    await this.kpmrService.reorderAspek(kpmrIdNum, reorderDto);
  }

  // ========== PERTANYAAN ENDPOINTS ==========
  @Post('aspek/:aspekId/pertanyaan')
  @ApiOperation({ summary: 'Tambah pertanyaan baru' })
  async createPertanyaan(
    @Param('aspekId') aspekId: string,
    @Body() createDto: CreateKpmrPertanyaanStrategisDto,
  ): Promise<FrontendPertanyaanResponseDto> {
    const aspekIdNum = parseInt(aspekId, 10);
    if (isNaN(aspekIdNum)) {
      throw new BadRequestException('aspekId harus berupa angka');
    }
    return this.kpmrService.createPertanyaan(aspekIdNum, createDto);
  }

  @Patch('pertanyaan/:id')
  @ApiOperation({ summary: 'Update pertanyaan' })
  async updatePertanyaan(
    @Param('id') id: string,
    @Body() updateDto: UpdateKpmrPertanyaanStrategisDto,
  ): Promise<FrontendPertanyaanResponseDto> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }
    return this.kpmrService.updatePertanyaan(idNum, updateDto);
  }

  @Get(':kpmrId/aspek')
  @ApiOperation({ summary: 'Get semua aspek untuk KPMR tertentu' })
  async findAllAspek(
    @Param('kpmrId') kpmrId: string,
  ): Promise<FrontendAspekResponseDto[]> {
    const kpmrIdNum = parseInt(kpmrId, 10);
    if (isNaN(kpmrIdNum)) {
      throw new BadRequestException('kpmrId harus berupa angka');
    }

    return this.kpmrService.findAllAspek(kpmrIdNum);
  }

  @Get('aspek/:id')
  @ApiOperation({ summary: 'Get detail aspek by ID' })
  async findOneAspek(
    @Param('id') id: string,
  ): Promise<FrontendAspekResponseDto> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }

    return this.kpmrService.findOneAspek(idNum);
  }

  @Patch('pertanyaan/:id/skor')
  @ApiOperation({ summary: 'Update skor pertanyaan' })
  async updateSkor(
    @Param('id') id: string,
    @Body() updateSkorDto: UpdateSkorDto,
  ): Promise<FrontendPertanyaanResponseDto> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }
    return this.kpmrService.updateSkor(idNum, updateSkorDto);
  }

  @Post('pertanyaan/bulk-skor')
  @ApiOperation({ summary: 'Bulk update skor' })
  async bulkUpdateSkor(@Body() bulkDto: BulkUpdateSkorDto): Promise<void> {
    if (!bulkDto.updates || bulkDto.updates.length === 0) {
      throw new BadRequestException('Updates tidak boleh kosong');
    }
    await this.kpmrService.bulkUpdateSkor(bulkDto);
  }

  @Delete('pertanyaan/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus pertanyaan' })
  async removePertanyaan(@Param('id') id: string): Promise<void> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }
    await this.kpmrService.deletePertanyaan(idNum);
  }

  @Post('aspek/:aspekId/pertanyaan/reorder')
  @ApiOperation({ summary: 'Reorder pertanyaan' })
  async reorderPertanyaan(
    @Param('aspekId') aspekId: string,
    @Body() reorderDto: ReorderPertanyaanDto,
  ): Promise<void> {
    const aspekIdNum = parseInt(aspekId, 10);
    if (isNaN(aspekIdNum)) {
      throw new BadRequestException('aspekId harus berupa angka');
    }
    await this.kpmrService.reorderPertanyaan(aspekIdNum, reorderDto);
  }

  // ========== UTILITY ENDPOINTS ==========
  @Get(':id/validate')
  @ApiOperation({ summary: 'Validasi data KPMR' })
  async validateKpmr(
    @Param('id') id: string, // ✅ TERIMA ID, BUKAN YEAR/QUARTER!
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }


    return this.kpmrService.validateKpmrData(idNum);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get statistics KPMR' })
  async getStatistics(@Param('id') id: string): Promise<any> {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new BadRequestException('ID harus berupa angka');
    }

    // ✅ PANGGIL METHOD YANG BARU
    return this.kpmrService.getKpmrStatistics(idNum);
  }
}