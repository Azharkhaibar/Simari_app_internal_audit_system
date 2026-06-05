import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RekapResult } from '../../rekap-data-profile-holding/rekap-data-1/entities/rekap-result.entity';
import { Investasi } from '../../investasi/new-investasi/entities/new-investasi.entity';
import { Pasar } from '../../pasar/pasar/entities/pasar.entity';
import { Likuiditas } from '../../likuiditas/likuiditas/entities/likuiditas.entity';
import { Operasional } from '../../operasional/operasional/entities/operasional.entity';
import { Hukum } from '../../hukum/hukum/entities/hukum.entity';
import { Stratejik } from '../../stratejik/stratejik/entities/stratejik.entity';
import { Kepatuhan } from '../../kepatuhan/kepatuhan/entities/kepatuhan.entity';
import { Reputasi } from '../../reputasi/reputasi/entities/reputasi.entity';

@Injectable()
export class DashboardHoldingService {
  constructor(
    @InjectRepository(RekapResult)
    private readonly rekapResultRepo: Repository<RekapResult>,
    @InjectRepository(Investasi) private readonly investasiRepo: Repository<Investasi>,
    @InjectRepository(Pasar) private readonly pasarRepo: Repository<Pasar>,
    @InjectRepository(Likuiditas) private readonly likuiditasRepo: Repository<Likuiditas>,
    @InjectRepository(Operasional) private readonly operasionalRepo: Repository<Operasional>,
    @InjectRepository(Hukum) private readonly hukumRepo: Repository<Hukum>,
    @InjectRepository(Stratejik) private readonly stratejikRepo: Repository<Stratejik>,
    @InjectRepository(Kepatuhan) private readonly kepatuhanRepo: Repository<Kepatuhan>,
    @InjectRepository(Reputasi) private readonly reputasiRepo: Repository<Reputasi>,
  ) {}

  async getDashboardData(year: number, quarter: string) {
    // 1. Fetch Rekap Result
    const rekapResult = await this.rekapResultRepo.findOne({
      where: { year, quarter },
    });

    const kompositA = rekapResult ? Number(rekapResult.kompositA) : 0;
    const kompositB = rekapResult ? Number(rekapResult.kompositB) : 0;
    const total = (kompositA + kompositB) / 2;

    // 2. Fetch all modules data for TopRisksList and RiskAttention
    const modules = [
      { type: 'investasi', label: 'Investasi', repo: this.investasiRepo },
      { type: 'pasar', label: 'Pasar', repo: this.pasarRepo },
      { type: 'likuiditas', label: 'Likuiditas', repo: this.likuiditasRepo },
      { type: 'operasional', label: 'Operasional', repo: this.operasionalRepo },
      { type: 'hukum', label: 'Hukum', repo: this.hukumRepo },
      { type: 'stratejik', label: 'Stratejik', repo: this.stratejikRepo },
      { type: 'kepatuhan', label: 'Kepatuhan', repo: this.kepatuhanRepo },
      { type: 'reputasi', label: 'Reputasi', repo: this.reputasiRepo },
    ];

    const riskDataPromises = modules.map(async (mod) => {
      const rows = await mod.repo.find({
        where: { year, quarter, isDeleted: false } as any,
      });

      let totalWeighted = 0;
      const categories = { high: 0, moderateHigh: 0, moderate: 0, lowModerate: 0, low: 0 };

      rows.forEach((item: any) => {
        if (item.isSectionOnly) return;

        const weighted = Number(item.weighted) || 0;
        totalWeighted += weighted;

        const peringkat = Number(item.peringkat) || 0;
        if (peringkat === 5) categories.high++;
        else if (peringkat === 4) categories.moderateHigh++;
        else if (peringkat === 3) categories.moderate++;
        else if (peringkat === 2) categories.lowModerate++;
        else if (peringkat === 1) categories.low++;
      });

      return {
        type: mod.type,
        label: mod.label,
        categories,
        summary: totalWeighted,
        skorRisiko: totalWeighted,
        subRiskCount: rows.length,
      };
    });

    let riskData = await Promise.all(riskDataPromises);
    
    // Remove empty risks and sort by skorRisiko descending
    riskData = riskData
      .filter((r) => r.subRiskCount > 0)
      .sort((a, b) => b.skorRisiko - a.skorRisiko);

    return {
      kompositA,
      kompositB,
      total,
      riskData,
    };
  }
}
