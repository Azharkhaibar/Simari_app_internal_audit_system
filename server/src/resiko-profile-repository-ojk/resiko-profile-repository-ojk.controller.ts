import {
  Controller,
  Get,
  Query,
  BadRequestException,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ResikoProfileRepositoryOjkService, RepositoryFilters, PaginationOptions } from './resiko-profile-repository-ojk.service';
// ✅ Perbaiki import path entity
import { ModuleTypeOjk, Quarter } from './entities/resiko-profile-repository-ojk.entity';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Risk Profile Repository OJK')
@Controller('risk-profile-repository-ojk')
@UseInterceptors(ClassSerializerInterceptor)
export class ResikoProfileRepositoryOjkController {
  constructor(
    private readonly service: ResikoProfileRepositoryOjkService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all OJK repository data with filtering' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'quarter', required: false, enum: Quarter })
  @ApiQuery({
    name: 'moduleTypes',
    required: false,
    isArray: true,
    enum: ModuleTypeOjk,
  })
  @ApiQuery({ name: 'searchQuery', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 100 })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'Repository data retrieved successfully' })
  async getRepositoryData(
    @Query('year') year?: string,
    @Query('quarter') quarter?: Quarter,
    @Query('moduleTypes') moduleTypes?: string | string[],
    @Query('searchQuery') searchQuery?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '100',
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    // ✅ Parse moduleTypes (bisa string atau array dari query string)
    let parsedModuleTypes: ModuleTypeOjk[] | undefined;
    if (moduleTypes) {
      if (typeof moduleTypes === 'string') {
        parsedModuleTypes = moduleTypes.includes(',')
          ? (moduleTypes.split(',') as ModuleTypeOjk[])
          : [moduleTypes as ModuleTypeOjk];
      } else if (Array.isArray(moduleTypes)) {
        parsedModuleTypes = moduleTypes as ModuleTypeOjk[];
      }
    }

    const filters: RepositoryFilters = {
      year: year ? Number(year) : undefined,
      quarter,
      moduleTypes: parsedModuleTypes,
      searchQuery,
    };

    const pagination: PaginationOptions = {
      page: Number(page) || 1,
      limit: Number(limit) || 100,
      sortBy,
      sortOrder,
    };

    return this.service.getRepositoryData(filters, pagination);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get OJK repository statistics for a period' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'quarter', required: true, enum: Quarter })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getRepositoryStatistics(
    @Query('year') year: string,
    @Query('quarter') quarter: Quarter,
  ) {
    const yearNum = Number(year);
    if (!yearNum) {
      throw new BadRequestException('Year is required');
    }
    if (!quarter || !Object.values(Quarter).includes(quarter)) {
      throw new BadRequestException('Valid quarter is required');
    }
    return this.service.getRepositoryStatistics(yearNum, quarter);
  }

  @Get('modules')
  @ApiOperation({ summary: 'Get list of available OJK modules' })
  @ApiResponse({ status: 200, description: 'Module list retrieved successfully' })
  getAvailableModules() {
    return {
      modules: Object.values(ModuleTypeOjk).map((module) => ({
        code: module,
        name: this.getModuleName(module),
        color: this.getModuleColor(module),
      })),
    };
  }

  @Get('periods')
  @ApiOperation({ summary: 'Get available periods in OJK repository' })
  @ApiResponse({ status: 200, description: 'Periods retrieved successfully' })
  async getAvailablePeriods() {
    return this.service.getAvailablePeriods();
  }

  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================

  private getModuleName(module: ModuleTypeOjk): string {
    const moduleNames: Record<ModuleTypeOjk, string> = {
      [ModuleTypeOjk.PASAR]: 'Pasar',
      [ModuleTypeOjk.LIKUIDITAS]: 'Likuiditas',
      [ModuleTypeOjk.OPERASIONAL]: 'Operasional',
      [ModuleTypeOjk.HUKUM]: 'Hukum',
      [ModuleTypeOjk.STRATEGIK]: 'Strategik',
      [ModuleTypeOjk.KEPATUHAN]: 'Kepatuhan',
      [ModuleTypeOjk.REPUTASI]: 'Reputasi',
      [ModuleTypeOjk.KONSENTRASI]: 'Konsentrasi',
      [ModuleTypeOjk.KREDIT]: 'Kredit',
      [ModuleTypeOjk.PERMODALAN]: 'Permodalan',
      [ModuleTypeOjk.RENTABILITAS]: 'Rentabilitas',
      [ModuleTypeOjk.TATAKELOLA]: 'Tatakelola',
      [ModuleTypeOjk.INVESTASI]: 'Investasi',
    };
    return moduleNames[module] || module;
  }

  private getModuleColor(module: ModuleTypeOjk): string {
    const moduleColors: Record<ModuleTypeOjk, string> = {
      [ModuleTypeOjk.PASAR]: '#795548',
      [ModuleTypeOjk.LIKUIDITAS]: '#FF6B6B',
      [ModuleTypeOjk.OPERASIONAL]: '#FFA726',
      [ModuleTypeOjk.HUKUM]: '#607D8B',
      [ModuleTypeOjk.STRATEGIK]: '#9C27B0',
      [ModuleTypeOjk.KEPATUHAN]: '#0068B3',
      [ModuleTypeOjk.REPUTASI]: '#00A3DA',
      [ModuleTypeOjk.KONSENTRASI]: '#E91E63',
      [ModuleTypeOjk.KREDIT]: '#3F51B5',
      [ModuleTypeOjk.PERMODALAN]: '#FF5722',
      [ModuleTypeOjk.RENTABILITAS]: '#CDDC39',
      [ModuleTypeOjk.TATAKELOLA]: '#009688',
      [ModuleTypeOjk.INVESTASI]: '#33C2B5',
    };
    return moduleColors[module] || '#6B7280';
  }
}