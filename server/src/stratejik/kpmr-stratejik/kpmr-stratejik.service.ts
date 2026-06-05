// src/features/Dashboard/pages/RiskProfile/pages/Stratejik/controllers/kpmr-stratejik.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { KPMRStratejikDefinition } from './entities/kpmr-stratejik-definisi.entity';
import { KPMRStratejikScore } from './entities/kpmr-stratejik-skor.entity';
import { KPMRStratejikAspect } from './entities/kpmr-stratejik-aspek.entity';
import { KPMRStratejikQuestion } from './entities/kpmr-stratejik-pertanyaan.entity';
import {
  CreateKPMRStratejikAspectDto,
  UpdateKPMRStratejikAspectDto,
  CreateKPMRStratejikQuestionDto,
  UpdateKPMRStratejikQuestionDto,
  CreateKPMRStratejikDefinitionDto,
  UpdateKPMRStratejikDefinitionDto,
  CreateKPMRStratejikScoreDto,
  UpdateKPMRStratejikScoreDto,
} from './dto/kpmr-stratejik.dto';

@Injectable()
export class KPMRStratejikService {
  private readonly logger = new Logger(KPMRStratejikService.name);

  constructor(
    @InjectRepository(KPMRStratejikDefinition)
    private readonly definitionRepo: Repository<KPMRStratejikDefinition>,

    @InjectRepository(KPMRStratejikScore)
    private readonly scoreRepo: Repository<KPMRStratejikScore>,

    @InjectRepository(KPMRStratejikAspect)
    private readonly aspectRepo: Repository<KPMRStratejikAspect>,

    @InjectRepository(KPMRStratejikQuestion)
    private readonly questionRepo: Repository<KPMRStratejikQuestion>,
  ) {}

  private validateQuarter(quarter: string): void {
    const validQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    if (!validQuarters.includes(quarter)) {
      throw new BadRequestException(
        `Quarter harus salah satu dari: ${validQuarters.join(', ')}`,
      );
    }
  }

  async validateDefinitionExists(
    definitionId: number,
  ): Promise<KPMRStratejikDefinition> {
    const definition = await this.definitionRepo.findOne({
      where: { id: definitionId },
    });
    if (!definition) {
      throw new NotFoundException(
        `Definition dengan ID ${definitionId} tidak ditemukan`,
      );
    }
    return definition;
  }

  async createAspect(
    createDto: CreateKPMRStratejikAspectDto,
  ): Promise<KPMRStratejikAspect> {
    this.logger.log(
      `Creating aspect for year ${createDto.year}: ${JSON.stringify(createDto)}`,
    );

    const existing = await this.aspectRepo.findOne({
      where: { year: createDto.year, aspekNo: createDto.aspekNo },
    });

    if (existing) {
      existing.aspekTitle = createDto.aspekTitle;
      existing.aspekBobot = createDto.aspekBobot;
      return await this.aspectRepo.save(existing);
    }

    const aspect = this.aspectRepo.create(createDto);
    return await this.aspectRepo.save(aspect);
  }

  async findAllAspects(year?: number): Promise<KPMRStratejikAspect[]> {
    const where: any = {};
    if (year) where.year = year;
    return await this.aspectRepo.find({
      where,
      order: { year: 'DESC', aspekNo: 'ASC' },
    });
  }

  async findAspectById(id: number): Promise<KPMRStratejikAspect> {
    const aspect = await this.aspectRepo.findOne({ where: { id } });
    if (!aspect)
      throw new NotFoundException(`Aspek dengan ID ${id} tidak ditemukan`);
    return aspect;
  }

  async updateAspect(
    id: number,
    updateDto: UpdateKPMRStratejikAspectDto,
  ): Promise<KPMRStratejikAspect> {
    const aspect = await this.findAspectById(id);
    Object.assign(aspect, updateDto);
    return await this.aspectRepo.save(aspect);
  }

  async deleteAspect(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    const aspect = await this.aspectRepo.findOne({ where: { id } });
    if (!aspect)
      throw new NotFoundException(`Aspek dengan ID ${id} tidak ditemukan`);
    this.logger.log(
      `🗑️ Deleting aspect ID ${id} (${aspect.aspekNo} - ${aspect.year})`,
    );
    await this.aspectRepo.delete(id);
    return {
      success: true,
      message: `Aspek "${aspect.aspekTitle}" untuk tahun ${aspect.year} berhasil dihapus permanen.`,
    };
  }

  async createQuestion(
    createDto: CreateKPMRStratejikQuestionDto,
  ): Promise<KPMRStratejikQuestion> {
    this.logger.log(
      `Creating question for year ${createDto.year}: ${JSON.stringify(createDto)}`,
    );

    if (!createDto.aspekNo || !createDto.sectionNo || !createDto.sectionTitle) {
      throw new BadRequestException(
        'aspekNo, sectionNo, dan sectionTitle harus diisi',
      );
    }

    const aspect = await this.aspectRepo.findOne({
      where: { year: createDto.year, aspekNo: createDto.aspekNo },
    });

    if (!aspect) {
      throw new NotFoundException(
        `Aspek dengan nomor "${createDto.aspekNo}" untuk tahun ${createDto.year} tidak ditemukan.`,
      );
    }

    try {
      const question = this.questionRepo.create(createDto);
      const savedQuestion = await this.questionRepo.save(question);
      this.logger.log(
        `✅ Question created successfully: ID ${savedQuestion.id}`,
      );
      return savedQuestion;
    } catch (error) {
      this.logger.error(`❌ Failed to create question: ${error.message}`);
      throw new BadRequestException(
        `Gagal membuat pertanyaan: ${error.message}`,
      );
    }
  }

  async findAllQuestions(year?: number): Promise<KPMRStratejikQuestion[]> {
    const where: any = {};
    if (year) where.year = year;
    return await this.questionRepo.find({
      where,
      order: { year: 'DESC', aspekNo: 'ASC', sectionNo: 'ASC' },
    });
  }

  async findQuestionsByAspect(
    aspekNo: string,
    year?: number,
  ): Promise<KPMRStratejikQuestion[]> {
    const where: any = { aspekNo };
    if (year) where.year = year;
    return await this.questionRepo.find({
      where,
      order: { year: 'DESC', sectionNo: 'ASC' },
    });
  }

  async findQuestionById(id: number): Promise<KPMRStratejikQuestion> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question)
      throw new NotFoundException(`Pertanyaan dengan ID ${id} tidak ditemukan`);
    return question;
  }

  async updateQuestion(
    id: number,
    updateDto: UpdateKPMRStratejikQuestionDto,
  ): Promise<KPMRStratejikQuestion> {
    const question = await this.findQuestionById(id);
    Object.assign(question, updateDto);
    return await this.questionRepo.save(question);
  }

  async deleteQuestion(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    const question = await this.findQuestionById(id);
    this.logger.log(
      `🗑️ Deleting question ID ${id} (${question.sectionNo} - ${question.sectionTitle})`,
    );
    const definitions = await this.definitionRepo.find({
      where: {
        year: question.year,
        aspekNo: question.aspekNo,
        sectionNo: question.sectionNo,
      },
    });
    const definitionsCount = definitions.length;
    await this.questionRepo.delete(id);
    return {
      success: true,
      message: `Pertanyaan "${question.sectionTitle}" berhasil dihapus permanen beserta ${definitionsCount} data terkait.`,
    };
  }

  async createOrUpdateDefinition(
    createDto: CreateKPMRStratejikDefinitionDto,
    createdBy?: string,
  ): Promise<KPMRStratejikDefinition> {
    this.logger.log(
      `Creating/updating definition: ${JSON.stringify(createDto)}`,
    );

    const aspect = await this.aspectRepo.findOne({
      where: { year: createDto.year, aspekNo: createDto.aspekNo },
    });
    if (!aspect)
      throw new NotFoundException(
        `Aspek dengan nomor "${createDto.aspekNo}" untuk tahun ${createDto.year} tidak ditemukan`,
      );

    const question = await this.questionRepo.findOne({
      where: {
        year: createDto.year,
        aspekNo: createDto.aspekNo,
        sectionNo: createDto.sectionNo,
      },
    });
    if (!question)
      throw new NotFoundException(
        `Pertanyaan dengan aspek ${createDto.aspekNo} dan section ${createDto.sectionNo} tidak ditemukan`,
      );

    const existing = await this.definitionRepo.findOne({
      where: {
        year: createDto.year,
        aspekNo: createDto.aspekNo,
        sectionNo: createDto.sectionNo,
      },
    });

    if (existing) {
      existing.aspekTitle = createDto.aspekTitle;
      existing.aspekBobot = createDto.aspekBobot;
      existing.sectionTitle = createDto.sectionTitle;
      existing.level1 = createDto.level1 ?? existing.level1;
      existing.level2 = createDto.level2 ?? existing.level2;
      existing.level3 = createDto.level3 ?? existing.level3;
      existing.level4 = createDto.level4 ?? existing.level4;
      existing.level5 = createDto.level5 ?? existing.level5;
      existing.evidence = createDto.evidence ?? existing.evidence;
      if (createdBy) existing.updatedBy = createdBy;
      return await this.definitionRepo.save(existing);
    } else {
      const definition = this.definitionRepo.create({
        ...createDto,
        createdBy,
      });
      return await this.definitionRepo.save(definition);
    }
  }

  async findAllDefinitions(): Promise<KPMRStratejikDefinition[]> {
    return await this.definitionRepo.find({
      relations: ['question', 'scores'],
      order: { year: 'DESC', aspekNo: 'ASC', sectionNo: 'ASC' },
    });
  }

  async findDefinitionsByYear(
    year: number,
  ): Promise<KPMRStratejikDefinition[]> {
    return await this.definitionRepo.find({
      where: { year },
      relations: ['question', 'scores'],
      order: { aspekNo: 'ASC', sectionNo: 'ASC' },
    });
  }

  async findDefinitionById(id: number): Promise<KPMRStratejikDefinition> {
    const definition = await this.definitionRepo.findOne({
      where: { id },
      relations: ['question', 'scores'],
    });
    if (!definition)
      throw new NotFoundException(`Definition dengan ID ${id} tidak ditemukan`);
    return definition;
  }

  async updateDefinition(
    id: number,
    updateDto: UpdateKPMRStratejikDefinitionDto,
    updatedBy?: string,
  ): Promise<KPMRStratejikDefinition> {
    const definition = await this.findDefinitionById(id);
    if (updateDto.aspekNo || updateDto.sectionNo) {
      const checkAspekNo = updateDto.aspekNo || definition.aspekNo;
      const checkSectionNo = updateDto.sectionNo || definition.sectionNo;
      const existing = await this.definitionRepo.findOne({
        where: {
          year: definition.year,
          aspekNo: checkAspekNo,
          sectionNo: checkSectionNo,
          id: Not(id),
        },
      });
      if (existing)
        throw new ConflictException(
          `Definition dengan aspek ${checkAspekNo} dan section ${checkSectionNo} sudah ada`,
        );
    }
    Object.assign(definition, updateDto);
    if (updatedBy) definition.updatedBy = updatedBy;
    return await this.definitionRepo.save(definition);
  }

  async deleteDefinition(
    definitionId: number,
    year: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const definition = await this.definitionRepo.findOne({
        where: { id: definitionId, year },
      });
      if (!definition)
        return { success: true, message: 'Data sudah tidak ada' };
      await this.definitionRepo.delete(definition.id);
      return { success: true, message: 'Data berhasil dihapus' };
    } catch (error) {
      return { success: false, message: `Gagal menghapus: ${error.message}` };
    }
  }

  async createOrUpdateScore(
    createDto: CreateKPMRStratejikScoreDto,
    createdBy?: string,
  ): Promise<KPMRStratejikScore> {
    await this.validateDefinitionExists(createDto.definitionId);
    this.validateQuarter(createDto.quarter);

    const existing = await this.scoreRepo.findOne({
      where: {
        definitionId: createDto.definitionId,
        year: createDto.year,
        quarter: createDto.quarter,
      },
    });

    if (existing) {
      existing.sectionSkor = createDto.sectionSkor ?? null;
      if (createdBy) existing.updatedBy = createdBy;
      return await this.scoreRepo.save(existing);
    } else {
      const score = this.scoreRepo.create({ ...createDto, createdBy });
      return await this.scoreRepo.save(score);
    }
  }

  async findAllScores(): Promise<KPMRStratejikScore[]> {
    return await this.scoreRepo.find({
      relations: ['definition'],
      order: { year: 'DESC', quarter: 'ASC' },
    });
  }

  async findScoresByPeriod(
    year: number,
    quarter?: string,
  ): Promise<KPMRStratejikScore[]> {
    const where: any = { year };
    if (quarter) {
      this.validateQuarter(quarter);
      where.quarter = quarter;
    }
    return await this.scoreRepo.find({
      where,
      relations: ['definition'],
      order: { quarter: 'ASC' },
    });
  }

  async findScoresByDefinition(
    definitionId: number,
  ): Promise<KPMRStratejikScore[]> {
    await this.validateDefinitionExists(definitionId);
    return await this.scoreRepo.find({
      where: { definitionId },
      relations: ['definition'],
      order: { quarter: 'ASC' },
    });
  }

  async findScoreById(id: number): Promise<KPMRStratejikScore> {
    const score = await this.scoreRepo.findOne({
      where: { id },
      relations: ['definition'],
    });
    if (!score)
      throw new NotFoundException(`Score dengan ID ${id} tidak ditemukan`);
    return score;
  }

  async updateScore(
    id: number,
    updateDto: UpdateKPMRStratejikScoreDto,
    updatedBy?: string,
  ): Promise<KPMRStratejikScore> {
    const score = await this.findScoreById(id);
    if (updateDto.definitionId)
      await this.validateDefinitionExists(updateDto.definitionId);
    if (updateDto.quarter) this.validateQuarter(updateDto.quarter);
    Object.assign(score, updateDto);
    if (updatedBy) score.updatedBy = updatedBy;
    return await this.scoreRepo.save(score);
  }

  async deleteScore(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    const score = await this.findScoreById(id);
    await this.scoreRepo.delete(id);
    return { success: true, message: 'Score berhasil dihapus permanen' };
  }

  async deleteScoreByTarget(
    definitionId: number,
    year: number,
    quarter: string,
  ): Promise<{ success: boolean; message: string }> {
    this.validateQuarter(quarter);
    const score = await this.scoreRepo.findOne({
      where: { definitionId, year, quarter },
    });
    if (!score) return { success: true, message: 'Data sudah tidak ada' };
    await this.scoreRepo.delete(score.id);
    return { success: true, message: 'Score berhasil dihapus permanen' };
  }

  async getKPMRFullData(year: number): Promise<any> {
    this.logger.log(`Getting full KPMR Stratejik data for year: ${year}`);
    const definitions = await this.definitionRepo.find({
      where: { year },
      relations: ['scores'],
      order: { aspekNo: 'ASC', sectionNo: 'ASC' },
    });

    const aspekMap = new Map();
    for (const def of definitions) {
      const aspekKey = def.aspekNo;
      if (!aspekMap.has(aspekKey)) {
        aspekMap.set(aspekKey, {
          aspekNo: def.aspekNo,
          aspekTitle: def.aspekTitle,
          aspekBobot: def.aspekBobot,
          sections: [],
        });
      }
      const sectionScores = (def.scores || []).reduce(
        (acc, score) => {
          acc[score.quarter] = { sectionSkor: score.sectionSkor, id: score.id };
          return acc;
        },
        {} as Record<string, any>,
      );
      aspekMap.get(aspekKey).sections.push({
        definitionId: def.id,
        sectionNo: def.sectionNo,
        sectionTitle: def.sectionTitle,
        level1: def.level1,
        level2: def.level2,
        level3: def.level3,
        level4: def.level4,
        level5: def.level5,
        evidence: def.evidence,
        scores: sectionScores,
      });
    }

    const result = Array.from(aspekMap.values());
    for (const aspek of result) {
      const quarterAverages: Record<string, number | null> = {};
      ['Q1', 'Q2', 'Q3', 'Q4'].forEach((quarter) => {
        const allScores = aspek.sections
          .map((s: any) => s.scores[quarter]?.sectionSkor)
          .filter((s: number) => s != null && !isNaN(s));
        quarterAverages[quarter] = allScores.length
          ? Number(
              (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(
                2,
              ),
            )
          : null;
      });
      aspek.quarterAverages = quarterAverages;
    }

    const overallAverages: Record<string, number | null> = {};
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach((quarter) => {
      const allAspectAverages = result
        .map((aspek) => aspek.quarterAverages[quarter])
        .filter((avg) => avg != null && !isNaN(avg));
      overallAverages[quarter] = allAspectAverages.length
        ? Number(
            (
              allAspectAverages.reduce((a, b) => a + b, 0) /
              allAspectAverages.length
            ).toFixed(2),
          )
        : null;
    });

    return { success: true, year, aspects: result, overallAverages };
  }

  async searchKPMR(
    year?: number,
    query?: string,
    aspekNo?: string,
  ): Promise<KPMRStratejikDefinition[]> {
    const qb = this.definitionRepo
      .createQueryBuilder('def')
      .leftJoinAndSelect('def.scores', 'scores')
      .leftJoinAndSelect('def.question', 'question');
    if (year) qb.andWhere('def.year = :year', { year });
    if (aspekNo) qb.andWhere('def.aspekNo = :aspekNo', { aspekNo });
    if (query)
      qb.andWhere(
        `(def.aspekNo LIKE :query OR def.aspekTitle LIKE :query OR def.sectionNo LIKE :query OR def.sectionTitle LIKE :query OR def.evidence LIKE :query OR def.level1 LIKE :query OR def.level2 LIKE :query OR def.level3 LIKE :query OR def.level4 LIKE :query OR def.level5 LIKE :query)`,
        { query: `%${query}%` },
      );
    return await qb
      .orderBy('def.aspekNo', 'ASC')
      .addOrderBy('def.sectionNo', 'ASC')
      .getMany();
  }

  async getAvailableYears(): Promise<number[]> {
    try {
      const definitionYears = await this.definitionRepo
        .createQueryBuilder('def')
        .select('DISTINCT def.year', 'year')
        .orderBy('def.year', 'DESC')
        .getRawMany();
      const scoreYears = await this.scoreRepo
        .createQueryBuilder('score')
        .select('DISTINCT score.year', 'year')
        .orderBy('score.year', 'DESC')
        .getRawMany();
      const allYears = [
        ...new Set([
          ...definitionYears.map((y) => Number(y.year)),
          ...scoreYears.map((y) => Number(y.year)),
        ]),
      ];
      return allYears.length > 0 ? allYears : [new Date().getFullYear()];
    } catch (error) {
      return [new Date().getFullYear()];
    }
  }

  async getPeriods(): Promise<Array<{ year: number; quarter: string }>> {
    try {
      const periods = await this.scoreRepo
        .createQueryBuilder('score')
        .select('DISTINCT score.year', 'year')
        .addSelect('score.quarter', 'quarter')
        .orderBy('score.year', 'DESC')
        .addOrderBy('score.quarter', 'DESC')
        .getRawMany();
      return periods.map((p) => ({ year: Number(p.year), quarter: p.quarter }));
    } catch (error) {
      return [];
    }
  }
}
