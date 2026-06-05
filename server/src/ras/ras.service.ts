// src/modules/ras/ras.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { RasData } from './entities/ras.entity';
import { CreateRasDto } from './dto/create-ra.dto';
import { UpdateRasDto } from './dto/update-ra.dto';
import { UpdateMonthlyValuesDto } from './dto/update-monthly-values.dto';
import { FilterRasDto } from './dto/filter-ras.dto';
import { ImportRasDto } from './dto/import-ras.dto';

@Injectable()
export class RasService {
  private readonly logger = new Logger(RasService.name);

  constructor(
    @InjectRepository(RasData)
    private readonly rasRepository: Repository<RasData>,
  ) {}

  /**
   * Create new RAS data
   */
  async create(createRasDto: CreateRasDto): Promise<RasData> {
    try {
      if (!createRasDto.parameter?.trim()) {
        throw new BadRequestException('Parameter tidak boleh kosong');
      }
      if (!createRasDto.riskCategory?.trim()) {
        throw new BadRequestException('Kategori risiko tidak boleh kosong');
      }
      if (!createRasDto.year) {
        throw new BadRequestException('Tahun tidak boleh kosong');
      }
      this.logger.log(`Creating new RAS data: ${JSON.stringify(createRasDto)}`);

      // Check for duplicate parameter in the same year
      const existing = await this.rasRepository.findOne({
        where: {
          year: createRasDto.year,
          parameter: ILike(createRasDto.parameter.trim()),
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Parameter "${createRasDto.parameter}" sudah ada di tahun ${createRasDto.year}`,
        );
      }

      // Auto assign number if not provided
      let autoNo = createRasDto.no;
      if (autoNo === undefined || autoNo === null) {
        const maxNoResult = await this.rasRepository
          .createQueryBuilder('ras')
          .select('MAX(ras.no)', 'max')
          .where('ras.year = :year', { year: createRasDto.year })
          .andWhere('ras.riskCategory = :category', {
            category: createRasDto.riskCategory,
          })
          .getRawOne();

        const maxNo = maxNoResult?.max ? Number(maxNoResult.max) : 0;
        autoNo = maxNo + 1;
      }

      // Auto generate groupId if not provided
      let groupId = createRasDto.groupId;
      if (!groupId) {
        const historical = await this.rasRepository.findOne({
          where: {
            parameter: ILike(createRasDto.parameter.trim()),
          },
          order: { year: 'DESC', createdAt: 'DESC' },
        });

        if (historical?.groupId) {
          groupId = historical.groupId;
        } else {
          groupId = `GID-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        }
      }

      // Bersihkan monthlyValues
      const cleanedMonthlyValues: Record<number, any> = {};
      if (createRasDto.monthlyValues) {
        Object.entries(createRasDto.monthlyValues).forEach(([key, value]) => {
          const monthKey = Number(key);
          if (!isNaN(monthKey) && monthKey >= 0 && monthKey <= 11) {
            cleanedMonthlyValues[monthKey] = {
              num: value?.num ?? null,
              den: value?.den ?? null,
              man: value?.man ?? null,
            };
          }
        });
      }

      // Buat entity instance - PERBAIKAN: assign string kosong untuk field nullable
      const rasData = new RasData();
      rasData.year = createRasDto.year;
      rasData.riskCategory = createRasDto.riskCategory;
      rasData.parameter = createRasDto.parameter.trim();
      rasData.riskStance = createRasDto.riskStance || 'Moderat';
      rasData.unitType = createRasDto.unitType || 'PERCENTAGE';
      rasData.no = autoNo;
      rasData.statement = createRasDto.statement || '';
      rasData.formulasi = createRasDto.formulasi || '';
      rasData.dataTypeExplanation = createRasDto.dataTypeExplanation || '';
      rasData.notes = createRasDto.notes || '';
      rasData.rkapTarget = createRasDto.rkapTarget || '';
      rasData.rasLimit = createRasDto.rasLimit || '';
      rasData.hasNumeratorDenominator =
        createRasDto.hasNumeratorDenominator || false;
      rasData.numeratorLabel = createRasDto.numeratorLabel || '';
      rasData.denominatorLabel = createRasDto.denominatorLabel || '';
      rasData.monthlyValues = cleanedMonthlyValues;
      rasData.groupId = groupId;

      this.logger.log(`Saving RAS data: ${JSON.stringify(rasData)}`);

      const savedData = await this.rasRepository.save(rasData);
      this.logger.log(`RAS data created successfully with ID: ${savedData.id}`);
      return savedData;
    } catch (error) {
      this.logger.error(
        `Error creating RAS data: ${error.message}`,
        error.stack,
      );

      if (error.code === '23505') {
        throw new BadRequestException(
          `Parameter "${createRasDto.parameter}" sudah ada di tahun ${createRasDto.year}`,
        );
      }

      if (error.code === 'ER_NO_SUCH_TABLE') {
        throw new BadRequestException(
          'Tabel risk_appetite_statement belum ada. Jalankan migrasi database.',
        );
      }

      throw new BadRequestException(`Gagal membuat data: ${error.message}`);
    }
  }

  /**
   * Find all RAS data with filtering
   */
  async findAll(filterDto?: FilterRasDto): Promise<RasData[]> {
    try {
      this.logger.log(
        `Finding all RAS data with filter: ${JSON.stringify(filterDto)}`,
      );

      const query = this.rasRepository.createQueryBuilder('ras');

      if (filterDto?.year) {
        query.andWhere('ras.year = :year', { year: filterDto.year });
      }

      if (filterDto?.riskCategory) {
        query.andWhere('ras.riskCategory = :riskCategory', {
          riskCategory: filterDto.riskCategory,
        });
      }

      if (filterDto?.search) {
        query.andWhere(
          '(ras.parameter ILIKE :search OR ras.statement ILIKE :search)',
          { search: `%${filterDto.search}%` },
        );
      }

      if (filterDto?.hasTindakLanjut !== undefined) {
        if (filterDto.hasTindakLanjut) {
          query.andWhere('ras.tindakLanjut IS NOT NULL');
        } else {
          query.andWhere('ras.tindakLanjut IS NULL');
        }
      }

      if (filterDto?.month !== undefined) {
        const monthStr = filterDto.month.toString();
        query.andWhere(`ras.monthlyValues->>:month IS NOT NULL`, {
          month: monthStr,
        });
      }

      query.orderBy('ras.year', 'DESC');
      query.addOrderBy('ras.riskCategory', 'ASC');
      query.addOrderBy('ras.no', 'ASC');

      const results = await query.getMany();
      this.logger.log(`Found ${results.length} RAS data items`);
      return results;
    } catch (error) {
      this.logger.error(
        `Error finding all RAS data: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Find RAS data by year and month
   */
  async findByYearAndMonth(year: number, month?: number): Promise<RasData[]> {
    try {
      this.logger.log(`Finding RAS data for year ${year}, month ${month}`);

      const query = this.rasRepository
        .createQueryBuilder('ras')
        .where('ras.year = :year', { year });

      if (month !== undefined) {
        const monthStr = month.toString();
        query.andWhere(`ras.monthlyValues->>:month IS NOT NULL`, {
          month: monthStr,
        });
      }

      query.orderBy('ras.riskCategory', 'ASC');
      query.addOrderBy('ras.no', 'ASC');

      const results = await query.getMany();
      this.logger.log(`Found ${results.length} items for year ${year}`);
      return results;
    } catch (error) {
      this.logger.error(
        `Error finding by year and month: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Get unique risk categories
   */
  async getRiskCategories(): Promise<string[]> {
    try {
      this.logger.log('Getting risk categories');

      const categories = await this.rasRepository
        .createQueryBuilder('ras')
        .select('DISTINCT ras.riskCategory', 'riskCategory')
        .orderBy('ras.riskCategory', 'ASC')
        .getRawMany();

      const result = categories
        .map((c) => c.riskCategory)
        .filter((cat) => cat != null && cat.trim() !== '');

      this.logger.log(`Found ${result.length} categories`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error getting risk categories: ${error.message}`,
        error.stack,
      );
      return [
        'Operational Risk',
        'Financial Risk',
        'Strategic Risk',
        'Compliance Risk',
      ];
    }
  }

  /**
   * Find RAS data by ID
   */
  async findOne(id: number): Promise<RasData> {
    try {
      this.logger.log(`Finding RAS data by ID: ${id}`);

      const rasData = await this.rasRepository.findOne({
        where: { id },
      });

      if (!rasData) {
        throw new NotFoundException(`RAS data with ID ${id} not found`);
      }

      return rasData;
    } catch (error) {
      this.logger.error(
        `Error finding RAS data by ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update RAS data
   */
  async update(id: number, updateRasDto: UpdateRasDto): Promise<RasData> {
    try {
      this.logger.log(`Updating RAS data: ${id}`);

      const rasData = await this.findOne(id);

      // Check for duplicate parameter if parameter is being updated
      if (
        updateRasDto.parameter &&
        updateRasDto.parameter !== rasData.parameter
      ) {
        const existing = await this.rasRepository.findOne({
          where: {
            year: rasData.year,
            parameter: ILike(updateRasDto.parameter.trim()),
            id: Not(id),
          },
        });

        if (existing) {
          throw new BadRequestException(
            `Parameter "${updateRasDto.parameter}" sudah ada di tahun ${rasData.year}`,
          );
        }
      }

      // Update fields if provided - PERBAIKAN: assign string kosong
      if (updateRasDto.parameter !== undefined)
        rasData.parameter = updateRasDto.parameter.trim();
      if (updateRasDto.riskCategory !== undefined)
        rasData.riskCategory = updateRasDto.riskCategory;
      if (updateRasDto.statement !== undefined)
        rasData.statement = updateRasDto.statement || '';
      if (updateRasDto.formulasi !== undefined)
        rasData.formulasi = updateRasDto.formulasi || '';
      if (updateRasDto.dataTypeExplanation !== undefined)
        rasData.dataTypeExplanation = updateRasDto.dataTypeExplanation || '';
      if (updateRasDto.notes !== undefined)
        rasData.notes = updateRasDto.notes || '';
      if (updateRasDto.rkapTarget !== undefined)
        rasData.rkapTarget = updateRasDto.rkapTarget || '';
      if (updateRasDto.rasLimit !== undefined)
        rasData.rasLimit = updateRasDto.rasLimit || '';
      if (updateRasDto.hasNumeratorDenominator !== undefined)
        rasData.hasNumeratorDenominator = updateRasDto.hasNumeratorDenominator;
      if (updateRasDto.numeratorLabel !== undefined)
        rasData.numeratorLabel = updateRasDto.numeratorLabel || '';
      if (updateRasDto.denominatorLabel !== undefined)
        rasData.denominatorLabel = updateRasDto.denominatorLabel || '';
      if (updateRasDto.monthlyValues !== undefined)
        rasData.monthlyValues = updateRasDto.monthlyValues;
      if (updateRasDto.groupId !== undefined)
        rasData.groupId = updateRasDto.groupId;
      if (updateRasDto.riskStance !== undefined)
        rasData.riskStance = updateRasDto.riskStance;
      if (updateRasDto.unitType !== undefined)
        rasData.unitType = updateRasDto.unitType;
      if (updateRasDto.tindakLanjut !== undefined)
        rasData.tindakLanjut = updateRasDto.tindakLanjut;

      const savedData = await this.rasRepository.save(rasData);
      this.logger.log(`RAS data updated successfully: ${id}`);
      return savedData;
    } catch (error) {
      this.logger.error(
        `Error updating RAS data ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update monthly values for specific month
   */
  async updateMonthlyValues(
    id: number,
    updateMonthlyValuesDto: UpdateMonthlyValuesDto,
  ): Promise<RasData> {
    try {
      const { month, num, den, man } = updateMonthlyValuesDto;
      this.logger.log(`Updating monthly values for ID ${id}, month ${month}`);

      const rasData = await this.findOne(id);

      if (!rasData.monthlyValues) {
        rasData.monthlyValues = {};
      }

      rasData.monthlyValues[month] = {
        num:
          num !== undefined ? num : (rasData.monthlyValues[month]?.num ?? null),
        den:
          den !== undefined ? den : (rasData.monthlyValues[month]?.den ?? null),
        man:
          man !== undefined ? man : (rasData.monthlyValues[month]?.man ?? null),
      };

      const savedData = await this.rasRepository.save(rasData);
      this.logger.log(`Monthly values updated successfully for ID ${id}`);
      return savedData;
    } catch (error) {
      this.logger.error(
        `Error updating monthly values: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update tindak lanjut
   */
  async updateTindakLanjut(id: number, tindakLanjut: any): Promise<RasData> {
    try {
      this.logger.log(`Updating tindak lanjut for ID ${id}`);

      const rasData = await this.findOne(id);
      rasData.tindakLanjut = tindakLanjut;

      const savedData = await this.rasRepository.save(rasData);
      this.logger.log(`Tindak lanjut updated successfully for ID ${id}`);
      return savedData;
    } catch (error) {
      this.logger.error(
        `Error updating tindak lanjut: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete RAS data
   */
  async remove(id: number): Promise<void> {
    try {
      this.logger.log(`Deleting RAS data: ${id}`);

      const result = await this.rasRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`RAS data with ID ${id} not found`);
      }

      this.logger.log(`RAS data deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(
        `Error deleting RAS data ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get statistics for RAS yearly view
   */
  async getYearlyStats(year: number): Promise<any[]> {
    try {
      this.logger.log(`Getting yearly stats for year ${year}`);

      const currentYearData = await this.findByYearAndMonth(year);
      const result: any[] = [];

      for (const item of currentYearData) {
        const historicalYears = [year - 3, year - 2, year - 1];
        const stats = await this.calculateStats(item, historicalYears);

        const historicalItemYear2 = await this.getHistoricalItem(
          item,
          year - 2,
        );
        const historicalItemYear1 = await this.getHistoricalItem(
          item,
          year - 1,
        );

        result.push({
          ...item,
          stats,
          historicalData: {
            [year - 2]: historicalItemYear2 || null,
            [year - 1]: historicalItemYear1 || null,
          },
        });
      }

      this.logger.log(`Generated stats for ${result.length} items`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error getting yearly stats: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Import data from Excel/JSON
   */
  async importData(importRasDto: ImportRasDto): Promise<RasData[]> {
    try {
      this.logger.log(`Importing data for year ${importRasDto.year}`);

      const importedItems: RasData[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (const itemData of importRasDto.data) {
        try {
          const existing = await this.rasRepository.findOne({
            where: {
              year: importRasDto.year,
              parameter: ILike((itemData.parameter || '').trim()),
            },
          });

          if (existing && !importRasDto.overrideExisting) {
            this.logger.log(`Skipping existing item: ${itemData.parameter}`);
            continue;
          }

          const createDto: CreateRasDto = {
            year: importRasDto.year,
            riskCategory: itemData.riskCategory || 'Lainnya',
            parameter: itemData.parameter || '',
            statement: itemData.statement,
            formulasi: itemData.formulasi,
            riskStance: itemData.riskStance || 'Moderat',
            unitType: itemData.unitType || 'PERCENTAGE',
            dataTypeExplanation: itemData.dataTypeExplanation,
            notes: itemData.notes,
            rkapTarget: itemData.rkapTarget,
            rasLimit: itemData.rasLimit,
            hasNumeratorDenominator: itemData.hasNumeratorDenominator || false,
            numeratorLabel: itemData.numeratorLabel,
            denominatorLabel: itemData.denominatorLabel,
            monthlyValues: itemData.monthlyValues || {},
            groupId: itemData.groupId,
            tindakLanjut: itemData.tindakLanjut,
          };

          if (existing && importRasDto.overrideExisting) {
            const updated = await this.update(existing.id, createDto);
            importedItems.push(updated);
            successCount++;
          } else {
            const created = await this.create(createDto);
            importedItems.push(created);
            successCount++;
          }
        } catch (error) {
          this.logger.error(`Error importing item: ${error.message}`);
          errorCount++;
        }
      }

      this.logger.log(
        `Import completed: ${successCount} success, ${errorCount} errors`,
      );
      return importedItems;
    } catch (error) {
      this.logger.error(`Error in importData: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Export data for monthly view
   */
  async exportMonthlyData(year: number, months: number[]): Promise<any[]> {
    try {
      this.logger.log(
        `Exporting monthly data for year ${year}, months ${months}`,
      );

      const data = await this.findByYearAndMonth(year);

      const exportData = data.map((item) => {
        const exportItem: any = {
          id: item.id,
          year: item.year,
          riskCategory: item.riskCategory,
          no: item.no,
          parameter: item.parameter,
          statement: item.statement,
          rkapTarget: item.rkapTarget,
          dataTypeExplanation: item.dataTypeExplanation,
          rasLimit: item.rasLimit,
          riskStance: item.riskStance,
          unitType: item.unitType,
          hasNumeratorDenominator: item.hasNumeratorDenominator,
          numeratorLabel: item.numeratorLabel,
          denominatorLabel: item.denominatorLabel,
          notes: item.notes,
        };

        months.forEach((month) => {
          const monthData = item.monthlyValues?.[month];
          exportItem[`month_${month}_num`] = monthData?.num ?? '';
          exportItem[`month_${month}_den`] = monthData?.den ?? '';
          exportItem[`month_${month}_result`] = monthData?.man ?? '';
        });

        return exportItem;
      });

      this.logger.log(`Exported ${exportData.length} items`);
      return exportData;
    } catch (error) {
      this.logger.error(
        `Error exporting monthly data: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get items that need follow-up (actual < limit)
   */
  async getItemsNeedingFollowUp(
    year: number,
    month: number,
  ): Promise<RasData[]> {
    try {
      this.logger.log(`Getting follow-up items for ${year}-${month}`);

      const items = await this.findByYearAndMonth(year);

      const followUpItems = items.filter((item) => {
        const monthData = item.monthlyValues?.[month];
        if (!monthData) return false;

        const actual = this.calculateActualValue(monthData, item.unitType);
        const limit = this.parseNumber(item.rasLimit);

        return actual !== null && limit !== null && actual < limit;
      });

      this.logger.log(`Found ${followUpItems.length} items needing follow-up`);
      return followUpItems;
    } catch (error) {
      this.logger.error(
        `Error getting follow-up items: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Get historical item for a parameter
   */
  private async getHistoricalItem(
    item: RasData,
    targetYear: number,
  ): Promise<RasData | null> {
    try {
      if (item.groupId) {
        const found = await this.rasRepository.findOne({
          where: { year: targetYear, groupId: item.groupId },
        });
        if (found) return found;
      }

      return await this.rasRepository.findOne({
        where: {
          year: targetYear,
          riskCategory: item.riskCategory,
          parameter: ILike(item.parameter.trim()),
        },
      });
    } catch (error) {
      this.logger.error(`Error getting historical item: ${error.message}`);
      return null;
    }
  }

  /**
   * Calculate statistics for historical data
   */
  private async calculateStats(item: RasData, years: number[]): Promise<any> {
    try {
      const allValues: number[] = [];

      for (const year of years) {
        const histItem = await this.getHistoricalItem(item, year);

        if (histItem && histItem.monthlyValues) {
          Object.values(histItem.monthlyValues).forEach((monthData: any) => {
            const val = this.calculateActualValue(monthData, histItem.unitType);
            if (val !== null) {
              const normalized = this.normalizeUnitValue(
                val,
                histItem.unitType,
                item.unitType,
              );
              allValues.push(normalized);
            }
          });
        }
      }

      if (allValues.length === 0) return null;

      const n = allValues.length;
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      const sum = allValues.reduce((a, b) => a + b, 0);
      const avg = sum / n;

      let stdev = 0;
      if (n > 1) {
        const squareDiffs = allValues.map((v) => Math.pow(v - avg, 2));
        const sumSquareDiff = squareDiffs.reduce((a, b) => a + b, 0);
        stdev = Math.sqrt(sumSquareDiff / (n - 1));
      }

      return {
        n,
        avg,
        stdev,
        min,
        max,
        avg_min_1sd: avg - stdev,
        avg_plus_1sd: avg + stdev,
        avg_plus_2sd: avg + 2 * stdev,
        avg_plus_3sd: avg + 3 * stdev,
      };
    } catch (error) {
      this.logger.error(`Error calculating stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Calculate actual value from monthly data
   */
  private calculateActualValue(
    monthData: {
      num?: number | null;
      den?: number | null;
      man?: number | null;
    },
    unitType: string,
  ): number | null {
    try {
      if (monthData.man !== undefined && monthData.man !== null) {
        return this.parseNumber(monthData.man);
      }

      if (monthData.num !== undefined && monthData.den !== undefined) {
        const num = this.parseNumber(monthData.num);
        const den = this.parseNumber(monthData.den);
        if (num !== null && den !== null && den !== 0) return num / den;
      }

      return null;
    } catch (error) {
      this.logger.error(`Error calculating actual value: ${error.message}`);
      return null;
    }
  }

  /**
   * Normalize unit values for comparison
   */
  private normalizeUnitValue(
    value: number,
    fromUnit: string,
    toUnit: string,
  ): number {
    try {
      let normalized = value;
      if (fromUnit === 'X' && toUnit === 'PERCENTAGE') normalized = value * 100;
      else if (fromUnit === 'PERCENTAGE' && toUnit === 'X')
        normalized = value / 100;
      return normalized;
    } catch (error) {
      this.logger.error(`Error normalizing unit value: ${error.message}`);
      return value;
    }
  }

  /**
   * Parse number from various inputs
   */
  private parseNumber(input: any): number | null {
    try {
      if (input === null || input === undefined || input === '') return null;
      if (typeof input === 'number') return input;
      if (typeof input === 'string') {
        const cleanStr = input.replace(/[^0-9.-]/g, '').replace(',', '.');
        const val = parseFloat(cleanStr);
        return isNaN(val) ? null : val;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error parsing number: ${error.message}`);
      return null;
    }
  }

  /**
   * Test endpoint to check service health
   */
  async healthCheck(): Promise<{
    status: string;
    message: string;
    timestamp: string;
  }> {
    try {
      const count = await this.rasRepository.count();
      return {
        status: 'healthy',
        message: `RAS service is working. Database has ${count} records.`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        message: `RAS service error: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
