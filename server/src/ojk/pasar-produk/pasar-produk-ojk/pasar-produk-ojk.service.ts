import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PasarProduk } from './entities/pasar-produk-ojk.entity';
import { PasarProdukParameter } from './entities/pasar-produk-parameter.entity';
import { PasarProdukNilai } from './entities/pasar-produk-nilai.entity';
import { PasarProdukReference } from './entities/pasar-produk-inherent-references.entity';

import {
  CreatePasarProdukDto,
  CreateParameterDto,
  CreateNilaiDto,
  UpdatePasarProdukDto,
  UpdateParameterDto,
  UpdateNilaiDto,
  ReorderNilaiDto,
  ReorderParametersDto,
  UpdateSummaryDto,
  KategoriModel,
  KategoriPrinsip,
  JudulType,
  KategoriJenis,
} from './dto/pasar-produk-inherent.dto';

@Injectable()
export class PasarProdukService {
  private readonly logger = new Logger(PasarProdukService.name);

  constructor(
    @InjectRepository(PasarProduk)
    private pasarProdukRepository: Repository<PasarProduk>,
    @InjectRepository(PasarProdukParameter)
    private parameterRepository: Repository<PasarProdukParameter>,
    @InjectRepository(PasarProdukNilai)
    private nilaiRepository: Repository<PasarProdukNilai>,
    @InjectRepository(PasarProdukReference)
    private referenceRepository: Repository<PasarProdukReference>,
    private dataSource: DataSource,
  ) {}

  private parseNumber(v: any): number {
    if (v == null || v === '' || v === undefined) return NaN;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      let cleaned = v.trim();
      cleaned = cleaned.replace(/\s/g, '');
      const isPercent = cleaned.includes('%');
      cleaned = cleaned.replace('%', '');
      cleaned = cleaned.replace(/\./g, '');
      cleaned = cleaned.replace(/,/g, '.');
      const num = Number(cleaned);
      if (!isNaN(num) && isPercent) {
        return num / 100;
      }
      return num;
    }
    return Number(v);
  }

  private evaluateFormula(expr: string, subs: Record<string, number>): number {
    if (!expr || typeof expr !== 'string' || expr.trim() === '') return NaN;
    let e = expr.trim();
    for (const [token, value] of Object.entries(subs)) {
      const re = new RegExp(`\\b${token}\\b`, 'gi');
      e = e.replace(re, String(value));
    }
    const safeRe = /^[0-9eE\.\+\-\*\/\(\)\s]+$/;
    if (!safeRe.test(e)) {
      return NaN;
    }
    try {
      const fn = new Function(`"use strict"; return (${e});`);
      const val = fn();
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        return val;
      }
      return NaN;
    } catch {
      return NaN;
    }
  }

  // ============================================
  // RECALCULATE SUMMARY (TETAP)
  // ============================================
  private async recalculateSummary(pasarProdukId: number): Promise<void> {
    this.logger.log(
      `📊 Recalculating summary for PasarProduk ID: ${pasarProdukId}`,
    );
    try {
      const pasarProduk = await this.pasarProdukRepository.findOne({
        where: { id: pasarProdukId },
        relations: ['parameters', 'parameters.nilaiList'],
      });
      if (!pasarProduk) {
        this.logger.warn(`⚠️ PasarProduk with ID ${pasarProdukId} not found`);
        return;
      }

      let totalWeighted = 0;
      if (pasarProduk.parameters && pasarProduk.parameters.length > 0) {
        for (const param of pasarProduk.parameters) {
          const paramBobotFraction = (Number(param.bobot) || 0) / 100;
          if (param.nilaiList && param.nilaiList.length > 0) {
            for (const nilai of param.nilaiList) {
              const nilaiBobotFraction = (Number(nilai.bobot) || 0) / 100;

              // 1. Dapatkan Raw Value dari Judul Nilai
              let rawValue = NaN;
              let rawString: string | null = null;
              const judul = nilai.judul || {};

              if (judul.type === 'Tanpa Faktor') {
                const v = judul.value;
                const formula = (judul.formula || '').trim();
                const parsed = this.parseNumber(v);
                if (!isNaN(parsed)) {
                  rawValue = formula ? this.evaluateFormula(formula, { pem: parsed }) : parsed;
                } else if (typeof v === 'string' && v.trim() !== '') {
                  rawString = v.trim().toLowerCase();
                }
              } else if (judul.type === 'Satu Faktor') {
                const v = judul.valuePembilang;
                const formula = (judul.formula || '').trim();
                const parsed = this.parseNumber(v);
                if (!isNaN(parsed)) {
                  rawValue = formula ? this.evaluateFormula(formula, { pem: parsed }) : parsed;
                } else if (typeof v === 'string' && v.trim() !== '') {
                  rawString = v.trim().toLowerCase();
                }
              } else if (judul.type === 'Dua Faktor') {
                const vPem = judul.valuePembilang;
                const vPen = judul.valuePenyebut;
                const formula = (judul.formula || '').trim();
                const pem = this.parseNumber(vPem);
                const pen = this.parseNumber(vPen);
                if (!isNaN(pem) && !isNaN(pen)) {
                  rawValue = formula ? this.evaluateFormula(formula, { pem, pen }) : pen !== 0 ? pem / pen : NaN;
                } else if (typeof vPem === 'string' && vPem.trim() !== '') {
                  rawString = vPem.trim().toLowerCase();
                }
              }

              // 2. Tentukan Peringkat (1 - 5) berdasarkan rentang Risk Indicator
              let peringkat: number | null = null;
              const ri = nilai.riskindikator || {};
              const ranges = [
                { key: 'low', rank: 1 },
                { key: 'lowToModerate', rank: 2 },
                { key: 'moderate', rank: 3 },
                { key: 'moderateToHigh', rank: 4 },
                { key: 'high', rank: 5 },
              ];

              if (!isNaN(rawValue)) {
                for (const { key, rank } of ranges) {
                  const rawText = String(ri[key] ?? '');
                  const nums = rawText.match(/-?\d+(\.\d+)?/g);
                  if (!nums || nums.length === 0) continue;

                  const hasPercent = rawText.includes('%');
                  let min = -Infinity;
                  let max = Infinity;

                  if (nums.length === 1) {
                    let n = Number(nums[0]);
                    if (hasPercent) n = n / 100;
                    if (/≤|<=/.test(rawText)) max = n;
                    else if (/≥|>=/.test(rawText)) min = n;
                    else if (/^[xX]?\s*>|>\s*\d+/i.test(rawText)) {
                      min = n;
                      max = Infinity;
                    } else if (/^[xX]?\s*<|<\s*\d+/i.test(rawText)) {
                      min = -Infinity;
                      max = n;
                    } else {
                      min = n;
                      max = n;
                    }
                  } else {
                    let n1 = Number(nums[0]);
                    let n2 = Number(nums[1]);
                    if (hasPercent) {
                      n1 = n1 / 100;
                      n2 = n2 / 100;
                    }
                    min = Math.min(n1, n2);
                    max = Math.max(n1, n2);
                  }

                  if (rawValue >= min && rawValue <= max) {
                    peringkat = rank;
                    break;
                  }
                }
              }

              if (isNaN(rawValue) && rawString) {
                for (const { key, rank } of ranges) {
                  const riValue = String(ri[key] ?? '').trim().toLowerCase();
                  if (!riValue) continue;
                  if (riValue === rawString) {
                    peringkat = rank;
                    break;
                  }
                }
              }

              if (peringkat !== null) {
                totalWeighted += paramBobotFraction * nilaiBobotFraction * peringkat;
              }
            }
          }
        }
      }

      let summaryBg: string;
      if (totalWeighted <= 1.67) summaryBg = 'bg-green-400 text-black';
      else if (totalWeighted <= 2.33) summaryBg = 'bg-lime-300 text-black';
      else if (totalWeighted <= 3.00) summaryBg = 'bg-yellow-400 text-black';
      else if (totalWeighted <= 3.67) summaryBg = 'bg-orange-400 text-black';
      else summaryBg = 'bg-red-500 text-white';

      pasarProduk.summary = {
        totalWeighted: Number(totalWeighted.toFixed(2)),
        summaryBg,
        computedAt: new Date(),
      };
      await this.pasarProdukRepository.save(pasarProduk);
      this.logger.log(
        `✅ Summary recalculated for PasarProduk ID ${pasarProdukId}: totalWeighted=${totalWeighted.toFixed(2)}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error recalculating summary for PasarProduk ${pasarProdukId}: ${error.message}`,
        error.stack,
      );
    }
  }

  // ============================================
  // CRUD UTAMA (PasarProduk)
  // ============================================

  async create(createDto: CreatePasarProdukDto, userId: string) {
    try {
      const existing = await this.pasarProdukRepository.findOne({
        where: { year: createDto.year, quarter: createDto.quarter },
      });

      if (existing) {
        this.logger.warn(
          `create: Data already exists for year ${createDto.year} quarter ${createDto.quarter}`,
        );
        if (!existing.isActive) {
          existing.isActive = true;
          existing.updatedBy = userId;
          existing.updatedAt = new Date();
          await this.pasarProdukRepository.save(existing);
        }
        return existing;
      }

      const pasarProduk = this.pasarProdukRepository.create({
        year: createDto.year,
        quarter: createDto.quarter,
        isActive: createDto.isActive ?? true,
        createdBy: userId,
        updatedBy: userId,
        version: createDto.version || '1.0.0',
        summary: {
          totalWeighted: 0,
          summaryBg: 'bg-gray-400 text-black',
          computedAt: new Date(),
        },
      });

      const saved = await this.pasarProdukRepository.save(pasarProduk);
      this.logger.log(`create: New data created - ID: ${saved.id}`);
      return saved;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        this.logger.warn(
          `create: Duplicate entry detected. Fetching existing data.`,
        );
        const existing = await this.pasarProdukRepository.findOne({
          where: { year: createDto.year, quarter: createDto.quarter },
        });
        if (existing) {
          if (!existing.isActive) {
            existing.isActive = true;
            existing.updatedBy = userId;
            await this.pasarProdukRepository.save(existing);
          }
          return existing;
        }
      }
      this.logger.error(
        `Error creating PasarProduk: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findActive(): Promise<PasarProduk | null> {
    this.logger.debug('findActive: Mencari data aktif');
    try {
      const pasarProduk = await this.pasarProdukRepository.findOne({
        where: { isActive: true },
        relations: ['parameters', 'parameters.nilaiList'],
        order: {
          parameters: { orderIndex: 'ASC', nilaiList: { orderIndex: 'ASC' } },
        },
      });

      if (!pasarProduk) {
        this.logger.warn('findActive: Tidak ada data aktif ditemukan');
        return null;
      }
      this.logger.log(`findActive: Data ditemukan - ID: ${pasarProduk.id}`);
      return pasarProduk;
    } catch (error) {
      this.logger.error(`findActive: Error - ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByYearQuarter(
    year: number,
    quarter: number,
  ): Promise<PasarProduk | null> {
    this.logger.log(
      `findByYearQuarter: Mencari data - Year: ${year}, Quarter: ${quarter}`,
    );
    try {
      const pasarProduk = await this.pasarProdukRepository.findOne({
        where: { year, quarter },
        relations: ['parameters', 'parameters.nilaiList'],
        order: {
          parameters: { orderIndex: 'ASC', nilaiList: { orderIndex: 'ASC' } },
        },
      });
      if (!pasarProduk) {
        this.logger.warn(`findByYearQuarter: Data tidak ditemukan`);
        return null;
      }
      this.logger.log(
        `findByYearQuarter: Data ditemukan - ID: ${pasarProduk.id}`,
      );
      return pasarProduk;
    } catch (error) {
      this.logger.error(
        `findByYearQuarter: Error - ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: number): Promise<PasarProduk | null> {
    this.logger.log(`findById: Mencari data - ID: ${id}`);
    try {
      const pasarProduk = await this.pasarProdukRepository.findOne({
        where: { id },
        relations: ['parameters', 'parameters.nilaiList'],
        order: {
          parameters: { orderIndex: 'ASC', nilaiList: { orderIndex: 'ASC' } },
        },
      });
      if (!pasarProduk) {
        this.logger.warn(`findById: Data dengan ID ${id} tidak ditemukan`);
        return null;
      }
      return pasarProduk;
    } catch (error) {
      this.logger.error(`findById: Error - ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAll() {
    this.logger.debug('getAll: Mendapatkan semua data');
    return this.pasarProdukRepository.find({
      relations: ['parameters'],
      order: { year: 'DESC', quarter: 'DESC' },
    });
  }

  async update(id: number, updateDto: UpdatePasarProdukDto, userId: string) {
    this.logger.log(`update: Mengupdate data - ID: ${id}`);
    const pasarProduk = await this.pasarProdukRepository.findOne({
      where: { id },
    });
    if (!pasarProduk) {
      throw new NotFoundException(`Data dengan ID ${id} tidak ditemukan`);
    }

    if (updateDto.year !== undefined) pasarProduk.year = updateDto.year;
    if (updateDto.quarter !== undefined)
      pasarProduk.quarter = updateDto.quarter;
    if (updateDto.isActive !== undefined)
      pasarProduk.isActive = updateDto.isActive;
    if (updateDto.summary !== undefined)
      pasarProduk.summary = updateDto.summary;
    if (updateDto.isLocked !== undefined)
      pasarProduk.isLocked = updateDto.isLocked;
    if (updateDto.lockedBy !== undefined)
      pasarProduk.lockedBy = updateDto.lockedBy;
    if (updateDto.lockedAt !== undefined)
      pasarProduk.lockedAt = updateDto.lockedAt;
    if (updateDto.notes !== undefined) pasarProduk.notes = updateDto.notes;
    pasarProduk.updatedBy = userId;

    const result = await this.pasarProdukRepository.save(pasarProduk);
    this.logger.log(`update: Data berhasil diupdate - ID: ${result.id}`);
    return result;
  }

  async updateSummary(
    id: number,
    summaryDto: UpdateSummaryDto,
    userId: string,
  ) {
    const pasarProduk = await this.pasarProdukRepository.findOne({
      where: { id },
    });
    if (!pasarProduk)
      throw new NotFoundException(`Data dengan ID ${id} tidak ditemukan`);
    pasarProduk.summary = {
      ...pasarProduk.summary,
      ...summaryDto,
      computedAt: new Date(),
    };
    pasarProduk.updatedBy = userId;
    return this.pasarProdukRepository.save(pasarProduk);
  }

  async updateActiveStatus(id: number, isActive: boolean, userId: string) {
    const pasarProduk = await this.pasarProdukRepository.findOne({
      where: { id },
    });
    if (!pasarProduk)
      throw new NotFoundException(`Data dengan ID ${id} tidak ditemukan`);
    if (isActive) {
      await this.pasarProdukRepository
        .createQueryBuilder()
        .update(PasarProduk)
        .set({ isActive: false })
        .execute();
    }
    pasarProduk.isActive = isActive;
    pasarProduk.updatedBy = userId;
    return this.pasarProdukRepository.save(pasarProduk);
  }

  async remove(id: number) {
    const pasarProduk = await this.pasarProdukRepository.findOne({
      where: { id },
      relations: ['parameters', 'parameters.nilaiList'],
    });
    if (!pasarProduk)
      throw new NotFoundException(`Data dengan ID ${id} tidak ditemukan`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const parameter of pasarProduk.parameters || []) {
        await queryRunner.manager.delete(PasarProdukNilai, {
          parameterId: parameter.id,
        });
      }
      await queryRunner.manager.delete(PasarProdukParameter, {
        pasarProdukId: id,
      });
      await queryRunner.manager.delete(PasarProduk, { id });
      await queryRunner.commitTransaction();
      return { message: 'Data berhasil dihapus', id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ============================================
  // OPERASI PARAMETER
  // ============================================

  async addParameter(
    pasarProdukId: number,
    createParamDto: CreateParameterDto,
    userId: string,
  ) {
    this.logger.log(
      `addParameter: Menambahkan parameter - PasarProduk ID: ${pasarProdukId}`,
    );
    const pasarProduk = await this.pasarProdukRepository.findOne({
      where: { id: pasarProdukId },
    });
    if (!pasarProduk)
      throw new NotFoundException(
        `Data dengan ID ${pasarProdukId} tidak ditemukan`,
      );

    if (createParamDto.kategori) {
      const kategori = createParamDto.kategori;
      if (kategori.model === KategoriModel.OPEN_END) {
        if (!kategori.jenis)
          throw new BadRequestException(
            'Untuk model "open_end", jenis reksa dana wajib dipilih',
          );
        if (kategori.underlying && kategori.underlying.length > 0)
          throw new BadRequestException(
            'Untuk model "open_end", aset dasar harus kosong',
          );
        if (!kategori.prinsip)
          throw new BadRequestException(
            'Prinsip (syariah/konvensional) wajib dipilih untuk model "open_end"',
          );
      }
      if (kategori.model === KategoriModel.TERSTRUKTUR) {
        if (kategori.jenis)
          throw new BadRequestException(
            'Untuk model "terstruktur", jenis harus kosong',
          );
        if (!kategori.prinsip)
          throw new BadRequestException(
            'Prinsip (syariah/konvensional) wajib dipilih untuk model "terstruktur"',
          );
      }
      if (kategori.model === KategoriModel.TANPA_MODEL) {
        if (
          kategori.prinsip ||
          kategori.jenis ||
          (kategori.underlying && kategori.underlying.length > 0)
        )
          throw new BadRequestException(
            'Untuk model "tanpa_model", prinsip, jenis, dan aset dasar harus kosong',
          );
      }
    }

    const lastParam = await this.parameterRepository.findOne({
      where: { pasarProdukId },
      order: { orderIndex: 'DESC' },
    });
    const orderIndex = lastParam ? lastParam.orderIndex + 1 : 0;

    const kategoriFormatted = createParamDto.kategori
      ? {
          model: createParamDto.kategori.model,
          prinsip:
            createParamDto.kategori.model !== KategoriModel.TANPA_MODEL
              ? createParamDto.kategori.prinsip
              : undefined,
          jenis:
            createParamDto.kategori.model === KategoriModel.OPEN_END
              ? createParamDto.kategori.jenis
              : undefined,
          underlying:
            createParamDto.kategori.model === KategoriModel.TERSTRUKTUR
              ? createParamDto.kategori.underlying || []
              : [],
        }
      : undefined;

    try {
      const parameter = this.parameterRepository.create({
        nomor: createParamDto.nomor || '',
        judul: createParamDto.judul.trim(),
        bobot: createParamDto.bobot,
        kategori: kategoriFormatted,
        pasarProdukId,
        orderIndex: createParamDto.orderIndex ?? orderIndex,
      });
      const savedParam = await this.parameterRepository.save(parameter);
      await this.recalculateSummary(pasarProdukId);
      await this.pasarProdukRepository.update(pasarProdukId, {
        updatedBy: userId,
        updatedAt: new Date(),
      });
      return savedParam;
    } catch (error: any) {
      this.logger.error('addParameter - Error saving parameter:', error);
      if (error.code === '23502' || error.message.includes('null value'))
        throw new BadRequestException(
          'Error validasi: Pastikan semua field yang diperlukan terisi sesuai model yang dipilih',
        );
      throw error;
    }
  }

  async updateParameter(
    pasarProdukId: number,
    parameterId: number,
    updateParamDto: UpdateParameterDto,
    userId: string,
  ) {
    const parameter = await this.parameterRepository.findOne({
      where: { id: parameterId, pasarProdukId },
    });
    if (!parameter)
      throw new NotFoundException(
        `Parameter dengan ID ${parameterId} tidak ditemukan`,
      );

    if (updateParamDto.nomor !== undefined)
      parameter.nomor = updateParamDto.nomor;
    if (updateParamDto.judul !== undefined)
      parameter.judul = updateParamDto.judul.trim();
    if (updateParamDto.bobot !== undefined)
      parameter.bobot = updateParamDto.bobot;
    if (updateParamDto.orderIndex !== undefined)
      parameter.orderIndex = updateParamDto.orderIndex;

    if (updateParamDto.kategori) {
      const kategori = updateParamDto.kategori;
      if (kategori.model === KategoriModel.TERSTRUKTUR) {
        if (!kategori.prinsip)
          throw new BadRequestException('Prinsip wajib dipilih');
        if (kategori.jenis) throw new BadRequestException('Jenis harus kosong');
      }
      if (kategori.model === KategoriModel.OPEN_END) {
        if (!kategori.prinsip)
          throw new BadRequestException('Prinsip wajib dipilih');
        if (!kategori.jenis)
          throw new BadRequestException('Jenis wajib dipilih');
        if (kategori.underlying && kategori.underlying.length > 0)
          throw new BadRequestException('Aset dasar harus kosong');
      }
      if (kategori.model === KategoriModel.TANPA_MODEL) {
        if (
          kategori.prinsip ||
          kategori.jenis ||
          (kategori.underlying && kategori.underlying.length > 0)
        )
          throw new BadRequestException(
            'Prinsip, jenis, dan aset dasar harus kosong',
          );
      }
      parameter.kategori = {
        model: kategori.model,
        prinsip:
          kategori.model !== KategoriModel.TANPA_MODEL
            ? kategori.prinsip
            : undefined,
        jenis:
          kategori.model === KategoriModel.OPEN_END
            ? kategori.jenis
            : undefined,
        underlying:
          kategori.model === KategoriModel.TERSTRUKTUR
            ? kategori.underlying || []
            : [],
      };
    }

    try {
      const updated = await this.parameterRepository.save(parameter);
      await this.recalculateSummary(pasarProdukId);
      await this.pasarProdukRepository.update(pasarProdukId, {
        updatedBy: userId,
        updatedAt: new Date(),
      });
      return updated;
    } catch (error: any) {
      throw error;
    }
  }

  async reorderParameters(
    pasarProdukId: number,
    reorderDto: ReorderParametersDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (let i = 0; i < reorderDto.parameterIds.length; i++)
        await queryRunner.manager.update(
          PasarProdukParameter,
          { id: reorderDto.parameterIds[i], pasarProdukId },
          { orderIndex: i },
        );
      await queryRunner.commitTransaction();
      return { message: 'Parameter berhasil diurutkan' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async copyParameter(
    pasarProdukId: number,
    parameterId: number,
    userId: string,
  ) {
    const originalParam = await this.parameterRepository.findOne({
      where: { id: parameterId, pasarProdukId },
      relations: ['nilaiList'],
    });
    if (!originalParam)
      throw new NotFoundException(
        `Parameter ID ${parameterId} tidak ditemukan`,
      );

    const lastParam = await this.parameterRepository.findOne({
      where: { pasarProdukId },
      order: { orderIndex: 'DESC' },
    });
    const orderIndex = lastParam ? lastParam.orderIndex + 1 : 0;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newParam = this.parameterRepository.create({
        nomor: originalParam.nomor,
        judul: `${originalParam.judul} (Copy)`,
        bobot: originalParam.bobot,
        kategori: originalParam.kategori,
        pasarProdukId,
        orderIndex,
      });
      const savedParam = await queryRunner.manager.save(
        PasarProdukParameter,
        newParam,
      );
      if (originalParam.nilaiList?.length)
        for (const nilai of originalParam.nilaiList) {
          const { id, ...nilaiWithoutId } = nilai;
          await queryRunner.manager.save(PasarProdukNilai, {
            ...nilaiWithoutId,
            parameterId: savedParam.id,
          });
        }

      await queryRunner.commitTransaction();
      await this.recalculateSummary(pasarProdukId);
      await this.pasarProdukRepository.update(pasarProdukId, {
        updatedBy: userId,
        updatedAt: new Date(),
      });
      return savedParam;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeParameter(
    pasarProdukId: number,
    parameterId: number,
    userId: string,
  ) {
    const parameter = await this.parameterRepository.findOne({
      where: { id: parameterId, pasarProdukId },
      relations: ['nilaiList'],
    });
    if (!parameter)
      throw new NotFoundException(
        `Parameter ID ${parameterId} tidak ditemukan`,
      );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (parameter.nilaiList?.length)
        await queryRunner.manager.delete(PasarProdukNilai, { parameterId });
      await queryRunner.manager.delete(PasarProdukParameter, {
        id: parameterId,
      });
      await queryRunner.commitTransaction();
      await this.recalculateSummary(pasarProdukId);
      await this.pasarProdukRepository.update(pasarProdukId, {
        updatedBy: userId,
        updatedAt: new Date(),
      });
      return { message: 'Parameter berhasil dihapus', parameterId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ============================================
  // OPERASI NILAI
  // ============================================

  async addNilai(
    pasarProdukId: number,
    parameterId: number,
    createNilaiDto: CreateNilaiDto,
    userId: string,
  ) {
    const parameter = await this.parameterRepository.findOne({
      where: { id: parameterId, pasarProdukId },
    });
    if (!parameter)
      throw new NotFoundException(
        `Parameter ID ${parameterId} tidak ditemukan`,
      );
    if (!createNilaiDto.judul?.text?.trim())
      throw new BadRequestException('Judul nilai wajib diisi');

    const lastNilai = await this.nilaiRepository.findOne({
      where: { parameterId },
      order: { orderIndex: 'DESC' },
    });
    const orderIndex = lastNilai ? lastNilai.orderIndex + 1 : 0;

    const nilai = this.nilaiRepository.create({
      nomor: createNilaiDto.nomor || '',
      judul: {
        type: createNilaiDto.judul?.type || JudulType.TANPA_FAKTOR,
        text: createNilaiDto.judul.text.trim(),
        value: createNilaiDto.judul?.value ?? null,
        pembilang: createNilaiDto.judul?.pembilang || '',
        valuePembilang: createNilaiDto.judul?.valuePembilang ?? null,
        penyebut: createNilaiDto.judul?.penyebut || '',
        valuePenyebut: createNilaiDto.judul?.valuePenyebut ?? null,
        formula: createNilaiDto.judul?.formula || '',
        percent: createNilaiDto.judul?.percent || false,
      },
      bobot: createNilaiDto.bobot,
      portofolio: createNilaiDto.portofolio || '',
      keterangan: createNilaiDto.keterangan || '',
      riskindikator: createNilaiDto.riskindikator || {
        low: '',
        lowToModerate: '',
        moderate: '',
        moderateToHigh: '',
        high: '',
      },
      parameterId,
      orderIndex: createNilaiDto.orderIndex ?? orderIndex,
    });
    const saved = await this.nilaiRepository.save(nilai);
    await this.recalculateSummary(pasarProdukId);
    await this.pasarProdukRepository.update(pasarProdukId, {
      updatedBy: userId,
      updatedAt: new Date(),
    });
    return saved;
  }

  async updateNilai(
    pasarProdukId: number,
    parameterId: number,
    nilaiId: number,
    updateNilaiDto: UpdateNilaiDto,
    userId: string,
  ) {
    const nilai = await this.nilaiRepository.findOne({
      where: { id: nilaiId, parameterId },
      relations: ['parameter'],
    });
    if (!nilai)
      throw new NotFoundException(`Nilai ID ${nilaiId} tidak ditemukan`);
    if (nilai.parameter.pasarProdukId !== pasarProdukId)
      throw new BadRequestException('Nilai tidak termasuk dalam pasar produk');

    if (updateNilaiDto.nomor !== undefined) nilai.nomor = updateNilaiDto.nomor;
    if (updateNilaiDto.bobot !== undefined) nilai.bobot = updateNilaiDto.bobot;
    if (updateNilaiDto.portofolio !== undefined)
      nilai.portofolio = updateNilaiDto.portofolio;
    if (updateNilaiDto.keterangan !== undefined)
      nilai.keterangan = updateNilaiDto.keterangan;
    if (updateNilaiDto.orderIndex !== undefined)
      nilai.orderIndex = updateNilaiDto.orderIndex;
    if (updateNilaiDto.riskindikator)
      nilai.riskindikator = {
        ...nilai.riskindikator,
        ...updateNilaiDto.riskindikator,
      };
    if (updateNilaiDto.judul)
      nilai.judul = {
        ...nilai.judul,
        ...updateNilaiDto.judul,
        ...(updateNilaiDto.judul.text && {
          text: updateNilaiDto.judul.text.trim(),
        }),
      };

    const updated = await this.nilaiRepository.save(nilai);
    await this.recalculateSummary(pasarProdukId);
    await this.pasarProdukRepository.update(pasarProdukId, {
      updatedBy: userId,
      updatedAt: new Date(),
    });
    return updated;
  }

  async reorderNilai(parameterId: number, reorderDto: ReorderNilaiDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (let i = 0; i < reorderDto.nilaiIds.length; i++)
        await queryRunner.manager.update(
          PasarProdukNilai,
          { id: reorderDto.nilaiIds[i], parameterId },
          { orderIndex: i },
        );
      await queryRunner.commitTransaction();
      return { message: 'Nilai berhasil diurutkan' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async copyNilai(
    pasarProdukId: number,
    parameterId: number,
    nilaiId: number,
    userId: string,
  ) {
    const originalNilai = await this.nilaiRepository.findOne({
      where: { id: nilaiId, parameterId },
    });
    if (!originalNilai)
      throw new NotFoundException(`Nilai ID ${nilaiId} tidak ditemukan`);

    const lastNilai = await this.nilaiRepository.findOne({
      where: { parameterId },
      order: { orderIndex: 'DESC' },
    });
    const orderIndex = lastNilai ? lastNilai.orderIndex + 1 : 0;

    const { id, ...nilaiWithoutId } = originalNilai;
    const newNilai = this.nilaiRepository.create({
      ...nilaiWithoutId,
      judul: {
        ...originalNilai.judul,
        text: `${originalNilai.judul?.text || ''} (Copy)`,
      },
      parameterId,
      orderIndex,
    });
    const saved = await this.nilaiRepository.save(newNilai);
    await this.recalculateSummary(pasarProdukId);
    await this.pasarProdukRepository.update(pasarProdukId, {
      updatedBy: userId,
      updatedAt: new Date(),
    });
    return saved;
  }

  async removeNilai(
    pasarProdukId: number,
    parameterId: number,
    nilaiId: number,
    userId: string,
  ) {
    const nilai = await this.nilaiRepository.findOne({
      where: { id: nilaiId, parameterId },
      relations: ['parameter'],
    });
    if (!nilai)
      throw new NotFoundException(`Nilai ID ${nilaiId} tidak ditemukan`);
    if (nilai.parameter.pasarProdukId !== pasarProdukId)
      throw new BadRequestException('Nilai tidak termasuk dalam pasar produk');

    await this.nilaiRepository.delete({ id: nilaiId });
    await this.recalculateSummary(pasarProdukId);
    await this.pasarProdukRepository.update(pasarProdukId, {
      updatedBy: userId,
      updatedAt: new Date(),
    });
    return { message: 'Nilai berhasil dihapus', nilaiId };
  }

  // ============================================
  // REFERENCE DATA
  // ============================================

  async getReferences(type?: string) {
    const query = this.referenceRepository
      .createQueryBuilder('ref')
      .where('ref.isActive = :isActive', { isActive: true });
    if (type) query.andWhere('ref.type = :type', { type });
    query.orderBy('ref.order', 'ASC');
    return query.getMany();
  }

  // ============================================
  // VALIDASI MODEL TERSTRUKTUR
  // ============================================

  async validateModelTerstruktur(
    pasarProdukId: number,
  ): Promise<{ isValid: boolean; warnings: string[]; errors: string[] }> {
    const result = {
      isValid: true,
      warnings: [] as string[],
      errors: [] as string[],
    };
    const pasarProduk = await this.pasarProdukRepository.findOne({
      where: { id: pasarProdukId },
      relations: ['parameters'],
    });
    if (!pasarProduk) {
      result.errors.push(`Data ID ${pasarProdukId} tidak ditemukan`);
      result.isValid = false;
      return result;
    }
    const terstrukturParams =
      pasarProduk.parameters?.filter(
        (p) => p.kategori?.model === KategoriModel.TERSTRUKTUR,
      ) || [];
    terstrukturParams.forEach((param) => {
      if (!param.kategori?.prinsip) {
        result.errors.push(`Parameter "${param.judul}" harus memiliki prinsip`);
        result.isValid = false;
      }
      if (!param.kategori?.underlying || param.kategori.underlying.length === 0)
        result.warnings.push(
          `Parameter "${param.judul}" tidak memiliki aset dasar`,
        );
      if (param.kategori?.jenis) {
        result.errors.push(
          `Parameter "${param.judul}" seharusnya tidak memiliki jenis`,
        );
        result.isValid = false;
      }
    });
    return result;
  }

  // ============================================
  // IMPORT/EXPORT
  // ============================================

  async exportToExcel(pasarProdukId: number) {
    const pasarProduk = await this.pasarProdukRepository.findOne({
      where: { id: pasarProdukId },
      relations: ['parameters', 'parameters.nilaiList'],
      order: {
        parameters: { orderIndex: 'ASC', nilaiList: { orderIndex: 'ASC' } },
      },
    });
    if (!pasarProduk)
      throw new NotFoundException(`Data ID ${pasarProdukId} tidak ditemukan`);

    return {
      metadata: {
        year: pasarProduk.year,
        quarter: pasarProduk.quarter,
        exportedAt: new Date().toISOString(),
        totalParameters: pasarProduk.parameters?.length || 0,
        totalNilai:
          pasarProduk.parameters?.reduce(
            (total, param) => total + (param.nilaiList?.length || 0),
            0,
          ) || 0,
      },
      parameters:
        pasarProduk.parameters?.map((param) => ({
          id: param.id,
          nomor: param.nomor,
          judul: param.judul,
          bobot: Number(param.bobot),
          kategori: param.kategori,
          orderIndex: param.orderIndex,
          nilaiList:
            param.nilaiList?.map((nilai) => ({
              id: nilai.id,
              nomor: nilai.nomor,
              judul: nilai.judul,
              bobot: Number(nilai.bobot),
              portofolio: nilai.portofolio,
              keterangan: nilai.keterangan,
              riskindikator: nilai.riskindikator,
              orderIndex: nilai.orderIndex,
            })) || [],
        })) || [],
    };
  }

  async importFromExcel(importData: any, userId: string) {
    if (!importData.parameters || !Array.isArray(importData.parameters))
      throw new BadRequestException('Format data tidak valid');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        PasarProduk,
        { isActive: true },
        { isActive: false },
      );

      const pasarProduk = {
        year: importData.metadata?.year || new Date().getFullYear(),
        quarter: importData.metadata?.quarter || 1,
        summary: importData.summary || {
          totalWeighted: 0,
          summaryBg: 'bg-gray-400 text-black',
          computedAt: new Date(),
        },
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      };
      const savedPasarProduk = await queryRunner.manager.save(
        PasarProduk,
        pasarProduk,
      );

      for (let i = 0; i < importData.parameters.length; i++) {
        const paramData = importData.parameters[i];
        const parameter = {
          nomor: paramData.nomor || '',
          judul: paramData.judul || '',
          bobot: paramData.bobot || 0,
          kategori: paramData.kategori || {
            model: '' as KategoriModel,
            prinsip: '' as KategoriPrinsip,
            jenis: '' as KategoriJenis,
            underlying: [],
          },
          pasarProdukId: savedPasarProduk.id,
          orderIndex: paramData.orderIndex || i,
        };
        const savedParam = await queryRunner.manager.save(
          PasarProdukParameter,
          parameter,
        );

        if (paramData.nilaiList && Array.isArray(paramData.nilaiList)) {
          for (let j = 0; j < paramData.nilaiList.length; j++) {
            const nilaiData = paramData.nilaiList[j];
            await queryRunner.manager.save(PasarProdukNilai, {
              nomor: nilaiData.nomor || '',
              judul: nilaiData.judul || {
                type: JudulType.TANPA_FAKTOR,
                text: '',
                value: null,
                pembilang: '',
                valuePembilang: null,
                penyebut: '',
                valuePenyebut: null,
                formula: '',
                percent: false,
              },
              bobot: nilaiData.bobot || 0,
              portofolio: nilaiData.portofolio || '',
              keterangan: nilaiData.keterangan || '',
              riskindikator: nilaiData.riskindikator || {
                low: '',
                lowToModerate: '',
                moderate: '',
                moderateToHigh: '',
                high: '',
              },
              parameterId: savedParam.id,
              orderIndex: nilaiData.orderIndex || j,
            });
          }
        }
      }
      await queryRunner.commitTransaction();
      await this.recalculateSummary(savedPasarProduk.id);
      return savedPasarProduk;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}