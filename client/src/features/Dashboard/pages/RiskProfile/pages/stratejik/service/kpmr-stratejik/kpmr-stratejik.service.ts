// src/features/Dashboard/pages/RiskProfile/pages/Stratejik/services/kpmr-stratejik.service.ts

import api_stratejik from '../api.service';
// ============================================================================
// INTERFACES - Sesuai dengan Entity Backend (dengan Year) - HARD DELETE ONLY
// ============================================================================

// ---------- ASPEK (Master) ----------
export interface KPMRStratejikAspect {
  id: number;
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKPMRStratejikAspectData {
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
}

export interface UpdateKPMRStratejikAspectData {
  aspekNo?: string;
  aspekTitle?: string;
  aspekBobot?: number;
}

// ---------- QUESTION (Master Pertanyaan) ----------
export interface KPMRStratejikQuestion {
  id: number;
  year: number;
  aspekNo: string;
  sectionNo: string;
  sectionTitle: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKPMRStratejikQuestionData {
  year: number;
  aspekNo: string;
  sectionNo: string;
  sectionTitle: string;
}

export interface UpdateKPMRStratejikQuestionData {
  aspekNo?: string;
  sectionNo?: string;
  sectionTitle?: string;
}

// ---------- DEFINITION (Year-Level) ----------
export interface KPMRStratejikDefinition {
  id: number;
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
  sectionNo: string;
  sectionTitle: string;
  level1: string | null;
  level2: string | null;
  level3: string | null;
  level4: string | null;
  level5: string | null;
  evidence: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  scores?: KPMRStratejikScore[];
}

export interface CreateKPMRStratejikDefinitionData {
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
  sectionNo: string;
  sectionTitle: string;
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
  level5?: string;
  evidence?: string;
}

export interface UpdateKPMRStratejikDefinitionData {
  year?: number;
  aspekNo?: string;
  aspekTitle?: string;
  aspekBobot?: number;
  sectionNo?: string;
  sectionTitle?: string;
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
  level5?: string;
  evidence?: string;
}

// ---------- SCORE (Quarter-Level) ----------
export interface KPMRStratejikScore {
  id: number;
  definitionId: number;
  year: number;
  quarter: string;
  sectionSkor: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  definition?: KPMRStratejikDefinition;
}

export interface CreateKPMRStratejikScoreData {
  definitionId: number;
  year: number;
  quarter: string;
  sectionSkor?: number;
}

export interface UpdateKPMRStratejikScoreData {
  definitionId?: number;
  year?: number;
  quarter?: string;
  sectionSkor?: number;
}

// ---------- RESPONSE INTERFACES ----------
export interface KPMRStratejikFullDataResponse {
  success: boolean;
  year: number;
  aspects: Array<{
    aspekNo: string;
    aspekTitle: string;
    aspekBobot: number;
    sections: Array<{
      definitionId: number;
      sectionNo: string;
      sectionTitle: string;
      level1: string | null;
      level2: string | null;
      level3: string | null;
      level4: string | null;
      level5: string | null;
      evidence: string | null;
      scores: Record<
        string,
        {
          sectionSkor: number | null;
          id: number;
        }
      >;
    }>;
    quarterAverages: Record<string, number | null>;
  }>;
  overallAverages: Record<string, number | null>;
}

export interface Period {
  year: number;
  quarter: string;
}

export interface PeriodsResponse {
  success: boolean;
  data: Period[];
}

export interface YearsResponse {
  success: boolean;
  data: number[];
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// API SERVICE CLASS - HARD DELETE ONLY
// ============================================================================

class KPMRStratejikApiService {
  // ========== ASPECT API ==========
  async createAspect(data: CreateKPMRStratejikAspectData): Promise<KPMRStratejikAspect> {
    console.log('📤 POST to: /kpmr-stratejik/aspects', data);
    const response = await api_stratejik.post<KPMRStratejikAspect>('/kpmr-stratejik/aspects', data);
    return response.data;
  }

  async getAllAspects(year?: number): Promise<KPMRStratejikAspect[]> {
    let url = '/kpmr-stratejik/aspects';
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_stratejik.get<KPMRStratejikAspect[]>(url);
    return response.data;
  }

  async getAspectById(id: number): Promise<KPMRStratejikAspect> {
    console.log(`📥 GET from: /kpmr-stratejik/aspects/${id}`);
    const response = await api_stratejik.get<KPMRStratejikAspect>(`/kpmr-stratejik/aspects/${id}`);
    return response.data;
  }

  async updateAspect(id: number, data: UpdateKPMRStratejikAspectData): Promise<KPMRStratejikAspect> {
    console.log(`📤 PUT to: /kpmr-stratejik/aspects/${id}`, data);
    const response = await api_stratejik.put<KPMRStratejikAspect>(`/kpmr-stratejik/aspects/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteAspect(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-stratejik/aspects/${id}`);
    const response = await api_stratejik.delete<DeleteResponse>(`/kpmr-stratejik/aspects/${id}`);
    return response.data;
  }

  // ========== QUESTION API ==========
  async createQuestion(data: CreateKPMRStratejikQuestionData): Promise<KPMRStratejikQuestion> {
    console.log('📤 POST to: /kpmr-stratejik/questions', data);
    const response = await api_stratejik.post<KPMRStratejikQuestion>('/kpmr-stratejik/questions', data);
    return response.data;
  }

  async getAllQuestions(year?: number): Promise<KPMRStratejikQuestion[]> {
    let url = '/kpmr-stratejik/questions';
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_stratejik.get<KPMRStratejikQuestion[]>(url);
    return response.data;
  }

  async getQuestionsByAspect(aspekNo: string, year?: number): Promise<KPMRStratejikQuestion[]> {
    let url = `/kpmr-stratejik/questions/aspect/${aspekNo}`;
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_stratejik.get<KPMRStratejikQuestion[]>(url);
    return response.data;
  }

  async getQuestionById(id: number): Promise<KPMRStratejikQuestion> {
    console.log(`📥 GET from: /kpmr-stratejik/questions/${id}`);
    const response = await api_stratejik.get<KPMRStratejikQuestion>(`/kpmr-stratejik/questions/${id}`);
    return response.data;
  }

  async updateQuestion(id: number, data: UpdateKPMRStratejikQuestionData): Promise<KPMRStratejikQuestion> {
    console.log(`📤 PUT to: /kpmr-stratejik/questions/${id}`, data);
    const response = await api_stratejik.put<KPMRStratejikQuestion>(`/kpmr-stratejik/questions/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteQuestion(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-stratejik/questions/${id}`);
    const response = await api_stratejik.delete<DeleteResponse>(`/kpmr-stratejik/questions/${id}`);
    return response.data;
  }

  // ========== DEFINITION API ==========
  async createOrUpdateDefinition(data: CreateKPMRStratejikDefinitionData): Promise<KPMRStratejikDefinition> {
    console.log('📤 POST to: /kpmr-stratejik/definitions', data);
    const response = await api_stratejik.post<KPMRStratejikDefinition>('/kpmr-stratejik/definitions', data);
    return response.data;
  }

  async getAllDefinitions(): Promise<KPMRStratejikDefinition[]> {
    console.log('📥 GET from: /kpmr-stratejik/definitions');
    const response = await api_stratejik.get<KPMRStratejikDefinition[]>('/kpmr-stratejik/definitions');
    return response.data;
  }

  async getDefinitionsByYear(year: number): Promise<KPMRStratejikDefinition[]> {
    console.log(`📥 GET from: /kpmr-stratejik/definitions/year/${year}`);
    const response = await api_stratejik.get<KPMRStratejikDefinition[]>(`/kpmr-stratejik/definitions/year/${year}`);
    return response.data;
  }

  async getDefinitionById(id: number): Promise<KPMRStratejikDefinition> {
    console.log(`📥 GET from: /kpmr-stratejik/definitions/${id}`);
    const response = await api_stratejik.get<KPMRStratejikDefinition>(`/kpmr-stratejik/definitions/${id}`);
    return response.data;
  }

  async updateDefinition(id: number, data: UpdateKPMRStratejikDefinitionData): Promise<KPMRStratejikDefinition> {
    console.log(`📤 PUT to: /kpmr-stratejik/definitions/${id}`, data);
    const response = await api_stratejik.put<KPMRStratejikDefinition>(`/kpmr-stratejik/definitions/${id}`, data);
    return response.data;
  }

  // HARD DELETE definition with scores
  async deleteDefinitionPermanent(definitionId: number, year: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE to: /kpmr-stratejik/definition/${definitionId}/${year}`);
    const response = await api_stratejik.delete<DeleteResponse>(`/kpmr-stratejik/definition/${definitionId}/${year}`);
    return response.data;
  }

  // ========== SCORE API ==========
  async createOrUpdateScore(data: CreateKPMRStratejikScoreData): Promise<KPMRStratejikScore> {
    console.log('📤 POST to: /kpmr-stratejik/scores', data);
    const response = await api_stratejik.post<KPMRStratejikScore>('/kpmr-stratejik/scores', data);
    return response.data;
  }

  async getAllScores(): Promise<KPMRStratejikScore[]> {
    console.log('📥 GET from: /kpmr-stratejik/scores');
    const response = await api_stratejik.get<KPMRStratejikScore[]>('/kpmr-stratejik/scores');
    return response.data;
  }

  async getScoresByPeriod(year: number, quarter?: string): Promise<KPMRStratejikScore[]> {
    let url = `/kpmr-stratejik/scores/period?year=${year}`;
    if (quarter) url += `&quarter=${quarter}`;
    console.log('📥 GET from:', url);
    const response = await api_stratejik.get<KPMRStratejikScore[]>(url);
    return response.data;
  }

  async getScoresByDefinition(definitionId: number): Promise<KPMRStratejikScore[]> {
    console.log(`📥 GET from: /kpmr-stratejik/scores/definition/${definitionId}`);
    const response = await api_stratejik.get<KPMRStratejikScore[]>(`/kpmr-stratejik/scores/definition/${definitionId}`);
    return response.data;
  }

  async getScoreById(id: number): Promise<KPMRStratejikScore> {
    console.log(`📥 GET from: /kpmr-stratejik/scores/${id}`);
    const response = await api_stratejik.get<KPMRStratejikScore>(`/kpmr-stratejik/scores/${id}`);
    return response.data;
  }

  async updateScore(id: number, data: UpdateKPMRStratejikScoreData): Promise<KPMRStratejikScore> {
    console.log(`📤 PUT to: /kpmr-stratejik/scores/${id}`, data);
    const response = await api_stratejik.put<KPMRStratejikScore>(`/kpmr-stratejik/scores/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteScore(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-stratejik/scores/${id}`);
    const response = await api_stratejik.delete<DeleteResponse>(`/kpmr-stratejik/scores/${id}`);
    return response.data;
  }

  async deleteScoreByTarget(definitionId: number, year: number, quarter: string): Promise<DeleteResponse> {
    console.log('🗑️ POST to: /kpmr-stratejik/scores/target/delete', { definitionId, year, quarter });
    const response = await api_stratejik.post<DeleteResponse>('/kpmr-stratejik/scores/target/delete', { definitionId, year, quarter });
    return response.data;
  }

  // ========== COMPLEX QUERIES ==========
  async getFullData(year: number): Promise<KPMRStratejikFullDataResponse> {
    console.log(`📥 GET full data from: /kpmr-stratejik/full-data/${year}`);
    const response = await api_stratejik.get<KPMRStratejikFullDataResponse>(`/kpmr-stratejik/full-data/${year}`);
    return response.data;
  }

  async searchKPMR(year?: number, query?: string, aspekNo?: string): Promise<KPMRStratejikDefinition[]> {
    let url = '/kpmr-stratejik/search';
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (query) params.append('query', query);
    if (aspekNo) params.append('aspekNo', aspekNo);

    if (params.toString()) url += `?${params.toString()}`;
    console.log('📥 GET from:', url);
    const response = await api_stratejik.get<KPMRStratejikDefinition[]>(url);
    return response.data;
  }

  async getAvailableYears(): Promise<number[]> {
    console.log('📥 GET from: /kpmr-stratejik/years');
    const response = await api_stratejik.get<YearsResponse>('/kpmr-stratejik/years');
    return response.data.data;
  }

  async getPeriods(): Promise<Period[]> {
    console.log('📥 GET from: /kpmr-stratejik/periods');
    const response = await api_stratejik.get<PeriodsResponse>('/kpmr-stratejik/periods');
    return response.data.data;
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const kpmrStratejikApiService = new KPMRStratejikApiService();

// ============================================================================
// UTILITY FUNCTIONS untuk Transform Data
// ============================================================================

export const transformDefinitionToComponent = (definition: KPMRStratejikDefinition, scores: KPMRStratejikScore[] = []) => {
  const quarterScores = scores.reduce(
    (acc, score) => {
      acc[score.quarter] = {
        sectionSkor: score.sectionSkor,
        id: score.id,
      };
      return acc;
    },
    {} as Record<string, { sectionSkor: number | null; id: number }>,
  );

  return {
    definitionId: definition.id,
    year: definition.year,
    aspekNo: definition.aspekNo,
    aspekTitle: definition.aspekTitle,
    aspekBobot: definition.aspekBobot,
    sectionNo: definition.sectionNo,
    sectionTitle: definition.sectionTitle,
    level1: definition.level1,
    level2: definition.level2,
    level3: definition.level3,
    level4: definition.level4,
    level5: definition.level5,
    evidence: definition.evidence,
    scores: quarterScores,
  };
};

export const transformFullDataToGroups = (fullData: KPMRStratejikFullDataResponse) => {
  return fullData.aspects.map((aspect) => ({
    aspekNo: aspect.aspekNo,
    aspekTitle: aspect.aspekTitle,
    aspekBobot: aspect.aspekBobot,
    sections: aspect.sections.map((section) => ({
      sectionNo: section.sectionNo,
      sectionTitle: section.sectionTitle,
      definitionId: section.definitionId,
      level1: section.level1,
      level2: section.level2,
      level3: section.level3,
      level4: section.level4,
      level5: section.level5,
      evidence: section.evidence,
      quarters: Object.keys(section.scores).reduce(
        (acc, quarter) => {
          acc[quarter] = {
            sectionSkor: section.scores[quarter].sectionSkor,
            id: section.scores[quarter].id,
          };
          return acc;
        },
        {} as Record<string, { sectionSkor: number | null; id: number }>,
      ),
    })),
    quarterAverages: aspect.quarterAverages,
  }));
};
