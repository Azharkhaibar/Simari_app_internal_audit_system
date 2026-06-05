// src/modules/ringkasan/ringkasan.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Import entities dari 8 modul (flat rows only, tidak perlu section entities)
import { Investasi } from 'src/investasi/new-investasi/entities/new-investasi.entity';
import { Pasar } from 'src/pasar/pasar/entities/pasar.entity';
import { Likuiditas } from 'src/likuiditas/likuiditas/entities/likuiditas.entity';
import { Operasional } from 'src/operasional/operasional/entities/operasional.entity';
import { Hukum } from 'src/hukum/hukum/entities/hukum.entity';
import { Stratejik } from 'src/stratejik/stratejik/entities/stratejik.entity';
import { Kepatuhan } from 'src/kepatuhan/kepatuhan/entities/kepatuhan.entity';
import { Reputasi } from 'src/reputasi/reputasi/entities/reputasi.entity';

import {
  GetRingkasanDto,
  RingkasanResponseDto,
  RingkasanItem,
  RingkasanGroup,
} from './dto/ringkasan.dto';

@Injectable()
export class RingkasanService {
  constructor(
    @InjectRepository(Investasi)
    private readonly investasiRepo: Repository<Investasi>,

    @InjectRepository(Pasar)
    private readonly pasarRepo: Repository<Pasar>,

    @InjectRepository(Likuiditas)
    private readonly likuiditasRepo: Repository<Likuiditas>,

    @InjectRepository(Operasional)
    private readonly operasionalRepo: Repository<Operasional>,

    @InjectRepository(Hukum)
    private readonly hukumRepo: Repository<Hukum>,

    @InjectRepository(Stratejik)
    private readonly stratejikRepo: Repository<Stratejik>,

    @InjectRepository(Kepatuhan)
    private readonly kepatuhanRepo: Repository<Kepatuhan>,

    @InjectRepository(Reputasi)
    private readonly reputasiRepo: Repository<Reputasi>,
  ) {}

  async getRingkasanData(dto: GetRingkasanDto): Promise<RingkasanResponseDto> {
    const { year, quarter } = dto;

    const [
      investasiRows,
      pasarRows,
      likuiditasRows,
      operasionalRows,
      hukumRows,
      stratejikRows,
      kepatuhanRows,
      reputasiRows,
    ] = await Promise.all([
      this.getFlatRows(this.investasiRepo, year, quarter),
      this.getFlatRows(this.pasarRepo, year, quarter),
      this.getFlatRows(this.likuiditasRepo, year, quarter),
      this.getFlatRows(this.operasionalRepo, year, quarter),
      this.getFlatRows(this.hukumRepo, year, quarter),
      this.getFlatRows(this.stratejikRepo, year, quarter),
      this.getFlatRows(this.kepatuhanRepo, year, quarter),
      this.getFlatRows(this.reputasiRepo, year, quarter),
    ]);

    // Filter pasar: skip isSectionOnly
    const filteredPasar = pasarRows.filter((r) => !r.isSectionOnly);

    // Group by section
    const investasiGrouped = this.groupBySection(investasiRows, 'investasi');
    const pasarGrouped = this.groupBySection(filteredPasar, 'pasar');
    const likuiditasGrouped = this.groupBySection(likuiditasRows, 'likuiditas');
    const operasionalGrouped = this.groupBySection(
      operasionalRows,
      'operasional',
    );
    const hukumGrouped = this.groupBySection(hukumRows, 'hukum');
    const stratejikGrouped = this.groupBySection(stratejikRows, 'stratejik');
    const kepatuhanGrouped = this.groupBySection(kepatuhanRows, 'kepatuhan');
    const reputasiGrouped = this.groupBySection(reputasiRows, 'reputasi');

    // Calculate totals
    const allRows = [
      ...investasiRows.map((r) => ({ ...r, riskType: 'investasi' })),
      ...filteredPasar.map((r) => ({ ...r, riskType: 'pasar' })),
      ...likuiditasRows.map((r) => ({ ...r, riskType: 'likuiditas' })),
      ...operasionalRows.map((r) => ({ ...r, riskType: 'operasional' })),
      ...hukumRows.map((r) => ({ ...r, riskType: 'hukum' })),
      ...stratejikRows.map((r) => ({ ...r, riskType: 'stratejik' })),
      ...kepatuhanRows.map((r) => ({ ...r, riskType: 'kepatuhan' })),
      ...reputasiRows.map((r) => ({ ...r, riskType: 'reputasi' })),
    ];

    const riskTypeTotals: Record<string, number> = {};
    allRows.forEach((r) => {
      riskTypeTotals[r.riskType] = (riskTypeTotals[r.riskType] || 0) + 1;
    });

    return {
      investasi: investasiGrouped,
      pasar: pasarGrouped,
      likuiditas: likuiditasGrouped,
      operasional: operasionalGrouped,
      hukum: hukumGrouped,
      stratejik: stratejikGrouped,
      kepatuhan: kepatuhanGrouped,
      reputasi: reputasiGrouped,
      riskTypeTotals,
    };
  }

  // ===================== GET FLAT ROWS =====================
  private async getFlatRows(
    repo: Repository<any>,
    year: number,
    quarter: string,
  ): Promise<any[]> {
    // ✅ TAMBAHKAN FILTER isDeleted: false
    return repo.find({
      where: {
        year,
        quarter,
        isDeleted: false, // ✅ FILTER SOFT DELETE
      },
      order: { no: 'ASC', subNo: 'ASC' },
    });
  }

  private groupBySection(rows: any[], riskType: string): RingkasanGroup[] {
    const map = new Map<string, any[]>();

    rows.forEach((r) => {
      const key = `${r.no || ''}|${r.sectionLabel || ''}|${r.bobotSection || 0}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });

    return Array.from(map.entries()).map(([key, items]) => {
      const [sectionNo, sectionLabel, bobotSection] = key.split('|');
      return {
        riskType,
        sectionNo,
        sectionLabel,
        bobotSection: parseFloat(bobotSection) || 0,
        items: items.map((item) => this.normalizeItem(item, riskType)),
      };
    });
  }

  private normalizeItem(row: any, riskType: string): RingkasanItem {
    return {
      id: row.id,
      year: row.year,
      quarter: row.quarter,
      riskType,
      sectionNo: row.no || '',
      sectionLabel: row.sectionLabel || '',
      bobotSection: row.bobotSection || 0,
      subNo: row.subNo || '',
      indikator: row.indikator || '',
      bobotIndikator: row.bobotIndikator || 0,
      mode: row.mode || 'RASIO',
      isPercent: row.isPercent || false,
      hasil: row.hasil ?? null,
      hasilText: row.hasilText || null,
      peringkat: row.peringkat || 0,
    };
  }
}
