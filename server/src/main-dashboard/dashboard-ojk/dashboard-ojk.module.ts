import { Module } from '@nestjs/common';
import { DashboardOjkService } from './dashboard-ojk.service';
import { DashboardOjkController } from './dashboard-ojk.controller';
import { PeringkatKompositOjkModule } from '../../ojk/peringkat-komposit/peringkat-komposit.module';

@Module({
  imports: [PeringkatKompositOjkModule],
  controllers: [DashboardOjkController],
  providers: [DashboardOjkService],
})
export class DashboardOjkModule {}
