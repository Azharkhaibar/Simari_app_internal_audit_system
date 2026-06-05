import { Controller, Get, Query } from '@nestjs/common';
import { DashboardHoldingService } from './dashboard-holding.service';

@Controller('dashboard-holding')
export class DashboardHoldingController {
  constructor(private readonly dashboardHoldingService: DashboardHoldingService) {}

  @Get()
  async getDashboardData(
    @Query('year') year: string,
    @Query('quarter') quarter: string,
  ) {
    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || !quarter) {
      return {
        kompositA: 0,
        kompositB: 0,
        total: 0,
        riskData: [],
      };
    }
    return this.dashboardHoldingService.getDashboardData(yearNum, quarter);
  }
}
