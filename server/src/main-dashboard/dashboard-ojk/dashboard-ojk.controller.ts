import { Controller, Get, Query } from '@nestjs/common';
import { DashboardOjkService } from './dashboard-ojk.service';

@Controller('dashboard-ojk')
export class DashboardOjkController {
  constructor(private readonly dashboardOjkService: DashboardOjkService) {}

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
        risks: [],
      };
    }
    return this.dashboardOjkService.getDashboardData(yearNum, quarter);
  }
}
