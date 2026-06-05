import { PartialType } from '@nestjs/swagger';
import { CreateDashboardHoldingDto } from './create-dashboard-holding.dto';

export class UpdateDashboardHoldingDto extends PartialType(CreateDashboardHoldingDto) {}
