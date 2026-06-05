import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResikoProfileRepositoryOjkService } from './resiko-profile-repository-ojk.service';
import { ResikoProfileRepositoryOjkController } from './resiko-profile-repository-ojk.controller';
import { RiskProfileRepositoryOjkView } from './entities/resiko-profile-repository-ojk.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RiskProfileRepositoryOjkView])],
  controllers: [ResikoProfileRepositoryOjkController],
  providers: [ResikoProfileRepositoryOjkService],
  exports: [ResikoProfileRepositoryOjkService],
})
export class ResikoProfileRepositoryOjkModule {}
