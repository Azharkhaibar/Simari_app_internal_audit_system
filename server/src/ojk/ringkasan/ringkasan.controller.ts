// src/modules/ringkasan/ringkasan.controller.ts

import {
  Controller,
  Get,
  Query,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RingkasanService } from './ringkasan.service';
import { RingkasanQueryDto, PageDataDto } from './dto/ringkasan.dto';

@Controller('ringkasan') // ✅ HAPUS "api/" karena sudah ada prefix "api/v1"
export class RingkasanController {
  private readonly logger = new Logger(RingkasanController.name);

  constructor(private readonly ringkasanService: RingkasanService) {}

  @Get()
  async getRingkasan(
    @Query('year') year: string,
    @Query('quarter') quarter: string,
    @Query('categoryIds') categoryIds: string,
    @Query('model') model?: string,
    @Query('prinsip') prinsip?: string,
    @Query('jenis') jenis?: string,
    @Query('underlying') underlying?: string,
  ): Promise<PageDataDto[]> {
    try {
      // Validasi required params
      if (!year || !quarter || !categoryIds) {
        throw new HttpException(
          'Parameter year, quarter, dan categoryIds wajib diisi',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Parse dan validasi year
      const parsedYear = parseInt(year, 10);
      if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
        throw new HttpException(
          'Parameter year tidak valid',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Parse dan validasi quarter
      const parsedQuarter = parseInt(quarter, 10);
      if (isNaN(parsedQuarter) || parsedQuarter < 1 || parsedQuarter > 4) {
        throw new HttpException(
          'Parameter quarter tidak valid (1-4)',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Parse categoryIds dari comma-separated string ke array
      const parsedCategoryIds = categoryIds
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      if (parsedCategoryIds.length === 0) {
        throw new HttpException(
          'Parameter categoryIds tidak boleh kosong',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Parse underlying dari comma-separated string ke array (jika ada)
      const parsedUnderlying = underlying
        ? underlying
            .split(',')
            .map((u) => u.trim())
            .filter((u) => u.length > 0)
        : undefined;

      // Build query DTO
      const query: RingkasanQueryDto = {
        year: parsedYear,
        quarter: parsedQuarter,
        categoryIds: parsedCategoryIds,
        model: model || undefined,
        prinsip: prinsip || undefined,
        jenis: jenis || undefined,
        underlying: parsedUnderlying,
      };

      this.logger.log(
        `Fetching ringkasan - Year: ${parsedYear}, Quarter: ${parsedQuarter}, Categories: ${parsedCategoryIds.join(', ')}`,
      );

      if (query.model) {
        this.logger.log(`Filter Model: ${query.model}`);
      }
      if (query.prinsip) {
        this.logger.log(`Filter Prinsip: ${query.prinsip}`);
      }
      if (query.jenis) {
        this.logger.log(`Filter Jenis: ${query.jenis}`);
      }
      if (query.underlying && query.underlying.length > 0) {
        this.logger.log(`Filter Underlying: ${query.underlying.join(', ')}`);
      }

      const data = await this.ringkasanService.getRingkasan(query);

      this.logger.log(
        `Successfully fetched ${data.length} categories for ringkasan`,
      );

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Error in getRingkasan: ${error.message}`, error.stack);

      throw new HttpException(
        'Terjadi kesalahan saat mengambil data ringkasan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
