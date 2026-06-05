// src/features/Dashboard/pages/RiskProfile/pages/Kepatuhan/services/kepatuhan.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not } from 'typeorm';
import { KepatuhanSection } from './entities/kepatuhan-section.entity';
import {
  Kepatuhan,
  CalculationMode,
  Quarter,
} from './entities/kepatuhan.entity';
import { CreateKepatuhanDto } from './dto/create-kepatuhan.dto';
import { UpdateKepatuhanSectionDto } from './dto/update-kepatuhan-section.dto';
import { UpdateKepatuhanDto } from './dto/update-kepatuhan.dto';
import { CreateKepatuhanSectionDto } from './dto/create-kepatuhan-section.dto';

@Injectable()
export class KepatuhanService {
  constructor(
    @InjectRepository(KepatuhanSection)
    private readonly kepatuhanSectionRepository: Repository<KepatuhanSection>,

    @InjectRepository(Kepatuhan)
    private readonly kepatuhanRepository: Repository<Kepatuhan>,
  ) {}

  // ========== SECTION SERVICES ==========

  async createSection(
    createDto: CreateKepatuhanSectionDto,
    createdBy?: string,
  ): Promise<KepatuhanSection> {
    const deletedSection = await this.kepatuhanSectionRepository.findOne({
      where: {
        no: createDto.no,
        parameter: createDto.parameter,
        year: createDto.year,
        quarter: createDto.quarter,
        isDeleted: true,
      },
    });

    if (deletedSection) {
      console.log(
        `🔄 Reactivating deleted section: ${deletedSection.no} - ${deletedSection.parameter}`,
      );

      deletedSection.isDeleted = false;
      deletedSection.isActive = createDto.isActive ?? true;
      deletedSection.bobotSection =
        createDto.bobotSection || deletedSection.bobotSection;
      deletedSection.description =
        createDto.description || deletedSection.description;
      deletedSection.sortOrder =
        createDto.sortOrder || deletedSection.sortOrder;

      if (createdBy) {
        deletedSection.updatedBy = createdBy;
      }

      return await this.kepatuhanSectionRepository.save(deletedSection);
    }

    const existingSection = await this.kepatuhanSectionRepository.findOne({
      where: {
        no: createDto.no,
        parameter: createDto.parameter,
        year: createDto.year,
        quarter: createDto.quarter,
        isDeleted: false,
      },
    });

    if (existingSection) {
      throw new ConflictException(
        `Section dengan nomor "${createDto.no}" dan nama "${createDto.parameter}" sudah ada pada periode ${createDto.year}-${createDto.quarter}`,
      );
    }

    const sectionData: Partial<KepatuhanSection> = {
      no: createDto.no,
      parameter: createDto.parameter,
      bobotSection: createDto.bobotSection || 100,
      description: createDto.description || null,
      sortOrder: createDto.sortOrder || 0,
      year: createDto.year,
      quarter: createDto.quarter,
      isActive: createDto.isActive ?? true,
      isDeleted: false,
    };

    if (createdBy) {
      sectionData.createdBy = createdBy;
    }

    const section = this.kepatuhanSectionRepository.create(sectionData);
    return await this.kepatuhanSectionRepository.save(section);
  }

  async findAllSections(isActive?: boolean): Promise<KepatuhanSection[]> {
    const where: any = { isDeleted: false };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await this.kepatuhanSectionRepository.find({
      where,
      order: { year: 'DESC', quarter: 'DESC', sortOrder: 'ASC', no: 'ASC' },
    });
  }

  async findSectionById(id: number): Promise<KepatuhanSection> {
    try {
      const section = await this.kepatuhanSectionRepository
        .createQueryBuilder('section')
        .where('section.id = :id', { id })
        .andWhere('section.is_deleted = false')
        .getOne();

      if (!section) {
        throw new NotFoundException(`Section dengan ID ${id} tidak ditemukan`);
      }

      return section;
    } catch (error) {
      console.error(`❌ [SERVICE] Error in findSectionById:`, error);
      throw error;
    }
  }

  async findSectionsByPeriod(
    year: number,
    quarter: Quarter,
  ): Promise<KepatuhanSection[]> {
    return await this.kepatuhanSectionRepository.find({
      where: {
        year,
        quarter,
        isDeleted: false,
        isActive: true,
      },
      order: { sortOrder: 'ASC', no: 'ASC' },
    });
  }

  async updateSection(
    id: number,
    updateDto: UpdateKepatuhanSectionDto,
    updatedBy?: string,
  ): Promise<KepatuhanSection> {
    const section = await this.findSectionById(id);

    const checkNo = updateDto.no || section.no;
    const checkParam = updateDto.parameter || section.parameter;
    const checkYear = updateDto.year || section.year;
    const checkQuarter = updateDto.quarter || section.quarter;

    const existing = await this.kepatuhanSectionRepository.findOne({
      where: {
        no: checkNo,
        parameter: checkParam,
        year: checkYear,
        quarter: checkQuarter,
        isDeleted: false,
        id: Not(id),
      },
    });

    if (existing) {
      throw new ConflictException(
        `Section dengan nomor "${checkNo}" dan nama "${checkParam}" sudah ada pada periode ${checkYear}-${checkQuarter}`,
      );
    }

    if (updateDto.no !== undefined) section.no = updateDto.no;
    if (updateDto.parameter !== undefined)
      section.parameter = updateDto.parameter;
    if (updateDto.bobotSection !== undefined)
      section.bobotSection = updateDto.bobotSection;
    if (updateDto.description !== undefined)
      section.description = updateDto.description;
    if (updateDto.sortOrder !== undefined)
      section.sortOrder = updateDto.sortOrder;
    if (updateDto.isActive !== undefined) section.isActive = updateDto.isActive;
    if (updateDto.year !== undefined) section.year = updateDto.year;
    if (updateDto.quarter !== undefined) section.quarter = updateDto.quarter;

    if (updatedBy) {
      section.updatedBy = updatedBy;
    }

    return await this.kepatuhanSectionRepository.save(section);
  }

  async deleteSection(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    const section = await this.kepatuhanSectionRepository.findOne({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException(`Section dengan ID ${id} tidak ditemukan`);
    }

    const countIndikator = await this.kepatuhanRepository.count({
      where: { sectionId: id, isDeleted: false },
    });

    if (countIndikator > 0) {
      throw new ConflictException(
        `Section tidak dapat dihapus karena masih digunakan oleh ${countIndikator} indikator`,
      );
    }

    section.isDeleted = true;
    await this.kepatuhanSectionRepository.save(section);

    return {
      success: true,
      message: `Section "${section.parameter}" berhasil dihapus`,
    };
  }

  // ========== INDIKATOR SERVICES ==========

  async createIndikator(
    createDto: CreateKepatuhanDto,
    createdBy?: string,
  ): Promise<Kepatuhan> {
    const section = await this.findSectionById(createDto.sectionId);

    const deletedIndikator = await this.kepatuhanRepository.findOne({
      where: {
        year: createDto.year,
        quarter: createDto.quarter,
        sectionId: createDto.sectionId,
        subNo: createDto.subNo,
        isDeleted: true,
      },
    });

    if (deletedIndikator) {
      console.log(
        `🔄 Reactivating deleted indicator: ${deletedIndikator.subNo} - ${deletedIndikator.indikator}`,
      );

      deletedIndikator.isDeleted = false;
      deletedIndikator.indikator = createDto.indikator;
      deletedIndikator.bobotIndikator = createDto.bobotIndikator;
      deletedIndikator.sumberRisiko = createDto.sumberRisiko || null;
      deletedIndikator.dampak = createDto.dampak || null;
      deletedIndikator.mode = createDto.mode;
      deletedIndikator.formula = createDto.formula || null;
      deletedIndikator.isPercent = createDto.isPercent || false;
      deletedIndikator.pembilangLabel = createDto.pembilangLabel || null;
      deletedIndikator.pembilangValue = createDto.pembilangValue || null;
      deletedIndikator.penyebutLabel = createDto.penyebutLabel || null;
      deletedIndikator.penyebutValue = createDto.penyebutValue || null;
      deletedIndikator.hasil = createDto.hasil || null;
      deletedIndikator.hasilText = createDto.hasilText || null;
      deletedIndikator.peringkat = createDto.peringkat;

      deletedIndikator.weighted =
        createDto.weighted ||
        this.calculateWeighted(
          section.bobotSection,
          createDto.bobotIndikator,
          createDto.peringkat,
        );

      deletedIndikator.keterangan = createDto.keterangan || null;
      deletedIndikator.version += 1;

      if (createdBy) {
        deletedIndikator.updatedBy = createdBy;
      }

      return await this.kepatuhanRepository.save(deletedIndikator);
    }

    const existingIndikator = await this.kepatuhanRepository.findOne({
      where: {
        year: createDto.year,
        quarter: createDto.quarter,
        sectionId: createDto.sectionId,
        subNo: createDto.subNo,
        isDeleted: false,
      },
    });

    if (existingIndikator) {
      throw new ConflictException(
        `Indikator dengan subNo "${createDto.subNo}" sudah ada pada periode ${createDto.year}-${createDto.quarter} di section ini`,
      );
    }

    this.validateModeSpecificFields(createDto);

    const weighted =
      createDto.weighted ||
      this.calculateWeighted(
        section.bobotSection,
        createDto.bobotIndikator,
        createDto.peringkat,
      );

    const kepatuhanData: Partial<Kepatuhan> = {
      year: createDto.year,
      quarter: createDto.quarter,
      sectionId: createDto.sectionId,
      no: section.no,
      sectionLabel: section.parameter,
      bobotSection: section.bobotSection,
      subNo: createDto.subNo,
      indikator: createDto.indikator,
      bobotIndikator: createDto.bobotIndikator,
      sumberRisiko: createDto.sumberRisiko || null,
      dampak: createDto.dampak || null,
      low: createDto.low || null,
      lowToModerate: createDto.lowToModerate || null,
      moderate: createDto.moderate || null,
      moderateToHigh: createDto.moderateToHigh || null,
      high: createDto.high || null,
      mode: createDto.mode,
      formula: createDto.formula || null,
      isPercent: createDto.isPercent || false,
      pembilangLabel: createDto.pembilangLabel || null,
      pembilangValue: createDto.pembilangValue || null,
      penyebutLabel: createDto.penyebutLabel || null,
      penyebutValue: createDto.penyebutValue || null,
      hasil: createDto.hasil || null,
      hasilText: createDto.hasilText || null,
      peringkat: createDto.peringkat,
      weighted: weighted,
      keterangan: createDto.keterangan || null,
      isValidated: false,
      version: 1,
      isDeleted: false,
    };

    if (createdBy) {
      kepatuhanData.createdBy = createdBy;
    }

    const kepatuhan = this.kepatuhanRepository.create(kepatuhanData);
    return await this.kepatuhanRepository.save(kepatuhan);
  }

  async findIndikatorsByPeriod(
    year: number,
    quarter: Quarter,
  ): Promise<Kepatuhan[]> {
    return await this.kepatuhanRepository.find({
      where: {
        year,
        quarter,
        isDeleted: false,
      },
      relations: ['section'],
      order: {
        no: 'ASC',
        subNo: 'ASC',
      },
    });
  }

  async findAllIndikators(): Promise<Kepatuhan[]> {
    return await this.kepatuhanRepository.find({
      where: { isDeleted: false },
      relations: ['section'],
      order: {
        year: 'DESC',
        quarter: 'DESC',
        no: 'ASC',
        subNo: 'ASC',
      },
    });
  }

  async findIndikatorById(id: number): Promise<Kepatuhan> {
    const indikator = await this.kepatuhanRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['section'],
    });

    if (!indikator) {
      throw new NotFoundException(`Indikator dengan ID ${id} tidak ditemukan`);
    }

    return indikator;
  }

  async updateIndikator(
    id: number,
    updateDto: UpdateKepatuhanDto,
    updatedBy?: string,
  ): Promise<Kepatuhan> {
    const indikator = await this.findIndikatorById(id);

    if (updateDto.sectionId && updateDto.sectionId !== indikator.sectionId) {
      const newSection = await this.findSectionById(updateDto.sectionId);

      updateDto.no = newSection.no;
      updateDto.sectionLabel = newSection.parameter;
      updateDto.bobotSection = newSection.bobotSection;
    }

    if (
      (updateDto.year && updateDto.year !== indikator.year) ||
      (updateDto.quarter && updateDto.quarter !== indikator.quarter) ||
      (updateDto.subNo && updateDto.subNo !== indikator.subNo)
    ) {
      const year = updateDto.year || indikator.year;
      const quarter = updateDto.quarter || indikator.quarter;
      const sectionId = updateDto.sectionId || indikator.sectionId;
      const subNo = updateDto.subNo || indikator.subNo;

      const existing = await this.kepatuhanRepository.findOne({
        where: {
          year,
          quarter,
          sectionId,
          subNo,
          isDeleted: false,
          id: Not(id),
        },
      });

      if (existing) {
        throw new ConflictException(
          `Indikator dengan subNo "${subNo}" sudah ada pada periode ${year}-${quarter} di section ini`,
        );
      }
    }

    if (updateDto.mode) {
      const validationDto: Partial<CreateKepatuhanDto> = {
        mode: updateDto.mode,
        pembilangValue: updateDto.pembilangValue,
        penyebutValue: updateDto.penyebutValue,
        hasilText: updateDto.hasilText,
      };
      this.validateModeSpecificFields(validationDto);
    }

    if (updateDto.bobotIndikator || updateDto.peringkat) {
      const bobotIndikator =
        updateDto.bobotIndikator || indikator.bobotIndikator;
      const peringkat = updateDto.peringkat || indikator.peringkat;

      updateDto.weighted = this.calculateWeighted(
        indikator.bobotSection,
        bobotIndikator,
        peringkat,
      );
    }

    Object.keys(updateDto).forEach((key) => {
      if (updateDto[key] !== undefined) {
        indikator[key] = updateDto[key];
      }
    });

    if (updatedBy) {
      indikator.updatedBy = updatedBy;
      indikator.version += 1;
    }

    return await this.kepatuhanRepository.save(indikator);
  }

  async deleteIndikator(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    const indikator = await this.kepatuhanRepository.findOne({
      where: { id },
    });

    if (!indikator) {
      throw new NotFoundException(`Indikator dengan ID ${id} tidak ditemukan`);
    }

    indikator.isDeleted = true;
    indikator.deletedAt = new Date();
    await this.kepatuhanRepository.save(indikator);

    return {
      success: true,
      message: `Indikator "${indikator.indikator}" (${indikator.subNo}) berhasil dihapus`,
    };
  }

  async searchIndikators(
    query?: string,
    year?: number,
    quarter?: Quarter,
  ): Promise<Kepatuhan[]> {
    const where: any = { isDeleted: false };

    if (year) where.year = year;
    if (quarter) where.quarter = quarter;

    if (query) {
      const searchConditions = [
        { subNo: Like(`%${query}%`), ...where },
        { indikator: Like(`%${query}%`), ...where },
        { sumberRisiko: Like(`%${query}%`), ...where },
        { dampak: Like(`%${query}%`), ...where },
        { keterangan: Like(`%${query}%`), ...where },
        { hasilText: Like(`%${query}%`), ...where },
      ];

      return await this.kepatuhanRepository.find({
        where: searchConditions,
        relations: ['section'],
      });
    }

    return await this.kepatuhanRepository.find({
      where,
      relations: ['section'],
    });
  }

  async getTotalWeightedByPeriod(
    year: number,
    quarter: Quarter,
  ): Promise<number> {
    const result = await this.kepatuhanRepository
      .createQueryBuilder('kepatuhan')
      .select('SUM(kepatuhan.weighted)', 'total')
      .where('kepatuhan.year = :year', { year })
      .andWhere('kepatuhan.quarter = :quarter', { quarter })
      .andWhere('kepatuhan.is_deleted = false')
      .getRawOne();

    return parseFloat(result?.total || 0) || 0;
  }

  // ========== COMPLEX QUERIES ==========

  async getSectionsWithIndicatorsByPeriod(
    year: number,
    quarter: Quarter,
  ): Promise<any> {
    try {
      console.log(
        `Loading sections with indicators for period: ${year}-${quarter}`,
      );

      const sections = await this.kepatuhanSectionRepository.find({
        where: {
          year,
          quarter,
          isDeleted: false,
          isActive: true,
        },
        order: { sortOrder: 'ASC', no: 'ASC' },
      });

      console.log(
        `Total sections for period ${year}-${quarter}: ${sections.length}`,
      );

      const sectionsWithIndicators = await Promise.all(
        sections.map(async (section) => {
          const indicators = await this.kepatuhanRepository.find({
            where: {
              sectionId: section.id,
              year,
              quarter,
              isDeleted: false,
            },
            order: { subNo: 'ASC' },
          });

          console.log(`Section ${section.no}: ${indicators.length} indicators`);

          const totalWeighted = indicators.reduce(
            (sum, indicator) => sum + (Number(indicator.weighted) || 0),
            0,
          );

          return {
            id: section.id,
            no: section.no,
            parameter: section.parameter,
            bobotSection: section.bobotSection,
            description: section.description,
            year: section.year,
            quarter: section.quarter,
            isActive: section.isActive,
            indicators: indicators.map((indicator) => ({
              id: indicator.id,
              subNo: indicator.subNo,
              indikator: indicator.indikator,
              bobotIndikator: indicator.bobotIndikator,
              mode: indicator.mode,
              hasil: indicator.hasil,
              hasilText: indicator.hasilText,
              peringkat: indicator.peringkat,
              weighted: indicator.weighted,
              sumberRisiko: indicator.sumberRisiko,
              dampak: indicator.dampak,
              keterangan: indicator.keterangan,
              isValidated: indicator.isValidated,
              pembilangLabel: indicator.pembilangLabel,
              pembilangValue: indicator.pembilangValue,
              penyebutLabel: indicator.penyebutLabel,
              penyebutValue: indicator.penyebutValue,
              formula: indicator.formula,
              isPercent: indicator.isPercent,
              low: indicator.low,
              lowToModerate: indicator.lowToModerate,
              moderate: indicator.moderate,
              moderateToHigh: indicator.moderateToHigh,
              high: indicator.high,
            })),
            totalWeighted,
            indicatorCount: indicators.length,
            hasIndicators: indicators.length > 0,
          };
        }),
      );

      const sectionsWithData = sectionsWithIndicators.filter(
        (s) => s.indicators.length > 0,
      );

      const overallTotalWeighted = sectionsWithData.reduce(
        (sum, section) => sum + (section.totalWeighted || 0),
        0,
      );

      return {
        success: true,
        year,
        quarter,
        sections: sectionsWithIndicators,
        sectionsWithIndicators: sectionsWithData,
        overallTotalWeighted,
        sectionCount: sectionsWithIndicators.length,
        totalIndicators: sectionsWithData.reduce(
          (sum, section) => sum + section.indicatorCount,
          0,
        ),
      };
    } catch (error) {
      console.error('Error in getSectionsWithIndicatorsByPeriod:', error);
      throw error;
    }
  }

  async getPeriods(): Promise<Array<{ year: number; quarter: Quarter }>> {
    const periods = await this.kepatuhanRepository
      .createQueryBuilder('kepatuhan')
      .select(['kepatuhan.year', 'kepatuhan.quarter'])
      .where('kepatuhan.is_deleted = false')
      .groupBy('kepatuhan.year, kepatuhan.quarter')
      .orderBy('kepatuhan.year', 'DESC')
      .addOrderBy('kepatuhan.quarter', 'DESC')
      .getRawMany();

    return periods.map((p) => ({
      year: p.kepatuhan_year,
      quarter: p.kepatuhan_quarter,
    }));
  }

  async getIndikatorCountByPeriod(
    year: number,
    quarter: Quarter,
  ): Promise<number> {
    try {
      const result = await this.kepatuhanRepository
        .createQueryBuilder('kepatuhan')
        .select('COUNT(kepatuhan.id)', 'count')
        .where('kepatuhan.year = :year', { year })
        .andWhere('kepatuhan.quarter = :quarter', { quarter })
        .andWhere('kepatuhan.is_deleted = false')
        .getRawOne();

      return parseInt(result?.count || 0) || 0;
    } catch (error) {
      console.error('Error in getIndikatorCountByPeriod:', error);
      return 0;
    }
  }

  async duplicateIndikatorToNewPeriod(
    sourceId: number,
    targetYear: number,
    targetQuarter: Quarter,
    createdBy?: string,
  ): Promise<Kepatuhan> {
    const source = await this.findIndikatorById(sourceId);

    const existing = await this.kepatuhanRepository.findOne({
      where: {
        year: targetYear,
        quarter: targetQuarter,
        sectionId: source.sectionId,
        subNo: source.subNo,
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Indikator dengan subNo "${source.subNo}" sudah ada pada periode ${targetYear}-${targetQuarter}`,
      );
    }

    const newIndikatorData: Partial<Kepatuhan> = {
      ...source,
      id: undefined,
      year: targetYear,
      quarter: targetQuarter,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      revisionNotes: `Duplikasi dari periode ${source.year}-${source.quarter}`,
      isDeleted: false,
    };

    if (createdBy) {
      newIndikatorData.createdBy = createdBy;
    }

    const newIndikator = this.kepatuhanRepository.create(newIndikatorData);
    return await this.kepatuhanRepository.save(newIndikator);
  }

  // ========== HELPER METHODS ==========

  private validateModeSpecificFields(dto: Partial<CreateKepatuhanDto>): void {
    const mode = dto.mode;

    if (mode === CalculationMode.RASIO) {
      if (dto.pembilangValue !== undefined && dto.pembilangValue < 0) {
        throw new BadRequestException(
          'Pembilang value tidak boleh negatif untuk mode RASIO',
        );
      }
      if (dto.penyebutValue !== undefined && dto.penyebutValue <= 0) {
        throw new BadRequestException(
          'Penyebut value harus lebih besar dari 0 untuk mode RASIO',
        );
      }
    } else if (mode === CalculationMode.NILAI_TUNGGAL) {
      if (dto.penyebutValue !== undefined && dto.penyebutValue < 0) {
        throw new BadRequestException(
          'Nilai penyebut tidak boleh negatif untuk mode NILAI_TUNGGAL',
        );
      }
    } else if (mode === CalculationMode.TEKS) {
      if (!dto.hasilText || !dto.hasilText.trim()) {
        throw new BadRequestException('Hasil text wajib diisi untuk mode TEKS');
      }
    }
  }

  private calculateWeighted(
    bobotSection: number,
    bobotIndikator: number,
    peringkat: number,
  ): number {
    return (bobotSection * bobotIndikator * peringkat) / 10000;
  }
}
