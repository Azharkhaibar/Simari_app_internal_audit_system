// rekap-data.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  GetAllRekapDto,
  UpdateNilaiValueDto,
  RekapParameterResponseDto,
  RekapNilaiResponseDto,
  RekapDataResponseDto,
  UpdateNilaiResponseDto,
  CategoryId,
} from './dto/rekap-data.dto';

// operasional-ojk
import { Operasional } from '../operasional-ojk/operasional-ojk/entities/operasional-ojk.entity';
import { OperasionalParameter } from '../operasional-ojk/operasional-ojk/entities/operasional-produk-parameter.entity';
import { OperasionalNilai } from '../operasional-ojk/operasional-ojk/entities/operasional-produk-nilai.entity';

// hukum-ojk
import { HukumOjk } from '../hukum-ojk/hukum-ojk/entities/hukum-ojk.entity';
import { HukumParameter } from '../hukum-ojk/hukum-ojk/entities/hukum-paramater.entity';
import { HukumNilai } from '../hukum-ojk/hukum-ojk/entities/hukum-nilai.entity';

// investasi-ojk
import { Investasi } from '../investasi-ojk/investasi-ojk/entities/investasi-ojk.entity';
import { InvestasiParameter } from '../investasi-ojk/investasi-ojk/entities/investasi-produk-parameter.entity';
import { InvestasiNilai } from '../investasi-ojk/investasi-ojk/entities/investasi-produk-nilai.entity';

// kepatuhan-ojk
import { KepatuhanOjk } from '../kepatuhan-ojk/kepatuhan-ojk/entities/kepatuhan-ojk.entity';
import { KepatuhanParameter } from '../kepatuhan-ojk/kepatuhan-ojk/entities/kepatuhan-paramater.entity';
import { KepatuhanNilai } from '../kepatuhan-ojk/kepatuhan-ojk/entities/kepatuhan-nilai.entity';

// konsentrasi-produk
import { KonsentrasiProdukOjk } from '../konsentrasi-produk/konsentrasi-produk-ojk/entities/konsentrasi-produk-ojk.entity';
import { KonsentrasiParameter } from '../konsentrasi-produk/konsentrasi-produk-ojk/entities/konsentrasi-produk-paramter.entity';
import { KonsentrasiNilai } from '../konsentrasi-produk/konsentrasi-produk-ojk/entities/konsentrasi-produk-nilai.entity';

// kredit-produk
import { Kredit } from '../kredit-produk/kredit-produk-ojk/entities/kredit-produk-ojk.entity';
import { KreditParameter } from '../kredit-produk/kredit-produk-ojk/entities/kredit-produk-parameter.entity';
import { KreditNilai } from '../kredit-produk/kredit-produk-ojk/entities/kredit-produk-nilai.entity';

// likuiditas-produk
import { Likuiditas } from '../likuiditas-produk/likuiditas-produk-ojk/entities/likuiditas-ojk.entity';
import { LikuiditasParameter } from '../likuiditas-produk/likuiditas-produk-ojk/entities/likuiditas-parameter.entity';
import { LikuiditasNilai } from '../likuiditas-produk/likuiditas-produk-ojk/entities/likuiditas-nilai.entity';

// pasar-produk
import { PasarProduk } from '../pasar-produk/pasar-produk-ojk/entities/pasar-produk-ojk.entity';
import { PasarProdukParameter } from '../pasar-produk/pasar-produk-ojk/entities/pasar-produk-parameter.entity';
import { PasarProdukNilai } from '../pasar-produk/pasar-produk-ojk/entities/pasar-produk-nilai.entity';

// permodalan-ojk
import { Permodalan } from '../permodalan-ojk/permodalan-ojk/entities/permodalan-ojk.entity';
import { PermodalanParameter } from '../permodalan-ojk/permodalan-ojk/entities/permodalan-produk-parameter.entity';
import { PermodalanNilai } from '../permodalan-ojk/permodalan-ojk/entities/permodalan-produk-nilai.entity';

// rentabilitas-ojk
import { Rentabilitas } from '../rentabilitas-ojk/rentabilitas-ojk/entities/rentabilitas-ojk.entity';
import { RentabilitasParameter } from '../rentabilitas-ojk/rentabilitas-ojk/entities/rentabilitas-parameter.entity';
import { RentabilitasNilai } from '../rentabilitas-ojk/rentabilitas-ojk/entities/rentabilitas-nilai.entity';

// reputasi-ojk
import { Reputasi } from '../reputasi-ojk/reputasi-ojk/entities/reputasi-ojk.entity';
import { ReputasiParameter } from '../reputasi-ojk/reputasi-ojk/entities/reputasi-parameter.entity';
import { ReputasiNilai } from '../reputasi-ojk/reputasi-ojk/entities/reputasi-nilai.entity';

// strategis-ojk
import { Strategis } from '../strategis-ojk/strategis-ojk/entities/strategis-ojk.entity';
import { StrategisParameter } from '../strategis-ojk/strategis-ojk/entities/strategis-parameter.entity';
import { StrategisNilai } from '../strategis-ojk/strategis-ojk/entities/strategis-nilai.entity';

// tatakelola-ojk
import { Tatakelola } from '../tatakelola-ojk/tatakelola-ojk/entities/tatakelola-ojk.entity';
import { TatakelolaParameter } from '../tatakelola-ojk/tatakelola-ojk/entities/tatakelola-produk-parameter.entity';
import { TatakelolaNilai } from '../tatakelola-ojk/tatakelola-ojk/entities/tatakelola-produk-nilai.entity';

// ==================== CATEGORY MAPPING ====================
const CATEGORY_LABEL_MAP: Record<string, string> = {
  'operasional': 'Operasional',
  'pasar-produk': 'Pasar Produk',
  'likuiditas-produk': 'Likuiditas Produk',
  'kredit-produk': 'Kredit Produk',
  'konsentrasi-produk': 'Konsentrasi Produk',
  'hukum-regulatory': 'Hukum',
  'kepatuhan-regulatory': 'Kepatuhan',
  'reputasi-regulatory': 'Reputasi',
  'strategis-regulatory': 'Strategis',
  'investasi-regulatory': 'Investasi',
  'rentabilitas-regulatory': 'Rentabilitas',
  'permodalan-regulatory': 'Permodalan',
  'tatakelola-regulatory': 'Tata Kelola',
};

// ==================== MODULE CONFIG ====================
interface ModuleConfig {
  name: string;
  label: string;
  headerRepo: any;
  paramRepo: any;
  nilaiRepo: any;
}

@Injectable()
export class RekapService {
  private readonly logger = new Logger(RekapService.name);
  private moduleConfigs: Map<string, ModuleConfig>;

  constructor(
    @InjectRepository(Operasional)
    private readonly operasionalRepo: Repository<Operasional>,
    @InjectRepository(OperasionalParameter)
    private readonly operasionalParamRepo: Repository<OperasionalParameter>,
    @InjectRepository(OperasionalNilai)
    private readonly operasionalNilaiRepo: Repository<OperasionalNilai>,

    @InjectRepository(HukumOjk)
    private readonly hukumRepo: Repository<HukumOjk>,
    @InjectRepository(HukumParameter)
    private readonly hukumParamRepo: Repository<HukumParameter>,
    @InjectRepository(HukumNilai)
    private readonly hukumNilaiRepo: Repository<HukumNilai>,

    @InjectRepository(Investasi)
    private readonly investasiRepo: Repository<Investasi>,
    @InjectRepository(InvestasiParameter)
    private readonly investasiParamRepo: Repository<InvestasiParameter>,
    @InjectRepository(InvestasiNilai)
    private readonly investasiNilaiRepo: Repository<InvestasiNilai>,

    @InjectRepository(KepatuhanOjk)
    private readonly kepatuhanRepo: Repository<KepatuhanOjk>,
    @InjectRepository(KepatuhanParameter)
    private readonly kepatuhanParamRepo: Repository<KepatuhanParameter>,
    @InjectRepository(KepatuhanNilai)
    private readonly kepatuhanNilaiRepo: Repository<KepatuhanNilai>,

    @InjectRepository(KonsentrasiProdukOjk)
    private readonly konsentrasiRepo: Repository<KonsentrasiProdukOjk>,
    @InjectRepository(KonsentrasiParameter)
    private readonly konsentrasiParamRepo: Repository<KonsentrasiParameter>,
    @InjectRepository(KonsentrasiNilai)
    private readonly konsentrasiNilaiRepo: Repository<KonsentrasiNilai>,

    @InjectRepository(Kredit)
    private readonly kreditRepo: Repository<Kredit>,
    @InjectRepository(KreditParameter)
    private readonly kreditParamRepo: Repository<KreditParameter>,
    @InjectRepository(KreditNilai)
    private readonly kreditNilaiRepo: Repository<KreditNilai>,

    @InjectRepository(Likuiditas)
    private readonly likuiditasRepo: Repository<Likuiditas>,
    @InjectRepository(LikuiditasParameter)
    private readonly likuiditasParamRepo: Repository<LikuiditasParameter>,
    @InjectRepository(LikuiditasNilai)
    private readonly likuiditasNilaiRepo: Repository<LikuiditasNilai>,

    @InjectRepository(PasarProduk)
    private readonly pasarRepo: Repository<PasarProduk>,
    @InjectRepository(PasarProdukParameter)
    private readonly pasarParamRepo: Repository<PasarProdukParameter>,
    @InjectRepository(PasarProdukNilai)
    private readonly pasarNilaiRepo: Repository<PasarProdukNilai>,

    @InjectRepository(Permodalan)
    private readonly permodalanRepo: Repository<Permodalan>,
    @InjectRepository(PermodalanParameter)
    private readonly permodalanParamRepo: Repository<PermodalanParameter>,
    @InjectRepository(PermodalanNilai)
    private readonly permodalanNilaiRepo: Repository<PermodalanNilai>,

    @InjectRepository(Rentabilitas)
    private readonly rentabilitasRepo: Repository<Rentabilitas>,
    @InjectRepository(RentabilitasParameter)
    private readonly rentabilitasParamRepo: Repository<RentabilitasParameter>,
    @InjectRepository(RentabilitasNilai)
    private readonly rentabilitasNilaiRepo: Repository<RentabilitasNilai>,

    @InjectRepository(Reputasi)
    private readonly reputasiRepo: Repository<Reputasi>,
    @InjectRepository(ReputasiParameter)
    private readonly reputasiParamRepo: Repository<ReputasiParameter>,
    @InjectRepository(ReputasiNilai)
    private readonly reputasiNilaiRepo: Repository<ReputasiNilai>,

    @InjectRepository(Strategis)
    private readonly strategisRepo: Repository<Strategis>,
    @InjectRepository(StrategisParameter)
    private readonly strategisParamRepo: Repository<StrategisParameter>,
    @InjectRepository(StrategisNilai)
    private readonly strategisNilaiRepo: Repository<StrategisNilai>,

    @InjectRepository(Tatakelola)
    private readonly tatakelolaRepo: Repository<Tatakelola>,
    @InjectRepository(TatakelolaParameter)
    private readonly tatakelolaParamRepo: Repository<TatakelolaParameter>,
    @InjectRepository(TatakelolaNilai)
    private readonly tatakelolaNilaiRepo: Repository<TatakelolaNilai>,
  ) {
    this.moduleConfigs = new Map<string, ModuleConfig>();

    this.moduleConfigs.set('operasional', {
      name: 'operasional',
      label: CATEGORY_LABEL_MAP['operasional'],
      headerRepo: operasionalRepo,
      paramRepo: operasionalParamRepo,
      nilaiRepo: operasionalNilaiRepo,
    });
    this.moduleConfigs.set('pasar-produk', {
      name: 'pasar-produk',
      label: CATEGORY_LABEL_MAP['pasar-produk'],
      headerRepo: pasarRepo,
      paramRepo: pasarParamRepo,
      nilaiRepo: pasarNilaiRepo,
    });
    this.moduleConfigs.set('likuiditas-produk', {
      name: 'likuiditas-produk',
      label: CATEGORY_LABEL_MAP['likuiditas-produk'],
      headerRepo: likuiditasRepo,
      paramRepo: likuiditasParamRepo,
      nilaiRepo: likuiditasNilaiRepo,
    });
    this.moduleConfigs.set('kredit-produk', {
      name: 'kredit-produk',
      label: CATEGORY_LABEL_MAP['kredit-produk'],
      headerRepo: kreditRepo,
      paramRepo: kreditParamRepo,
      nilaiRepo: kreditNilaiRepo,
    });
    this.moduleConfigs.set('konsentrasi-produk', {
      name: 'konsentrasi-produk',
      label: CATEGORY_LABEL_MAP['konsentrasi-produk'],
      headerRepo: konsentrasiRepo,
      paramRepo: konsentrasiParamRepo,
      nilaiRepo: konsentrasiNilaiRepo,
    });
    this.moduleConfigs.set('hukum-regulatory', {
      name: 'hukum-regulatory',
      label: CATEGORY_LABEL_MAP['hukum-regulatory'],
      headerRepo: hukumRepo,
      paramRepo: hukumParamRepo,
      nilaiRepo: hukumNilaiRepo,
    });
    this.moduleConfigs.set('kepatuhan-regulatory', {
      name: 'kepatuhan-regulatory',
      label: CATEGORY_LABEL_MAP['kepatuhan-regulatory'],
      headerRepo: kepatuhanRepo,
      paramRepo: kepatuhanParamRepo,
      nilaiRepo: kepatuhanNilaiRepo,
    });
    this.moduleConfigs.set('reputasi-regulatory', {
      name: 'reputasi-regulatory',
      label: CATEGORY_LABEL_MAP['reputasi-regulatory'],
      headerRepo: reputasiRepo,
      paramRepo: reputasiParamRepo,
      nilaiRepo: reputasiNilaiRepo,
    });
    this.moduleConfigs.set('strategis-regulatory', {
      name: 'strategis-regulatory',
      label: CATEGORY_LABEL_MAP['strategis-regulatory'],
      headerRepo: strategisRepo,
      paramRepo: strategisParamRepo,
      nilaiRepo: strategisNilaiRepo,
    });
    this.moduleConfigs.set('investasi-regulatory', {
      name: 'investasi-regulatory',
      label: CATEGORY_LABEL_MAP['investasi-regulatory'],
      headerRepo: investasiRepo,
      paramRepo: investasiParamRepo,
      nilaiRepo: investasiNilaiRepo,
    });
    this.moduleConfigs.set('rentabilitas-regulatory', {
      name: 'rentabilitas-regulatory',
      label: CATEGORY_LABEL_MAP['rentabilitas-regulatory'],
      headerRepo: rentabilitasRepo,
      paramRepo: rentabilitasParamRepo,
      nilaiRepo: rentabilitasNilaiRepo,
    });
    this.moduleConfigs.set('permodalan-regulatory', {
      name: 'permodalan-regulatory',
      label: CATEGORY_LABEL_MAP['permodalan-regulatory'],
      headerRepo: permodalanRepo,
      paramRepo: permodalanParamRepo,
      nilaiRepo: permodalanNilaiRepo,
    });
    this.moduleConfigs.set('tatakelola-regulatory', {
      name: 'tatakelola-regulatory',
      label: CATEGORY_LABEL_MAP['tatakelola-regulatory'],
      headerRepo: tatakelolaRepo,
      paramRepo: tatakelolaParamRepo,
      nilaiRepo: tatakelolaNilaiRepo,
    });
  }

  // ==================== GET ALL DATA ====================
  async getAllRekapData(query: GetAllRekapDto): Promise<RekapDataResponseDto> {
    this.logger.log(`📊 Get rekap data with query: ${JSON.stringify(query)}`);

    const {
      year,
      quarter,
      categories,
      search,
      model,
      prinsip,
      jenis,
      underlying,
    } = query;

    // Tentukan categories yang akan di-fetch
    const targetCategories =
      categories && categories.length > 0
        ? categories.filter((c) => this.moduleConfigs.has(c))
        : Array.from(this.moduleConfigs.keys());

    const result: Record<string, RekapParameterResponseDto[]> = {};
    let totalParams = 0;

    for (const catId of targetCategories) {
      const config = this.moduleConfigs.get(catId);
      if (!config) continue;

      try {
        const data = await this.fetchCategoryData(
          config,
          year,
          quarter,
          search,
          model,
          prinsip,
          jenis,
          underlying,
        );
        result[catId] = data;
        totalParams += data.length;
      } catch (error) {
        this.logger.error(
          `Error fetching data for category ${catId}: ${error.message}`,
        );
        result[catId] = [];
      }
    }

    return {
      success: true,
      data: result,
      totalCategories: targetCategories.length,
      totalParameters: totalParams,
      message: `Data berhasil dimuat untuk ${targetCategories.length} kategori`,
    };
  }

  // ==================== FETCH PER CATEGORY ====================
  private async fetchCategoryData(
    config: ModuleConfig,
    year?: number,
    quarter?: number,
    search?: string,
    model?: string,
    prinsip?: string,
    jenis?: string,
    underlying?: string[],
  ): Promise<RekapParameterResponseDto[]> {
    // Build query untuk header
    const headerQuery = config.headerRepo
      .createQueryBuilder('header')
      .leftJoinAndSelect('header.parameters', 'params')
      .leftJoinAndSelect('params.nilaiList', 'nilai')
      .orderBy('params.orderIndex', 'ASC')
      .addOrderBy('nilai.orderIndex', 'ASC');

    if (year) {
      headerQuery.andWhere('header.year = :year', { year });
    }
    if (quarter) {
      headerQuery.andWhere('header.quarter = :quarter', { quarter });
    }

    const headers = await headerQuery.getMany();
    const allParams: RekapParameterResponseDto[] = [];

    for (const header of headers) {
      const params = header.parameters || [];

      for (const param of params) {
        // Filter by search
        if (search) {
          const s = search.toLowerCase();
          const hitParam =
            (param.judul || '').toLowerCase().includes(s) ||
            String(param.nomor || '').includes(s);

          const hitNilai = (param.nilaiList || []).some((nilai) =>
            (nilai.judul?.text || '').toLowerCase().includes(s),
          );

          if (!hitParam && !hitNilai) continue;
        }

        // Filter by kategori
        const kategori = param.kategori || {};
        let shouldInclude = true;

        if (model && kategori.model !== model) {
          shouldInclude = false;
        }
        if (
          prinsip &&
          kategori.model !== 'tanpa_model' &&
          kategori.prinsip !== prinsip
        ) {
          shouldInclude = false;
        }
        if (
          jenis &&
          kategori.model === 'open_end' &&
          kategori.jenis !== jenis
        ) {
          shouldInclude = false;
        }
        if (
          underlying &&
          underlying.length > 0 &&
          kategori.model === 'terstruktur'
        ) {
          const paramUnderlying = Array.isArray(kategori.underlying)
            ? kategori.underlying
            : [];
          const hasOverlap = underlying.some((v) =>
            paramUnderlying.includes(v),
          );
          if (!hasOverlap) shouldInclude = false;
        }

        if (!shouldInclude) continue;

        const paramDto: RekapParameterResponseDto = {
          categoryId: config.name,
          categoryLabel: config.label,
          id: param.id,
          year: header.year,
          quarter: header.quarter,
          nomor: param.nomor || '',
          judul: param.judul,
          bobot: Number(param.bobot),
          kategori: kategori,
          orderIndex: param.orderIndex,
          nilaiList: (param.nilaiList || []).map((nilai) => ({
            id: nilai.id,
            nomor: nilai.nomor || '',
            bobot: Number(nilai.bobot),
            portofolio: nilai.portofolio || '',
            keterangan: nilai.keterangan || '',
            judul: nilai.judul || {},
            riskindikator: nilai.riskindikator || {},
            orderIndex: nilai.orderIndex,
          })),
        };

        allParams.push(paramDto);
      }
    }

    return allParams;
  }

  // ==================== UPDATE NILAI VALUE ====================
  async updateNilaiValue(
    dto: UpdateNilaiValueDto,
  ): Promise<UpdateNilaiResponseDto> {
    this.logger.log(`📝 Update nilai value: ${JSON.stringify(dto)}`);

    const config = this.moduleConfigs.get(dto.categoryId);
    if (!config) {
      throw new BadRequestException(
        `Kategori '${dto.categoryId}' tidak ditemukan`,
      );
    }

    // Cari nilai berdasarkan ID
    const nilai = await config.nilaiRepo.findOne({
      where: { id: dto.itemId },
      relations: ['parameter'],
    });

    if (!nilai) {
      throw new NotFoundException(
        `Nilai dengan ID ${dto.itemId} tidak ditemukan`,
      );
    }

    // Update value berdasarkan field yang dikirim
    if (dto.value !== undefined) {
      nilai.judul = nilai.judul || {};
      nilai.judul.value = dto.value;
      // PERBAIKAN: Jangan set valuePembilang otomatis
    }

    if (dto.valuePembilang !== undefined) {
      nilai.judul = nilai.judul || {};
      nilai.judul.valuePembilang = dto.valuePembilang;
    }

    if (dto.valuePenyebut !== undefined) {
      nilai.judul = nilai.judul || {};
      nilai.judul.valuePenyebut = dto.valuePenyebut;
    }

    const saved = await config.nilaiRepo.save(nilai);

    return {
      success: true,
      message: 'Nilai berhasil diupdate',
      data: {
        id: saved.id,
        nomor: saved.nomor || '',
        bobot: Number(saved.bobot),
        portofolio: saved.portofolio || '',
        keterangan: saved.keterangan || '',
        judul: saved.judul || {},
        riskindikator: saved.riskindikator || {},
        orderIndex: saved.orderIndex,
      },
    };
  }

  // ==================== GET SINGLE CATEGORY DATA ====================
  async getCategoryData(
    categoryId: string,
    year?: number,
    quarter?: number,
  ): Promise<RekapParameterResponseDto[]> {
    const config = this.moduleConfigs.get(categoryId);
    if (!config) {
      throw new NotFoundException(`Kategori '${categoryId}' tidak ditemukan`);
    }

    return this.fetchCategoryData(config, year, quarter);
  }

  // ==================== GET AVAILABLE CATEGORIES ====================
  getAvailableCategories() {
    return Array.from(this.moduleConfigs.entries()).map(([id, config]) => ({
      id,
      label: config.label,
    }));
  }

  // ==================== GET ALL MODULE CONFIGS (untuk debugging) ====================
  getModuleConfigs() {
    return this.moduleConfigs;
  }
}