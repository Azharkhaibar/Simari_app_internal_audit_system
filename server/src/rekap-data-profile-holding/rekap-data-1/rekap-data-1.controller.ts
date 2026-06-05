// src/rekap-data-1/rekap-data-1.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RekapData1Service, RekapDataResponse } from './rekap-data-1.service'; // ✅ Import interface
import {
  SaveBhzDto,
  SaveBvtDto,
  SaveRekapResultDto,
} from './dto/rekapdata1.dto';
import { BhzConfig } from './entities/bhz-config.entity';
import { BvtConfig } from './entities/bvt-config.entity';
import { RekapResult } from './entities/rekap-result.entity';

@Controller('rekap-data-1')
export class RekapData1Controller {
  constructor(private readonly rekapData1Service: RekapData1Service) {}

  @Get('all')
  async getAllData(
    @Query('year') year: string,
    @Query('quarter') quarter: string,
  ): Promise<RekapDataResponse> {
    return this.rekapData1Service.getAllRekapData(+year, quarter);
  }

  @Get('bhz')
  async getBhz(
    @Query('year') year: string,
    @Query('quarter') quarter: string,
  ): Promise<BhzConfig | null> {
    return this.rekapData1Service.getBhz(+year, quarter);
  }

  @Post('bhz')
  @HttpCode(HttpStatus.OK)
  async saveBhz(@Body() dto: SaveBhzDto): Promise<BhzConfig> {
    return this.rekapData1Service.saveBhz(dto);
  }

  @Get('bvt')
  async getBvt(
    @Query('year') year: string,
    @Query('quarter') quarter: string,
  ): Promise<BvtConfig | null> {
    return this.rekapData1Service.getBvt(+year, quarter);
  }

  @Post('bvt')
  @HttpCode(HttpStatus.OK)
  async saveBvt(@Body() dto: SaveBvtDto): Promise<BvtConfig> {
    return this.rekapData1Service.saveBvt(dto);
  }

  @Get('result')
  async getResult(
    @Query('year') year: string,
    @Query('quarter') quarter: string,
  ): Promise<RekapResult | null> {
    return this.rekapData1Service.getResult(+year, quarter);
  }

  @Post('result')
  @HttpCode(HttpStatus.OK)
  async saveResult(@Body() dto: SaveRekapResultDto): Promise<RekapResult> {
    return this.rekapData1Service.saveResult(dto);
  }
}
