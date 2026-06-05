// tatakelola-kpmr-ojk.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import {
  CreateKpmrTatakelolaOjkDto,
  CreateKpmrAspekTatakelolaDto,
  CreateKpmrPertanyaanTatakelolaDto,
  UpdateKpmrAspekTatakelolaDto,
  UpdateKpmrTatakelolaOjkDto,
  ReorderAspekDto,
  ReorderPertanyaanDto,
  UpdateKpmrPertanyaanTatakelolaDto,
  UpdateSkorDto,
  UpdateSummaryDto,
  BulkUpdateSkorDto,
  FrontendAspekResponseDto,
  FrontendKpmrResponseDto,
  FrontendPertanyaanResponseDto,
} from './dto/tatakelola-kpmr.dto';

import { KpmrPertanyaanTatakelola } from './entities/tatakelola-kpmr-pertanyaan.entity';
import { KpmrTatakelolaOjk } from './entities/tatakelola-kpmr-ojk.entity';
import { KpmrAspekTatakelola } from './entities/tatakelola-kpmr-aspek.entity';

@Injectable()
export class TatakelolaKpmrService {
  private readonly logger = new Logger(TatakelolaKpmrService.name);
  private readonly MAX_BOBOT_TOTAL = 100;
  private readonly BOBOT_TOLERANCE = 0.01;

  constructor(
    @InjectRepository(KpmrTatakelolaOjk)
    private readonly kpmrRepository: Repository<KpmrTatakelolaOjk>,

    @InjectRepository(KpmrAspekTatakelola)
    private readonly aspekRepository: Repository<KpmrAspekTatakelola>,

    @InjectRepository(KpmrPertanyaanTatakelola)
    private readonly pertanyaanRepository: Repository<KpmrPertanyaanTatakelola>,

    private readonly dataSource: DataSource,
  ) {}

  // =========================================================================
  // PRIVATE UTILITY METHODS
  // =========================================================================

  private validateQuarter(quarter: number): void {
    if (quarter < 1 || quarter > 4) {
      throw new BadRequestException(
        `Quarter harus antara 1-4, received: ${quarter}`,
      );
    }
  }

  private validateSkor(skor: number): void {
    if (skor === undefined || skor === null) return;
    if (skor < 1 || skor > 5 || !Number.isInteger(skor)) {
      throw new BadRequestException(`Skor harus antara 1-5, received: ${skor}`);
    }
  }

  private validateBobot(bobot: number): void {
    if (bobot < 0 || bobot > 100) {
      throw new BadRequestException(
        `Bobot harus antara 0-100, received: ${bobot}`,
      );
    }
  }

  private validateYear(year: number): void {
    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 10) {
      throw new BadRequestException(
        `Tahun harus antara 2000-${currentYear + 10}, received: ${year}`,
      );
    }
  }

  private async getKpmrWithRelations(id: number): Promise<KpmrTatakelolaOjk> {
    const kpmr = await this.kpmrRepository.findOne({
      where: { id },
      relations: ['aspekList', 'aspekList.pertanyaanList'],
      order: {
        aspekList: {
          orderIndex: 'ASC',
          pertanyaanList: {
            orderIndex: 'ASC',
          },
        },
      },
    });

    if (!kpmr) {
      this.logger.error(`❌ KPMR dengan ID ${id} TIDAK DITEMUKAN!`);
      throw new NotFoundException(`KPMR dengan ID ${id} tidak ditemukan`);
    }

    return kpmr;
  }

  private async getKpmrEntity(id: number): Promise<KpmrTatakelolaOjk> {
    const kpmr = await this.kpmrRepository.findOne({
      where: { id },
    });

    if (!kpmr) {
      this.logger.error(`❌ KPMR dengan ID ${id} TIDAK DITEMUKAN!`);
      throw new NotFoundException(`KPMR dengan ID ${id} tidak ditemukan`);
    }

    return kpmr;
  }

  private async getAspekWithRelations(
    id: number,
  ): Promise<KpmrAspekTatakelola> {
    const aspek = await this.aspekRepository.findOne({
      where: { id },
      relations: ['kpmrOjk', 'pertanyaanList'],
    });

    if (!aspek) {
      throw new NotFoundException(`Aspek dengan ID ${id} tidak ditemukan`);
    }

    return aspek;
  }

  private async getAspekEntity(id: number): Promise<KpmrAspekTatakelola> {
    const aspek = await this.aspekRepository.findOne({
      where: { id },
    });

    if (!aspek) {
      throw new NotFoundException(`Aspek dengan ID ${id} tidak ditemukan`);
    }

    return aspek;
  }

  private async getPertanyaanWithRelations(
    id: number,
  ): Promise<KpmrPertanyaanTatakelola> {
    const pertanyaan = await this.pertanyaanRepository.findOne({
      where: { id },
      relations: ['aspek', 'aspek.kpmrOjk'],
    });

    if (!pertanyaan) {
      throw new NotFoundException(`Pertanyaan dengan ID ${id} tidak ditemukan`);
    }

    return pertanyaan;
  }

  private async getPertanyaanEntity(
    id: number,
  ): Promise<KpmrPertanyaanTatakelola> {
    const pertanyaan = await this.pertanyaanRepository.findOne({
      where: { id },
    });

    if (!pertanyaan) {
      throw new NotFoundException(`Pertanyaan dengan ID ${id} tidak ditemukan`);
    }

    return pertanyaan;
  }

  private checkKpmrLocked(kpmr: KpmrTatakelolaOjk, action: string): void {
    if (kpmr.isLocked) {
      throw new BadRequestException(`KPMR terkunci, tidak dapat ${action}`);
    }
  }

  private async validateTotalBobot(
    kpmrId: number,
    newBobot: number,
    excludeAspekId?: number,
  ): Promise<void> {
    const query = this.aspekRepository
      .createQueryBuilder('aspek')
      .select('SUM(aspek.bobot)', 'total')
      .where('aspek.kpmrOjkId = :kpmrId', { kpmrId });

    if (excludeAspekId) {
      query.andWhere('aspek.id != :excludeId', { excludeId: excludeAspekId });
    }

    const result = await query.getRawOne();
    const currentTotal = parseFloat(result?.total) || 0;
    const newTotal = currentTotal + newBobot;

    if (newTotal > this.MAX_BOBOT_TOTAL + this.BOBOT_TOLERANCE) {
      const remaining = Math.max(0, this.MAX_BOBOT_TOTAL - currentTotal);
      throw new BadRequestException(
        `Total bobot aspek melebihi ${this.MAX_BOBOT_TOTAL}%. ` +
          `Sisa bobot tersedia: ${remaining.toFixed(2)}%`,
      );
    }
  }

  private async reorderRemainingAspek(kpmrId: number): Promise<void> {
    const aspekList = await this.aspekRepository.find({
      where: { kpmrOjkId: kpmrId },
      order: { orderIndex: 'ASC' },
    });

    if (aspekList.length === 0) return;

    await this.dataSource.transaction(async (manager) => {
      for (let i = 0; i < aspekList.length; i++) {
        await manager.update(KpmrAspekTatakelola, aspekList[i].id, {
          orderIndex: i,
        });
      }
    });
  }

  private async reorderRemainingPertanyaan(aspekId: number): Promise<void> {
    const pertanyaanList = await this.pertanyaanRepository.find({
      where: { aspekId },
      order: { orderIndex: 'ASC' },
    });

    if (pertanyaanList.length === 0) return;

    await this.dataSource.transaction(async (manager) => {
      for (let i = 0; i < pertanyaanList.length; i++) {
        await manager.update(KpmrPertanyaanTatakelola, pertanyaanList[i].id, {
          orderIndex: i,
        });
      }
    });
  }

  private async getLastAspekOrderIndex(kpmrId: number): Promise<number> {
    const lastAspek = await this.aspekRepository.findOne({
      where: { kpmrOjkId: kpmrId },
      order: { orderIndex: 'DESC' },
    });
    return lastAspek?.orderIndex ?? -1;
  }

  private async getLastPertanyaanOrderIndex(aspekId: number): Promise<number> {
    const lastPertanyaan = await this.pertanyaanRepository.findOne({
      where: { aspekId },
      order: { orderIndex: 'DESC' },
    });
    return lastPertanyaan?.orderIndex ?? -1;
  }

  // =========================================================================
  // RECALCULATE SUMMARY
  // =========================================================================

  async recalculateSummary(kpmrId: number): Promise<void> {
    this.logger.log(`📊 Recalculating summary for KPMR ID: ${kpmrId}`);

    try {
      const kpmr = await this.kpmrRepository.findOne({
        where: { id: kpmrId },
        relations: ['aspekList', 'aspekList.pertanyaanList'],
      });

      if (!kpmr) {
        this.logger.warn(
          `⚠️ KPMR with ID ${kpmrId} not found for summary recalculation`,
        );
        return;
      }

      let totalScore = 0;
      let totalQuestions = 0;

      if (kpmr.aspekList && kpmr.aspekList.length > 0) {
        for (const aspek of kpmr.aspekList) {
          let aspekTotalScore = 0;
          let aspekQuestionCount = 0;

          if (aspek.pertanyaanList && aspek.pertanyaanList.length > 0) {
            for (const pertanyaan of aspek.pertanyaanList) {
              const scores: number[] = [];

              if (
                typeof pertanyaan.skor?.Q1 === 'number' &&
                pertanyaan.skor.Q1 >= 1 &&
                pertanyaan.skor.Q1 <= 5
              ) {
                scores.push(pertanyaan.skor.Q1);
              }
              if (
                typeof pertanyaan.skor?.Q2 === 'number' &&
                pertanyaan.skor.Q2 >= 1 &&
                pertanyaan.skor.Q2 <= 5
              ) {
                scores.push(pertanyaan.skor.Q2);
              }
              if (
                typeof pertanyaan.skor?.Q3 === 'number' &&
                pertanyaan.skor.Q3 >= 1 &&
                pertanyaan.skor.Q3 <= 5
              ) {
                scores.push(pertanyaan.skor.Q3);
              }
              if (
                typeof pertanyaan.skor?.Q4 === 'number' &&
                pertanyaan.skor.Q4 >= 1 &&
                pertanyaan.skor.Q4 <= 5
              ) {
                scores.push(pertanyaan.skor.Q4);
              }

              if (scores.length > 0) {
                const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                aspekTotalScore += avg;
                aspekQuestionCount++;
              }
            }
          }

          const aspekAverageScore =
            aspekQuestionCount > 0
              ? aspekTotalScore / aspekQuestionCount
              : undefined;

          let rating: string | undefined;
          if (aspekAverageScore !== undefined) {
            if (aspekAverageScore >= 4.5) rating = 'Strong';
            else if (aspekAverageScore >= 3.5) rating = 'Satisfactory';
            else if (aspekAverageScore >= 2.5) rating = 'Fair';
            else if (aspekAverageScore >= 1.5) rating = 'Marginal';
            else rating = 'Unsatisfactory';
          }

          await this.aspekRepository.update(aspek.id, {
            averageScore: aspekAverageScore ?? undefined,
            rating: rating ?? undefined,
          });

          totalScore += aspekTotalScore;
          totalQuestions += aspekQuestionCount;
        }
      }

      const averageScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;

      let overallRating: string | undefined;
      if (totalQuestions > 0) {
        if (averageScore >= 4.5) overallRating = 'Strong';
        else if (averageScore >= 3.5) overallRating = 'Satisfactory';
        else if (averageScore >= 2.5) overallRating = 'Fair';
        else if (averageScore >= 1.5) overallRating = 'Marginal';
        else overallRating = 'Unsatisfactory';
      }

      kpmr.summary = {
        totalScore: Number(totalScore.toFixed(2)),
        averageScore: Number(averageScore.toFixed(2)),
        rating: overallRating,
        computedAt: new Date(),
      };

      await this.kpmrRepository.save(kpmr);

      this.logger.log(
        `✅ Summary recalculated for KPMR ID ${kpmrId}: totalScore=${totalScore.toFixed(2)}, averageScore=${averageScore.toFixed(2)}, rating=${overallRating || 'N/A'}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error recalculating summary for KPMR ${kpmrId}: ${error.message}`,
        error.stack,
      );
    }
  }

  // =========================================================================
  // CONVERT TO FRONTEND FORMAT
  // =========================================================================

  private convertToFrontendFormat(
    kpmr: KpmrTatakelolaOjk,
  ): FrontendKpmrResponseDto {
    if (!kpmr) {
      throw new NotFoundException('KPMR tidak ditemukan');
    }

    this.logger.debug(`🔄 Converting KPMR ID ${kpmr.id} to frontend format`);

    if (!kpmr.id) {
      throw new InternalServerErrorException('KPMR tidak memiliki ID');
    }

    const frontendKpmr: any = {
      id: kpmr.id.toString(),
      year: kpmr.year,
      quarter: kpmr.quarter,
      isActive: kpmr.isActive,
      isLocked: kpmr.isLocked,
      version: kpmr.version,
      notes: kpmr.notes,
      summary: kpmr.summary || {
        totalScore: 0,
        averageScore: 0,
        rating: undefined,
        computedAt: new Date(),
      },
      createdAt: kpmr.createdAt,
      updatedAt: kpmr.updatedAt,
      aspekList: [],
    };

    if (
      kpmr.aspekList &&
      Array.isArray(kpmr.aspekList) &&
      kpmr.aspekList.length > 0
    ) {
      this.logger.debug(`📊 Processing ${kpmr.aspekList.length} aspek`);

      frontendKpmr.aspekList = kpmr.aspekList
        .map((aspek) => {
          if (!aspek.id) {
            this.logger.warn('⚠️ Aspek without ID found');
            return null;
          }

          return {
            id: aspek.id.toString(),
            nomor: aspek.nomor || '',
            judul: aspek.judul,
            bobot: aspek.bobot.toString(),
            deskripsi: aspek.deskripsi || '',
            orderIndex: aspek.orderIndex,
            averageScore: aspek.averageScore,
            rating: aspek.rating,
            updatedBy: aspek.updatedBy,
            notes: aspek.notes,
            pertanyaanList: (aspek.pertanyaanList &&
            Array.isArray(aspek.pertanyaanList)
              ? aspek.pertanyaanList
              : []
            ).map((pertanyaan) => ({
              id: pertanyaan.id.toString(),
              nomor: pertanyaan.nomor || '',
              pertanyaan: pertanyaan.pertanyaan,
              skor: {
                Q1: pertanyaan.skor?.Q1 ?? undefined,
                Q2: pertanyaan.skor?.Q2 ?? undefined,
                Q3: pertanyaan.skor?.Q3 ?? undefined,
                Q4: pertanyaan.skor?.Q4 ?? undefined,
              },
              indicator: pertanyaan.indicator || {
                strong: '',
                satisfactory: '',
                fair: '',
                marginal: '',
                unsatisfactory: '',
              },
              evidence: pertanyaan.evidence || '',
              catatan: pertanyaan.catatan || '',
              orderIndex: pertanyaan.orderIndex,
            })),
          };
        })
        .filter((aspek) => aspek !== null);
    }

    try {
      return plainToInstance(FrontendKpmrResponseDto, frontendKpmr);
    } catch (error) {
      this.logger.error(`❌ Error converting to DTO: ${error.message}`);
      throw new InternalServerErrorException('Gagal mengkonversi data KPMR');
    }
  }

  // =========================================================================
  // KPMR CRUD
  // =========================================================================

  async createKpmr(
    createDto: CreateKpmrTatakelolaOjkDto,
    createdBy: string = 'system',
  ): Promise<FrontendKpmrResponseDto> {
    this.logger.log(`📝 Create KPMR: ${createDto.year} Q${createDto.quarter}`);

    this.validateYear(createDto.year);
    this.validateQuarter(createDto.quarter);

    // ✅ HAPUS VALIDASI DUPLICATE - Izinkan multiple KPMR dengan year/quarter sama
    // const exists = await this.isKpmrExists(createDto.year, createDto.quarter);
    // if (exists) {
    //   throw new BadRequestException(
    //     `KPMR untuk tahun ${createDto.year} quarter ${createDto.quarter} sudah ada`,
    //   );
    // }

    const kpmr = this.kpmrRepository.create({
      year: createDto.year,
      quarter: createDto.quarter,
      isActive: createDto.isActive ?? true,
      isLocked: false,
      version: createDto.version || '1.0.0',
      notes:
        createDto.notes ||
        `KPMR Tatakelola ${createDto.year} Q${createDto.quarter}`,
      createdBy: createdBy,
      summary: createDto.summary || {
        totalScore: 0,
        averageScore: 0,
        rating: undefined,
        computedAt: new Date(),
      },
    });

    try {
      const savedKpmr = await this.kpmrRepository.save(kpmr);
      this.logger.log(`✅ KPMR created: ID ${savedKpmr.id}`);

      const kpmrWithRelations = await this.kpmrRepository.findOne({
        where: { id: savedKpmr.id },
        relations: ['aspekList', 'aspekList.pertanyaanList'],
        order: {
          aspekList: {
            orderIndex: 'ASC',
            pertanyaanList: {
              orderIndex: 'ASC',
            },
          },
        },
      });

      if (!kpmrWithRelations) {
        throw new InternalServerErrorException(
          'Gagal mengambil data KPMR setelah create',
        );
      }

      this.logger.log(
        `📊 After create - aspekList length: ${kpmrWithRelations.aspekList?.length || 0}`,
      );

      return this.convertToFrontendFormat(kpmrWithRelations);
    } catch (error) {
      this.logger.error(`❌ Gagal membuat KPMR: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Gagal membuat KPMR');
    }
  }

  async findAll(filter?: {
    year?: number;
    quarter?: number;
    isActive?: boolean;
    isLocked?: boolean;
    search?: string;
    withRelations?: boolean;
  }): Promise<FrontendKpmrResponseDto[]> {
    this.logger.log(`📋 Find all KPMR with filter: ${JSON.stringify(filter)}`);

    const query = this.kpmrRepository
      .createQueryBuilder('kpmr')
      .orderBy('kpmr.year', 'DESC')
      .addOrderBy('kpmr.quarter', 'DESC');

    if (filter?.withRelations) {
      query
        .leftJoinAndSelect('kpmr.aspekList', 'aspek')
        .leftJoinAndSelect('aspek.pertanyaanList', 'pertanyaan')
        .addOrderBy('aspek.orderIndex', 'ASC')
        .addOrderBy('pertanyaan.orderIndex', 'ASC');
    }

    if (filter?.year)
      query.andWhere('kpmr.year = :year', { year: filter.year });
    if (filter?.quarter)
      query.andWhere('kpmr.quarter = :quarter', { quarter: filter.quarter });
    if (filter?.isActive !== undefined)
      query.andWhere('kpmr.isActive = :isActive', {
        isActive: filter.isActive,
      });
    if (filter?.isLocked !== undefined)
      query.andWhere('kpmr.isLocked = :isLocked', {
        isLocked: filter.isLocked,
      });

    if (filter?.search) {
      query.andWhere(
        '(kpmr.notes ILIKE :search OR kpmr.createdBy ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    const kpmrList = await query.getMany();
    this.logger.log(`✅ Found ${kpmrList.length} KPMR`);

    return kpmrList.map((kpmr) => this.convertToFrontendFormat(kpmr));
  }

  async findOne(
    id: number,
    withRelations = true,
  ): Promise<FrontendKpmrResponseDto> {
    this.logger.log(
      `🔍 Find KPMR by ID: ${id}, withRelations: ${withRelations}`,
    );

    let kpmr: KpmrTatakelolaOjk;

    if (withRelations) {
      kpmr = await this.getKpmrWithRelations(id);
    } else {
      kpmr = await this.getKpmrEntity(id);
    }

    return this.convertToFrontendFormat(kpmr);
  }

  async findOneEntity(id: number): Promise<KpmrTatakelolaOjk> {
    return this.getKpmrEntity(id);
  }

  async findByYearQuarter(
    year: number,
    quarter: number,
    withRelations = true,
  ): Promise<FrontendKpmrResponseDto> {
    this.logger.log(
      `🔍 Find KPMR by year/quarter: ${year} Q${quarter}, withRelations: ${withRelations}`,
    );

    this.validateYear(year);
    this.validateQuarter(quarter);

    const query = this.kpmrRepository
      .createQueryBuilder('kpmr')
      .where('kpmr.year = :year', { year })
      .andWhere('kpmr.quarter = :quarter', { quarter });

    if (withRelations) {
      query
        .leftJoinAndSelect('kpmr.aspekList', 'aspek')
        .leftJoinAndSelect('aspek.pertanyaanList', 'pertanyaan')
        .orderBy('aspek.orderIndex', 'ASC')
        .addOrderBy('pertanyaan.orderIndex', 'ASC');
    }

    // ✅ KARENA SEKARANG BISA MULTIPLE, AMBIL YANG PERTAMA (getOne)
    const kpmr = await query.getOne();

    if (!kpmr) {
      throw new NotFoundException(
        `KPMR untuk tahun ${year} quarter ${quarter} tidak ditemukan`,
      );
    }

    this.logger.log(`✅ KPMR found: ID ${kpmr.id}`);
    return this.convertToFrontendFormat(kpmr);
  }

  async updateKpmr(
    id: number,
    updateDto: UpdateKpmrTatakelolaOjkDto,
    updatedBy?: string,
  ): Promise<FrontendKpmrResponseDto> {
    this.logger.log(`📝 Update KPMR ID: ${id}`);

    const kpmr = await this.getKpmrEntity(id);
    this.checkKpmrLocked(kpmr, 'mengupdate KPMR');

    // ✅ HAPUS VALIDASI DUPLICATE
    // if (updateDto.year !== undefined || updateDto.quarter !== undefined) {
    //   const newYear = updateDto.year ?? kpmr.year;
    //   const newQuarter = updateDto.quarter ?? kpmr.quarter;
    //   this.validateYear(newYear);
    //   this.validateQuarter(newQuarter);
    //   const exists = await this.isKpmrExists(newYear, newQuarter, id);
    //   if (exists) {
    //     throw new BadRequestException(...);
    //   }
    // }

    if (updateDto.year !== undefined) kpmr.year = updateDto.year;
    if (updateDto.quarter !== undefined) kpmr.quarter = updateDto.quarter;
    if (updateDto.isActive !== undefined) kpmr.isActive = updateDto.isActive;
    if (updateDto.isLocked !== undefined) kpmr.isLocked = updateDto.isLocked;
    if (updateDto.lockedBy !== undefined) kpmr.lockedBy = updateDto.lockedBy;
    if (updateDto.lockedAt !== undefined) kpmr.lockedAt = updateDto.lockedAt;
    if (updateDto.notes !== undefined) kpmr.notes = updateDto.notes;
    if (updateDto.summary !== undefined) kpmr.summary = updateDto.summary;

    kpmr.updatedBy = updatedBy || 'system';

    try {
      const updatedKpmr = await this.kpmrRepository.save(kpmr);
      this.logger.log(`✅ KPMR updated: ID ${updatedKpmr.id}`);
      return this.convertToFrontendFormat(updatedKpmr);
    } catch (error) {
      this.logger.error(
        `❌ Gagal update KPMR ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Gagal mengupdate KPMR');
    }
  }

  async deleteKpmr(id: number): Promise<void> {
    this.logger.log(`🗑️ Hard Delete KPMR ID: ${id}`);

    const kpmr = await this.getKpmrWithRelations(id);
    this.checkKpmrLocked(kpmr, 'menghapus KPMR');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (kpmr.aspekList?.length) {
        for (const aspek of kpmr.aspekList) {
          if (aspek.pertanyaanList?.length) {
            await queryRunner.manager.delete(KpmrPertanyaanTatakelola, {
              aspekId: aspek.id,
            });
          }
        }
        
        await queryRunner.manager.delete(KpmrAspekTatakelola, {
          kpmrOjkId: id,
        });
      }

      await queryRunner.manager.delete(KpmrTatakelolaOjk, { id });

      await queryRunner.commitTransaction();
      this.logger.log(`✅ KPMR hard deleted: ID ${id}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`❌ Gagal delete KPMR: ${error.message}`);
      throw new InternalServerErrorException('Gagal menghapus KPMR');
    } finally {
      await queryRunner.release();
    }
  }

  async getActiveKpmr(): Promise<FrontendKpmrResponseDto | null> {
    this.logger.log('🔍 Get active KPMR');

    const kpmr = await this.kpmrRepository.findOne({
      where: { isActive: true },
      order: { year: 'DESC', quarter: 'DESC' },
      relations: ['aspekList', 'aspekList.pertanyaanList'],
    });

    if (!kpmr) {
      this.logger.log('⚠️ No active KPMR found');
      return null;
    }

    this.logger.log(
      `✅ Active KPMR: ${kpmr.year} Q${kpmr.quarter} (ID: ${kpmr.id})`,
    );
    return this.convertToFrontendFormat(kpmr);
  }

  async lockKpmr(
    id: number,
    lockedBy: string,
  ): Promise<FrontendKpmrResponseDto> {
    this.logger.log(`🔒 Lock KPMR ID: ${id} by ${lockedBy}`);

    const kpmr = await this.getKpmrEntity(id);

    if (kpmr.isLocked) {
      throw new BadRequestException('KPMR sudah terkunci');
    }

    kpmr.isLocked = true;
    kpmr.lockedAt = new Date();
    kpmr.lockedBy = lockedBy;
    kpmr.updatedBy = lockedBy;

    const updatedKpmr = await this.kpmrRepository.save(kpmr);
    this.logger.log(`✅ KPMR locked: ID ${id}`);

    return this.convertToFrontendFormat(updatedKpmr);
  }

  async unlockKpmr(
    id: number,
    unlockedBy?: string,
  ): Promise<FrontendKpmrResponseDto> {
    this.logger.log(`🔓 Unlock KPMR ID: ${id}`);

    const kpmr = await this.getKpmrEntity(id);

    if (!kpmr.isLocked) {
      throw new BadRequestException('KPMR tidak terkunci');
    }

    kpmr.isLocked = false;
    kpmr.lockedAt = undefined;
    kpmr.lockedBy = undefined;
    kpmr.updatedBy = unlockedBy || 'system';

    const updatedKpmr = await this.kpmrRepository.save(kpmr);
    this.logger.log(`✅ KPMR unlocked: ID ${id}`);

    return this.convertToFrontendFormat(updatedKpmr);
  }

  async duplicateKpmr(
    sourceId: number,
    newYear: number,
    newQuarter: number,
    createdBy?: string,
    copyScores = false,
  ): Promise<FrontendKpmrResponseDto> {
    this.logger.log(
      `📋 Duplicate KPMR ID: ${sourceId} to ${newYear} Q${newQuarter}`,
    );

    this.validateYear(newYear);
    this.validateQuarter(newQuarter);

    const source = await this.getKpmrWithRelations(sourceId);
    this.checkKpmrLocked(source, 'menduplikasi KPMR');

    // ✅ HAPUS VALIDASI DUPLICATE
    // const exists = await this.isKpmrExists(newYear, newQuarter);
    // if (exists) {
    //   throw new BadRequestException(...);
    // }

    const newKpmr = this.kpmrRepository.create({
      year: newYear,
      quarter: newQuarter,
      isActive: true,
      isLocked: false,
      createdBy: createdBy || 'system',
      version: source.version,
      notes: `Duplikasi dari ${source.year} Q${source.quarter}`,
      summary:
        copyScores && source.summary
          ? { ...source.summary, computedAt: new Date() }
          : {
              totalScore: 0,
              averageScore: 0,
              rating: undefined,
              computedAt: new Date(),
            },
    });

    try {
      const savedKpmr = await this.kpmrRepository.save(newKpmr);

      if (source.aspekList?.length) {
        for (const aspek of source.aspekList) {
          const newAspek = this.aspekRepository.create({
            nomor: aspek.nomor,
            judul: aspek.judul,
            bobot: aspek.bobot,
            deskripsi: aspek.deskripsi,
            kpmrOjkId: savedKpmr.id,
            orderIndex: aspek.orderIndex,
            averageScore: undefined,
            rating: undefined,
            updatedBy: aspek.updatedBy,
            notes: aspek.notes,
          });

          const savedAspek = await this.aspekRepository.save(newAspek);

          if (aspek.pertanyaanList?.length) {
            const newPertanyaan = aspek.pertanyaanList.map((pertanyaan) =>
              this.pertanyaanRepository.create({
                nomor: pertanyaan.nomor,
                pertanyaan: pertanyaan.pertanyaan,
                skor: copyScores ? { ...pertanyaan.skor } : {},
                indicator: pertanyaan.indicator,
                evidence: pertanyaan.evidence,
                catatan: pertanyaan.catatan,
                aspekId: savedAspek.id,
                orderIndex: pertanyaan.orderIndex,
              }),
            );

            await this.pertanyaanRepository.save(newPertanyaan);
          }
        }
      }

      await this.recalculateSummary(savedKpmr.id);

      this.logger.log(`✅ KPMR duplicated: New ID ${savedKpmr.id}`);
      return this.findOne(savedKpmr.id, true);
    } catch (error) {
      this.logger.error(
        `❌ Gagal duplicate KPMR: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Gagal menduplikasi KPMR');
    }
  }

  // =========================================================================
  // ASPEK CRUD
  // =========================================================================

  async createAspek(
    kpmrId: number,
    createDto: CreateKpmrAspekTatakelolaDto,
  ): Promise<FrontendAspekResponseDto> {
    try {
      this.logger.log(`🚀 Creating aspek for KPMR ID: ${kpmrId}`);

      if (!kpmrId || isNaN(kpmrId) || kpmrId <= 0) {
        throw new BadRequestException(`Invalid kpmrId: ${kpmrId}`);
      }

      const kpmrOjk = await this.kpmrRepository.findOne({
        where: { id: kpmrId },
      });

      if (!kpmrOjk) {
        throw new NotFoundException(`KPMR with ID ${kpmrId} not found`);
      }

      if (!createDto.judul?.trim()) {
        throw new BadRequestException('Judul aspek tidak boleh kosong');
      }

      if (createDto.bobot < 0 || createDto.bobot > 100) {
        throw new BadRequestException('Bobot harus antara 0-100');
      }

      const aspekData = {
        nomor: createDto.nomor || undefined,
        judul: createDto.judul.trim(),
        bobot: createDto.bobot,
        deskripsi: createDto.deskripsi || undefined,
        kpmrOjkId: kpmrId,
        orderIndex: createDto.orderIndex ?? 0,
        averageScore: createDto.averageScore ?? undefined,
        rating: createDto.rating || undefined,
        updatedBy: createDto.updatedBy || undefined,
        notes: createDto.notes || undefined,
      };

      const aspekEntity = this.aspekRepository.create(aspekData);
      const savedAspek = await this.aspekRepository.save(aspekEntity);

      if (createDto.pertanyaanList?.length) {
        this.logger.log(
          `📝 Creating ${createDto.pertanyaanList.length} pertanyaan`,
        );

        const pertanyaanEntities = createDto.pertanyaanList.map((q) => {
          const pertanyaanData = {
            nomor: q.nomor || undefined,
            pertanyaan: q.pertanyaan,
            skor: q.skor || {},
            indicator: q.indicator || {},
            evidence: q.evidence || undefined,
            catatan: q.catatan || undefined,
            aspekId: savedAspek.id,
            orderIndex: q.orderIndex ?? 0,
          };
          return this.pertanyaanRepository.create(pertanyaanData);
        });

        await this.pertanyaanRepository.save(pertanyaanEntities);
      }

      await this.recalculateSummary(kpmrId);

      const aspekWithRelations = await this.aspekRepository.findOne({
        where: { id: savedAspek.id },
        relations: ['pertanyaanList'],
      });

      if (!aspekWithRelations) {
        throw new InternalServerErrorException(
          'Gagal mengambil data aspek setelah create',
        );
      }

      this.logger.log(`✅ Aspek created: ID ${aspekWithRelations.id}`);

      return {
        id: aspekWithRelations.id.toString(),
        nomor: aspekWithRelations.nomor || '',
        judul: aspekWithRelations.judul,
        bobot: aspekWithRelations.bobot.toString(),
        deskripsi: aspekWithRelations.deskripsi || '',
        orderIndex: aspekWithRelations.orderIndex,
        averageScore: aspekWithRelations.averageScore,
        rating: aspekWithRelations.rating as any,
        pertanyaanList:
          aspekWithRelations.pertanyaanList?.map((q) => ({
            id: q.id.toString(),
            nomor: q.nomor || '',
            pertanyaan: q.pertanyaan,
            skor: {
              Q1: q.skor?.Q1 ?? undefined,
              Q2: q.skor?.Q2 ?? undefined,
              Q3: q.skor?.Q3 ?? undefined,
              Q4: q.skor?.Q4 ?? undefined,
            },
            indicator: q.indicator || {},
            evidence: q.evidence || '',
            catatan: q.catatan || '',
            orderIndex: q.orderIndex,
          })) || [],
      };
    } catch (error) {
      this.logger.error('❌ Error creating aspek:', error);
      throw error;
    }
  }

  async updateAspek(
    id: number,
    updateDto: UpdateKpmrAspekTatakelolaDto,
    updatedBy?: string,
  ): Promise<FrontendAspekResponseDto> {
    this.logger.log(`📝 Update aspek ID: ${id}`);

    const aspek = await this.getAspekWithRelations(id);
    this.checkKpmrLocked(aspek.kpmrOjk, 'mengupdate aspek');

    if (updateDto.bobot !== undefined) {
      this.validateBobot(updateDto.bobot);
      await this.validateTotalBobot(aspek.kpmrOjkId, updateDto.bobot, id);
    }

    if (updateDto.nomor !== undefined) aspek.nomor = updateDto.nomor;
    if (updateDto.judul !== undefined) aspek.judul = updateDto.judul.trim();
    if (updateDto.bobot !== undefined) aspek.bobot = updateDto.bobot;
    if (updateDto.deskripsi !== undefined) aspek.deskripsi = updateDto.deskripsi;
    if (updateDto.orderIndex !== undefined) aspek.orderIndex = updateDto.orderIndex;
    if (updateDto.averageScore !== undefined) aspek.averageScore = updateDto.averageScore;
    if (updateDto.rating !== undefined) aspek.rating = updateDto.rating;
    if (updateDto.notes !== undefined) aspek.notes = updateDto.notes;

    aspek.updatedBy = updatedBy || 'system';

    try {
      const updatedAspek = await this.aspekRepository.save(aspek);
      this.logger.log(`✅ Aspek updated: ID ${updatedAspek.id}`);
      await this.recalculateSummary(aspek.kpmrOjkId);

      return plainToInstance(FrontendAspekResponseDto, {
        id: updatedAspek.id.toString(),
        nomor: updatedAspek.nomor || '',
        judul: updatedAspek.judul,
        bobot: updatedAspek.bobot.toString(),
        deskripsi: updatedAspek.deskripsi || '',
        orderIndex: updatedAspek.orderIndex,
        averageScore: updatedAspek.averageScore,
        rating: updatedAspek.rating,
        updatedBy: updatedAspek.updatedBy,
        notes: updatedAspek.notes,
      });
    } catch (error) {
      this.logger.error(`❌ Gagal update aspek ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Gagal mengupdate aspek');
    }
  }

  async deleteAspek(id: number): Promise<void> {
    this.logger.log(`🗑️ Delete aspek ID: ${id}`);

    const aspek = await this.getAspekWithRelations(id);
    const kpmrId = aspek.kpmrOjkId;
    this.checkKpmrLocked(aspek.kpmrOjk, 'menghapus aspek');

    try {
      await this.aspekRepository.remove(aspek);
      await this.reorderRemainingAspek(kpmrId);
      this.logger.log(`✅ Aspek deleted: ID ${id}`);
      await this.recalculateSummary(kpmrId);
    } catch (error) {
      this.logger.error(`❌ Gagal delete aspek ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Gagal menghapus aspek');
    }
  }

  async reorderAspek(kpmrId: number, reorderDto: ReorderAspekDto): Promise<void> {
    this.logger.log(`🔄 Reorder aspek for KPMR ID: ${kpmrId}`);

    const kpmr = await this.getKpmrEntity(kpmrId);
    this.checkKpmrLocked(kpmr, 'mengubah urutan aspek');

    if (!reorderDto.aspekIds?.length) {
      throw new BadRequestException('Daftar ID aspek tidak boleh kosong');
    }

    const aspekCount = await this.aspekRepository.count({
      where: { id: In(reorderDto.aspekIds), kpmrOjkId: kpmrId },
    });

    if (aspekCount !== reorderDto.aspekIds.length) {
      throw new BadRequestException('Beberapa aspek tidak ditemukan atau bukan milik KPMR ini');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        for (let i = 0; i < reorderDto.aspekIds.length; i++) {
          await manager.update(KpmrAspekTatakelola, reorderDto.aspekIds[i], { orderIndex: i });
        }
      });
      this.logger.log(`✅ Aspek reordered for KPMR ID: ${kpmrId}`);
    } catch (error) {
      this.logger.error(`❌ Gagal reorder aspek: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Gagal mengubah urutan aspek');
    }
  }

  // =========================================================================
  // PERTANYAAN CRUD
  // =========================================================================

  async createPertanyaan(
    aspekId: number,
    createDto: CreateKpmrPertanyaanTatakelolaDto,
  ): Promise<FrontendPertanyaanResponseDto> {
    try {
      this.logger.log(`🚀 Creating pertanyaan for aspek ID: ${aspekId}`);

      if (!aspekId || isNaN(aspekId) || aspekId <= 0) {
        throw new BadRequestException(`Invalid aspekId: ${aspekId}`);
      }

      const aspek = await this.aspekRepository.findOne({ where: { id: aspekId } });

      if (!aspek) {
        throw new NotFoundException(`Aspek with ID ${aspekId} not found`);
      }

      if (!createDto.pertanyaan?.trim()) {
        throw new BadRequestException('Pertanyaan tidak boleh kosong');
      }

      const pertanyaanData = {
        nomor: createDto.nomor || undefined,
        pertanyaan: createDto.pertanyaan.trim(),
        skor: createDto.skor || {},
        indicator: createDto.indicator || {},
        evidence: createDto.evidence || undefined,
        catatan: createDto.catatan || undefined,
        aspekId: aspekId,
        orderIndex: createDto.orderIndex ?? 0,
      };

      const pertanyaanEntity = this.pertanyaanRepository.create(pertanyaanData);
      const savedPertanyaan = await this.pertanyaanRepository.save(pertanyaanEntity);

      this.logger.log(`✅ Pertanyaan created: ID ${savedPertanyaan.id}`);

      if (aspek?.kpmrOjkId) await this.recalculateSummary(aspek.kpmrOjkId);

      return {
        id: savedPertanyaan.id.toString(),
        nomor: savedPertanyaan.nomor || '',
        pertanyaan: savedPertanyaan.pertanyaan,
        skor: {
          Q1: savedPertanyaan.skor?.Q1 ?? undefined,
          Q2: savedPertanyaan.skor?.Q2 ?? undefined,
          Q3: savedPertanyaan.skor?.Q3 ?? undefined,
          Q4: savedPertanyaan.skor?.Q4 ?? undefined,
        },
        indicator: savedPertanyaan.indicator || {},
        evidence: savedPertanyaan.evidence || '',
        catatan: savedPertanyaan.catatan || '',
        orderIndex: savedPertanyaan.orderIndex,
      };
    } catch (error) {
      this.logger.error('❌ Error creating pertanyaan:', error);
      throw error;
    }
  }

  async updatePertanyaan(
    id: number,
    updateDto: UpdateKpmrPertanyaanTatakelolaDto,
  ): Promise<FrontendPertanyaanResponseDto> {
    this.logger.log(`📝 Update pertanyaan ID: ${id}`);

    const pertanyaan = await this.getPertanyaanWithRelations(id);
    this.checkKpmrLocked(pertanyaan.aspek.kpmrOjk, 'mengupdate pertanyaan');

    if (updateDto.skor) {
      if (updateDto.skor.Q1 !== undefined) this.validateSkor(updateDto.skor.Q1);
      if (updateDto.skor.Q2 !== undefined) this.validateSkor(updateDto.skor.Q2);
      if (updateDto.skor.Q3 !== undefined) this.validateSkor(updateDto.skor.Q3);
      if (updateDto.skor.Q4 !== undefined) this.validateSkor(updateDto.skor.Q4);
    }

    if (updateDto.nomor !== undefined) pertanyaan.nomor = updateDto.nomor;
    if (updateDto.pertanyaan !== undefined) pertanyaan.pertanyaan = updateDto.pertanyaan.trim();
    if (updateDto.skor !== undefined) {
      pertanyaan.skor = { ...pertanyaan.skor, ...updateDto.skor };
    }
    if (updateDto.indicator !== undefined) pertanyaan.indicator = updateDto.indicator;
    if (updateDto.evidence !== undefined) pertanyaan.evidence = updateDto.evidence;
    if (updateDto.catatan !== undefined) pertanyaan.catatan = updateDto.catatan;
    if (updateDto.orderIndex !== undefined) pertanyaan.orderIndex = updateDto.orderIndex;

    try {
      const updatedPertanyaan = await this.pertanyaanRepository.save(pertanyaan);
      this.logger.log(`✅ Pertanyaan updated: ID ${updatedPertanyaan.id}`);
      await this.recalculateSummary(pertanyaan.aspek.kpmrOjkId);

      return plainToInstance(FrontendPertanyaanResponseDto, {
        id: updatedPertanyaan.id.toString(),
        nomor: updatedPertanyaan.nomor || '',
        pertanyaan: updatedPertanyaan.pertanyaan,
        skor: {
          Q1: updatedPertanyaan.skor?.Q1 ?? undefined,
          Q2: updatedPertanyaan.skor?.Q2 ?? undefined,
          Q3: updatedPertanyaan.skor?.Q3 ?? undefined,
          Q4: updatedPertanyaan.skor?.Q4 ?? undefined,
        },
        indicator: updatedPertanyaan.indicator,
        evidence: updatedPertanyaan.evidence || '',
        catatan: updatedPertanyaan.catatan || '',
        orderIndex: updatedPertanyaan.orderIndex,
      });
    } catch (error) {
      this.logger.error(`❌ Gagal update pertanyaan ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Gagal mengupdate pertanyaan');
    }
  }

  async updateSkor(id: number, updateSkorDto: UpdateSkorDto): Promise<FrontendPertanyaanResponseDto> {
    this.logger.log(`📝 Update skor pertanyaan ID: ${id}, quarter: ${updateSkorDto.quarter}`);

    const pertanyaan = await this.getPertanyaanWithRelations(id);
    this.checkKpmrLocked(pertanyaan.aspek.kpmrOjk, 'mengupdate skor');

    if (!['Q1', 'Q2', 'Q3', 'Q4'].includes(updateSkorDto.quarter)) {
      throw new BadRequestException('Quarter harus Q1, Q2, Q3, atau Q4');
    }

    this.validateSkor(updateSkorDto.skor);

    if (!pertanyaan.skor) pertanyaan.skor = {};
    pertanyaan.skor[updateSkorDto.quarter] = updateSkorDto.skor;

    try {
      const saved = await this.pertanyaanRepository.save(pertanyaan);
      this.logger.log(`✅ Skor updated for pertanyaan ID: ${id}`);
      await this.recalculateSummary(pertanyaan.aspek.kpmrOjkId);

      return plainToInstance(FrontendPertanyaanResponseDto, {
        id: saved.id.toString(),
        nomor: saved.nomor || '',
        pertanyaan: saved.pertanyaan,
        skor: {
          Q1: saved.skor?.Q1 ?? undefined,
          Q2: saved.skor?.Q2 ?? undefined,
          Q3: saved.skor?.Q3 ?? undefined,
          Q4: saved.skor?.Q4 ?? undefined,
        },
        indicator: saved.indicator,
        evidence: saved.evidence || '',
        catatan: saved.catatan || '',
        orderIndex: saved.orderIndex,
      });
    } catch (error) {
      this.logger.error(`❌ Gagal update skor: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Gagal mengupdate skor');
    }
  }

  async bulkUpdateSkor(bulkDto: BulkUpdateSkorDto): Promise<void> {
    this.logger.log(`📝 Bulk update skor, ${bulkDto.updates?.length || 0} items`);

    if (!bulkDto.updates?.length) {
      throw new BadRequestException('Updates tidak boleh kosong');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const update of bulkDto.updates) {
        const pertanyaan = await queryRunner.manager
          .getRepository(KpmrPertanyaanTatakelola)
          .findOne({
            where: { id: update.pertanyaanId },
            relations: ['aspek', 'aspek.kpmrOjk'],
          });

        if (!pertanyaan) {
          throw new NotFoundException(`Pertanyaan dengan ID ${update.pertanyaanId} tidak ditemukan`);
        }

        if (pertanyaan.aspek.kpmrOjk.isLocked) {
          throw new BadRequestException(
            `KPMR terkunci, tidak dapat mengupdate skor untuk pertanyaan ID ${update.pertanyaanId}`,
          );
        }

        if (!['Q1', 'Q2', 'Q3', 'Q4'].includes(update.quarter)) {
          throw new BadRequestException(`Quarter ${update.quarter} tidak valid`);
        }

        this.validateSkor(update.skor);

        if (!pertanyaan.skor) pertanyaan.skor = {};
        pertanyaan.skor[update.quarter] = update.skor;

        await queryRunner.manager.save(pertanyaan);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`✅ Bulk update skor completed`);

      const affectedKpmrIds = new Set<number>();
      for (const update of bulkDto.updates) {
        const p = await this.pertanyaanRepository.findOne({
          where: { id: update.pertanyaanId },
          relations: ['aspek'],
        });
        if (p?.aspek?.kpmrOjkId) affectedKpmrIds.add(p.aspek.kpmrOjkId);
      }
      for (const id of affectedKpmrIds) {
        await this.recalculateSummary(id);
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`❌ Gagal bulk update skor: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Gagal melakukan bulk update skor');
    } finally {
      await queryRunner.release();
    }
  }

  async deletePertanyaan(id: number): Promise<void> {
    this.logger.log(`🗑️ Delete pertanyaan ID: ${id}`);

    const pertanyaan = await this.getPertanyaanWithRelations(id);
    const kpmrId = pertanyaan.aspek.kpmrOjkId;
    this.checkKpmrLocked(pertanyaan.aspek.kpmrOjk, 'menghapus pertanyaan');

    try {
      await this.pertanyaanRepository.remove(pertanyaan);
      await this.reorderRemainingPertanyaan(pertanyaan.aspekId);
      this.logger.log(`✅ Pertanyaan deleted: ID ${id}`);
      await this.recalculateSummary(kpmrId);
    } catch (error) {
      this.logger.error(`❌ Gagal delete pertanyaan ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Gagal menghapus pertanyaan');
    }
  }

  async reorderPertanyaan(aspekId: number, reorderDto: ReorderPertanyaanDto): Promise<void> {
    this.logger.log(`🔄 Reorder pertanyaan for aspek ID: ${aspekId}`);

    const aspek = await this.getAspekWithRelations(aspekId);
    this.checkKpmrLocked(aspek.kpmrOjk, 'mengubah urutan pertanyaan');

    if (!reorderDto.pertanyaanIds?.length) {
      throw new BadRequestException('Daftar ID pertanyaan tidak boleh kosong');
    }

    const pertanyaanCount = await this.pertanyaanRepository.count({
      where: { id: In(reorderDto.pertanyaanIds), aspekId },
    });

    if (pertanyaanCount !== reorderDto.pertanyaanIds.length) {
      throw new BadRequestException('Beberapa pertanyaan tidak ditemukan atau bukan milik aspek ini');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        for (let i = 0; i < reorderDto.pertanyaanIds.length; i++) {
          await manager.update(KpmrPertanyaanTatakelola, reorderDto.pertanyaanIds[i], { orderIndex: i });
        }
      });
      this.logger.log(`✅ Pertanyaan reordered for aspek ID: ${aspekId}`);
    } catch (error) {
      this.logger.error(`❌ Gagal reorder pertanyaan: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Gagal mengubah urutan pertanyaan');
    }
  }

  // =========================================================================
  // SUMMARY & STATISTICS
  // =========================================================================

  async getSummary(id: number): Promise<UpdateSummaryDto> {
    this.logger.log(`📊 Get summary for KPMR ID: ${id}`);
    const kpmr = await this.getKpmrEntity(id);

    if (!kpmr.summary) {
      return { totalScore: 0, averageScore: 0, rating: undefined, computedAt: new Date() };
    }
    return kpmr.summary as UpdateSummaryDto;
  }

  async updateSummary(id: number, updateDto: UpdateSummaryDto): Promise<UpdateSummaryDto> {
    this.logger.log(`📝 Update summary for KPMR ID: ${id}`);
    const kpmr = await this.getKpmrEntity(id);
    this.checkKpmrLocked(kpmr, 'mengupdate summary');

    kpmr.summary = { ...kpmr.summary, ...updateDto, computedAt: updateDto.computedAt || new Date() };
    await this.kpmrRepository.save(kpmr);
    this.logger.log(`✅ Summary updated for KPMR ID: ${id}`);
    return kpmr.summary as UpdateSummaryDto;
  }

  // =========================================================================
  // ADDITIONAL QUERY METHODS
  // =========================================================================

  async findAllAspek(kpmrId: number): Promise<FrontendAspekResponseDto[]> {
    this.logger.log(`🔍 Find all aspek for KPMR ID: ${kpmrId}`);
    await this.getKpmrEntity(kpmrId);

    const aspekList = await this.aspekRepository.find({
      where: { kpmrOjkId: kpmrId },
      relations: ['pertanyaanList'],
      order: { orderIndex: 'ASC' },
    });

    this.logger.log(`✅ Found ${aspekList.length} aspek`);

    return aspekList.map((aspek) =>
      plainToInstance(FrontendAspekResponseDto, {
        id: aspek.id.toString(),
        nomor: aspek.nomor || '',
        judul: aspek.judul,
        bobot: aspek.bobot.toString(),
        deskripsi: aspek.deskripsi || '',
        orderIndex: aspek.orderIndex,
        averageScore: aspek.averageScore,
        rating: aspek.rating,
        updatedBy: aspek.updatedBy,
        notes: aspek.notes,
        pertanyaanList: (aspek.pertanyaanList || []).map((q) => ({
          id: q.id.toString(),
          nomor: q.nomor || '',
          pertanyaan: q.pertanyaan,
          skor: { Q1: q.skor?.Q1 ?? undefined, Q2: q.skor?.Q2 ?? undefined, Q3: q.skor?.Q3 ?? undefined, Q4: q.skor?.Q4 ?? undefined },
          indicator: q.indicator || { strong: '', satisfactory: '', fair: '', marginal: '', unsatisfactory: '' },
          evidence: q.evidence || '',
          catatan: q.catatan || '',
          orderIndex: q.orderIndex,
        })),
      }),
    );
  }

  async findOneAspek(id: number): Promise<FrontendAspekResponseDto> {
    this.logger.log(`🔍 Find aspek by ID: ${id}`);
    const aspek = await this.aspekRepository.findOne({
      where: { id },
      relations: ['kpmrOjk', 'pertanyaanList'],
    });

    if (!aspek) throw new NotFoundException(`Aspek dengan ID ${id} tidak ditemukan`);

    return plainToInstance(FrontendAspekResponseDto, {
      id: aspek.id.toString(),
      nomor: aspek.nomor || '',
      judul: aspek.judul,
      bobot: aspek.bobot.toString(),
      deskripsi: aspek.deskripsi || '',
      orderIndex: aspek.orderIndex,
      averageScore: aspek.averageScore,
      rating: aspek.rating,
      updatedBy: aspek.updatedBy,
      notes: aspek.notes,
      pertanyaanList: (aspek.pertanyaanList || []).map((q) => ({
        id: q.id.toString(),
        nomor: q.nomor || '',
        pertanyaan: q.pertanyaan,
        skor: { Q1: q.skor?.Q1 ?? undefined, Q2: q.skor?.Q2 ?? undefined, Q3: q.skor?.Q3 ?? undefined, Q4: q.skor?.Q4 ?? undefined },
        indicator: q.indicator || { strong: '', satisfactory: '', fair: '', marginal: '', unsatisfactory: '' },
        evidence: q.evidence || '',
        catatan: q.catatan || '',
        orderIndex: q.orderIndex,
      })),
    });
  }

  async getKpmrStatistics(id: number): Promise<any> {
    this.logger.log(`📊 Get statistics for KPMR ID: ${id}`);
    const kpmr = await this.findOne(id, true);

    let totalQuestions = 0;
    let totalScore = 0;
    let scoreCount = 0;

    if (kpmr.aspekList) {
      kpmr.aspekList.forEach((aspek) => {
        if (aspek.pertanyaanList) {
          totalQuestions += aspek.pertanyaanList.length;
          aspek.pertanyaanList.forEach((q) => {
            const scores: number[] = [];
            if (typeof q.skor?.Q1 === 'number' && !isNaN(q.skor.Q1)) scores.push(q.skor.Q1);
            if (typeof q.skor?.Q2 === 'number' && !isNaN(q.skor.Q2)) scores.push(q.skor.Q2);
            if (typeof q.skor?.Q3 === 'number' && !isNaN(q.skor.Q3)) scores.push(q.skor.Q3);
            if (typeof q.skor?.Q4 === 'number' && !isNaN(q.skor.Q4)) scores.push(q.skor.Q4);
            if (scores.length > 0) {
              totalScore += scores.reduce((a, b) => a + b, 0) / scores.length;
              scoreCount++;
            }
          });
        }
      });
    }

    return {
      totalQuestions,
      aspekCount: kpmr.aspekList?.length || 0,
      averageScore: Number((scoreCount > 0 ? totalScore / scoreCount : 0).toFixed(2)),
      rating: kpmr.summary?.rating || 'Belum dinilai',
    };
  }

  async validateKpmrData(kpmrId: number): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    this.logger.log(`🔍 Validate KPMR ID: ${kpmrId}`);

    try {
      const kpmr = await this.findOne(kpmrId, true);
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!kpmr) {
        errors.push('KPMR tidak ditemukan');
        return { isValid: false, errors, warnings };
      }

      if (!kpmr.aspekList || kpmr.aspekList.length === 0) {
        warnings.push('KPMR tidak memiliki aspek');
      } else {
        const totalBobot = kpmr.aspekList.reduce((sum, aspek) => sum + Number(aspek.bobot || 0), 0);
        if (Math.abs(totalBobot - 100) > 0.01) {
          errors.push(`Total bobot aspek harus 100% (saat ini: ${totalBobot.toFixed(2)}%)`);
        }

        kpmr.aspekList.forEach((aspek, index) => {
          if (!aspek.judul?.trim()) errors.push(`Aspek #${index + 1}: Judul aspek tidak boleh kosong`);
          if (!aspek.pertanyaanList || aspek.pertanyaanList.length === 0) {
            warnings.push(`Aspek "${aspek.judul || index + 1}" tidak memiliki pertanyaan`);
          } else {
            aspek.pertanyaanList.forEach((q, qIndex) => {
              if (!q.pertanyaan?.trim()) {
                errors.push(`Pertanyaan #${qIndex + 1} di aspek "${aspek.judul}": Pertanyaan tidak boleh kosong`);
              }
            });
          }
        });
      }

      return { isValid: errors.length === 0, errors, warnings };
    } catch (error) {
      this.logger.error(`Error validating KPMR ${kpmrId}: ${error.message}`);
      if (error instanceof NotFoundException) {
        return { isValid: false, errors: [`KPMR dengan ID ${kpmrId} tidak ditemukan`], warnings: [] };
      }
      return { isValid: false, errors: ['Gagal memvalidasi KPMR'], warnings: [] };
    }
  }
}