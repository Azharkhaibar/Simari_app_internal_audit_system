import { PartialType } from '@nestjs/swagger';
import { CreateDashboardOjkDto } from './create-dashboard-ojk.dto';

export class UpdateDashboardOjkDto extends PartialType(CreateDashboardOjkDto) {}
