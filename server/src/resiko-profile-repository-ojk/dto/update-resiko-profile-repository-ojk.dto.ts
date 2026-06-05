import { PartialType } from '@nestjs/swagger';
import { CreateResikoProfileRepositoryOjkDto } from './create-resiko-profile-repository-ojk.dto';

export class UpdateResikoProfileRepositoryOjkDto extends PartialType(CreateResikoProfileRepositoryOjkDto) {}
