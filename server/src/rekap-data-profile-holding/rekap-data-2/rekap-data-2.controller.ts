// src/modules/rekap-data2/rekap-data2.controller.ts
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
import { RekapData2Service } from './rekap-data-2.service';
import {
  GetRekapData2Dto,
  GetTahunanData2Dto,
  UpdateRekapData2RowDto,
  RiskSource,
  RekapData2ResponseDto,
  DashboardDataResponseDto,
} from './dto/rekap-data-2.dto';

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Controller('rekap-data2')
export class RekapData2Controller {
  constructor(private readonly rekapData2Service: RekapData2Service) {}

  // ===================== GET ALL TRIWULAN DATA (DETAIL VIEW) =====================
  @Get('triwulan/all')
  async getAllTriwulanData(
    @Query(new ValidationPipe({ transform: true })) query: GetRekapData2Dto,
  ): Promise<RekapData2ResponseDto> {
    return this.rekapData2Service.getAllTriwulanData(query);
  }

  // ===================== GET ALL TAHUNAN DATA =====================
  @Get('tahunan/all')
  async getAllTahunanData(
    @Query(new ValidationPipe({ transform: true })) query: GetTahunanData2Dto,
  ): Promise<any> {
    return this.rekapData2Service.getAllTahunanData(query.year);
  }

  // ===================== GET DASHBOARD DATA =====================
  @Get('dashboard')
  async getDashboardData(
    @Query(new ValidationPipe({ transform: true })) query: GetRekapData2Dto,
  ): Promise<DashboardDataResponseDto> {
    return this.rekapData2Service.getDashboardData(query);
  }

  // ===================== UPDATE ROW =====================
  @Post('update')
  @HttpCode(HttpStatus.OK)
  async updateRow(
    @Body(new ValidationPipe({ transform: true })) dto: UpdateRekapData2RowDto,
  ): Promise<any> {
    return this.rekapData2Service.updateRow(dto);
  }

  // ===================== IMPORT EXCEL =====================
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile() file: MulterFile,
    @Body('year') year: string,
    @Body('quarter') quarter: string,
  ): Promise<any> {
    return this.rekapData2Service.importExcel(file, parseInt(year), quarter);
  }

  // ===================== GET SECTIONS (FOR FILTER) =====================
  @Get('sections/:source')
  async getSections(
    @Param('source') source: RiskSource,
    @Query('year') year: string,
    @Query('quarter') quarter: string,
  ): Promise<string[]> {
    return this.rekapData2Service.getSections(source, parseInt(year), quarter);
  }

  // ===================== CLEANUP DUPLICATES =====================
  @Delete('cleanup')
  async cleanupDuplicates(
    @Query('year') year: string,
    @Query('quarter') quarter: string,
  ): Promise<{ removed: number }> {
    return this.rekapData2Service.cleanupDuplicates(parseInt(year), quarter);
  }
}
