// src/modules/rekap-data/rekap-data.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RekapDataService } from './rekap-data.service';
import {
  GetRekapDataDto,
  GetTahunanDataDto,
  UpdateRekapRowDto,
  RiskSource,
  RekapDataResponseDto,
  ImportResponseDto,
} from './dto/rekap-data.dto';

// Type untuk file upload
interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Controller('rekap-data')
export class RekapDataController {
  constructor(private readonly rekapDataService: RekapDataService) {}

  // ===================== GET ALL TRIWULAN DATA =====================
  @Get('triwulan/all')
  async getAllTriwulanData(
    @Query(new ValidationPipe({ transform: true })) query: GetRekapDataDto,
  ): Promise<RekapDataResponseDto> {
    return this.rekapDataService.getAllTriwulanData(query);
  }

  // ===================== GET ALL TAHUNAN DATA =====================
  @Get('tahunan/all')
  async getAllTahunanData(
    @Query(new ValidationPipe({ transform: true })) query: GetTahunanDataDto,
  ): Promise<any> {
    return this.rekapDataService.getAllTahunanData(query.year);
  }

  // ===================== UPDATE ROW =====================
  @Post('update')
  @HttpCode(HttpStatus.OK)
  async updateRow(
    @Body(new ValidationPipe({ transform: true })) dto: UpdateRekapRowDto,
  ): Promise<any> {
    return this.rekapDataService.updateRow(dto);
  }

  // ===================== IMPORT EXCEL =====================
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile() file: MulterFile,
    @Body('year') year: string,
    @Body('quarter') quarter: string,
  ): Promise<ImportResponseDto> {
    return this.rekapDataService.importExcel(file, parseInt(year), quarter);
  }

  // ===================== GET SECTIONS (FOR FILTER) =====================
  @Get('sections/:source')
  async getSections(
    @Param('source') source: RiskSource,
    @Query('year') year: string,
    @Query('quarter') quarter: string,
  ): Promise<string[]> {
    return this.rekapDataService.getSections(source, parseInt(year), quarter);
  }

  // ===================== CLEANUP DUPLICATES =====================
  @Delete('cleanup')
  async cleanupDuplicates(
    @Query('year') year: string,
    @Query('quarter') quarter: string,
  ): Promise<{ removed: number }> {
    return this.rekapDataService.cleanupDuplicates(parseInt(year), quarter);
  }
}