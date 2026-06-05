// src/modules/ringkasan/ringkasan.controller.ts
import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { RingkasanService } from './ringkasan.service';
import { GetRingkasanDto, RingkasanResponseDto } from './dto/ringkasan.dto';

@Controller('ringkasan')
export class RingkasanController {
  constructor(private readonly ringkasanService: RingkasanService) {}

  @Get('all')
  async getRingkasanData(
    @Query(new ValidationPipe({ transform: true })) query: GetRingkasanDto,
  ): Promise<RingkasanResponseDto> {
    return this.ringkasanService.getRingkasanData(query);
  }
}