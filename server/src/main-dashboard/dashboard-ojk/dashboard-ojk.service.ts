import { Injectable } from '@nestjs/common';
import { PeringkatKompositService } from '../../ojk/peringkat-komposit/peringkat-komposit.service';

@Injectable()
export class DashboardOjkService {
  constructor(private readonly peringkatKompositService: PeringkatKompositService) {}

  async getDashboardData(year: number, quarter: string) {
    const quarterNum = parseInt(quarter.replace('Q', ''), 10);
    if (isNaN(quarterNum)) {
      return {
        kompositA: 0,
        kompositB: 0,
        total: 0,
        risks: [],
      };
    }
    return this.peringkatKompositService.getDashboardOjkData(year, quarterNum);
  }
}
