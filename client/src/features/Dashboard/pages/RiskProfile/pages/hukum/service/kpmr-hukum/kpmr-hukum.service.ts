// src/features/Dashboard/pages/RiskProfile/pages/Hukum/services/kpmr-hukum.service.ts

import api_hukum from '../api.service';
// ============================================================================
// INTERFACES - Sesuai dengan Entity Backend (dengan Year) - HARD DELETE ONLY
// ============================================================================

// ---------- ASPEK (Master) ----------
export interface KPMRHukumAspect {
  id: number;
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKPMRHukumAspectData {
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
}

export interface UpdateKPMRHukumAspectData {
  aspekNo?: string;
  aspekTitle?: string;
  aspekBobot?: number;
}

// ---------- QUESTION (Master Pertanyaan) ----------
export interface KPMRHukumQuestion {
  id: number;
  year: number;
  aspekNo: string;
  sectionNo: string;
  sectionTitle: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKPMRHukumQuestionData {
  year: number;
  aspekNo: string;
  sectionNo: string;
  sectionTitle: string;
}

export interface UpdateKPMRHukumQuestionData {
  aspekNo?: string;
  sectionNo?: string;
  sectionTitle?: string;
}

// ---------- DEFINITION (Year-Level) ----------
export interface KPMRHukumDefinition {
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
  scores?: KPMRHukumScore[];
}

export interface CreateKPMRHukumDefinitionData {
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

export interface UpdateKPMRHukumDefinitionData {
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
export interface KPMRHukumScore {
  id: number;
  definitionId: number;
  year: number;
  quarter: string;
  sectionSkor: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  definition?: KPMRHukumDefinition;
}

export interface CreateKPMRHukumScoreData {
  definitionId: number;
  year: number;
  quarter: string;
  sectionSkor?: number;
}

export interface UpdateKPMRHukumScoreData {
  definitionId?: number;
  year?: number;
  quarter?: string;
  sectionSkor?: number;
}

// ---------- RESPONSE INTERFACES ----------
export interface KPMRHukumFullDataResponse {
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

class KPMRHukumApiService {
  // ========== ASPECT API ==========
  async createAspect(data: CreateKPMRHukumAspectData): Promise<KPMRHukumAspect> {
    console.log('📤 POST to: /kpmr-hukum/aspects', data);
    const response = await api_hukum.post<KPMRHukumAspect>('/kpmr-hukum/aspects', data);
    return response.data;
  }

  async getAllAspects(year?: number): Promise<KPMRHukumAspect[]> {
    let url = '/kpmr-hukum/aspects';
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_hukum.get<KPMRHukumAspect[]>(url);
    return response.data;
  }

  async getAspectById(id: number): Promise<KPMRHukumAspect> {
    console.log(`📥 GET from: /kpmr-hukum/aspects/${id}`);
    const response = await api_hukum.get<KPMRHukumAspect>(`/kpmr-hukum/aspects/${id}`);
    return response.data;
  }

  async updateAspect(id: number, data: UpdateKPMRHukumAspectData): Promise<KPMRHukumAspect> {
    console.log(`📤 PUT to: /kpmr-hukum/aspects/${id}`, data);
    const response = await api_hukum.put<KPMRHukumAspect>(`/kpmr-hukum/aspects/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteAspect(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-hukum/aspects/${id}`);
    const response = await api_hukum.delete<DeleteResponse>(`/kpmr-hukum/aspects/${id}`);
    return response.data;
  }

  // ========== QUESTION API ==========
  async createQuestion(data: CreateKPMRHukumQuestionData): Promise<KPMRHukumQuestion> {
    console.log('📤 POST to: /kpmr-hukum/questions', data);
    const response = await api_hukum.post<KPMRHukumQuestion>('/kpmr-hukum/questions', data);
    return response.data;
  }

  async getAllQuestions(year?: number): Promise<KPMRHukumQuestion[]> {
    let url = '/kpmr-hukum/questions';
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_hukum.get<KPMRHukumQuestion[]>(url);
    return response.data;
  }

  async getQuestionsByAspect(aspekNo: string, year?: number): Promise<KPMRHukumQuestion[]> {
    let url = `/kpmr-hukum/questions/aspect/${aspekNo}`;
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_hukum.get<KPMRHukumQuestion[]>(url);
    return response.data;
  }

  async getQuestionById(id: number): Promise<KPMRHukumQuestion> {
    console.log(`📥 GET from: /kpmr-hukum/questions/${id}`);
    const response = await api_hukum.get<KPMRHukumQuestion>(`/kpmr-hukum/questions/${id}`);
    return response.data;
  }

  async updateQuestion(id: number, data: UpdateKPMRHukumQuestionData): Promise<KPMRHukumQuestion> {
    console.log(`📤 PUT to: /kpmr-hukum/questions/${id}`, data);
    const response = await api_hukum.put<KPMRHukumQuestion>(`/kpmr-hukum/questions/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteQuestion(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-hukum/questions/${id}`);
    const response = await api_hukum.delete<DeleteResponse>(`/kpmr-hukum/questions/${id}`);
    return response.data;
  }

  // ========== DEFINITION API ==========
  async createOrUpdateDefinition(data: CreateKPMRHukumDefinitionData): Promise<KPMRHukumDefinition> {
    console.log('📤 POST to: /kpmr-hukum/definitions', data);
    const response = await api_hukum.post<KPMRHukumDefinition>('/kpmr-hukum/definitions', data);
    return response.data;
  }

  async getAllDefinitions(): Promise<KPMRHukumDefinition[]> {
    console.log('📥 GET from: /kpmr-hukum/definitions');
    const response = await api_hukum.get<KPMRHukumDefinition[]>('/kpmr-hukum/definitions');
    return response.data;
  }

  async getDefinitionsByYear(year: number): Promise<KPMRHukumDefinition[]> {
    console.log(`📥 GET from: /kpmr-hukum/definitions/year/${year}`);
    const response = await api_hukum.get<KPMRHukumDefinition[]>(`/kpmr-hukum/definitions/year/${year}`);
    return response.data;
  }

  async getDefinitionById(id: number): Promise<KPMRHukumDefinition> {
    console.log(`📥 GET from: /kpmr-hukum/definitions/${id}`);
    const response = await api_hukum.get<KPMRHukumDefinition>(`/kpmr-hukum/definitions/${id}`);
    return response.data;
  }

  async updateDefinition(id: number, data: UpdateKPMRHukumDefinitionData): Promise<KPMRHukumDefinition> {
    console.log(`📤 PUT to: /kpmr-hukum/definitions/${id}`, data);
    const response = await api_hukum.put<KPMRHukumDefinition>(`/kpmr-hukum/definitions/${id}`, data);
    return response.data;
  }

  // HARD DELETE definition with scores
  async deleteDefinitionPermanent(definitionId: number, year: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE to: /kpmr-hukum/definition/${definitionId}/${year}`);
    const response = await api_hukum.delete<DeleteResponse>(`/kpmr-hukum/definition/${definitionId}/${year}`);
    return response.data;
  }

  // ========== SCORE API ==========
  async createOrUpdateScore(data: CreateKPMRHukumScoreData): Promise<KPMRHukumScore> {
    console.log('📤 POST to: /kpmr-hukum/scores', data);
    const response = await api_hukum.post<KPMRHukumScore>('/kpmr-hukum/scores', data);
    return response.data;
  }

  async getAllScores(): Promise<KPMRHukumScore[]> {
    console.log('📥 GET from: /kpmr-hukum/scores');
    const response = await api_hukum.get<KPMRHukumScore[]>('/kpmr-hukum/scores');
    return response.data;
  }

  async getScoresByPeriod(year: number, quarter?: string): Promise<KPMRHukumScore[]> {
    let url = `/kpmr-hukum/scores/period?year=${year}`;
    if (quarter) url += `&quarter=${quarter}`;
    console.log('📥 GET from:', url);
    const response = await api_hukum.get<KPMRHukumScore[]>(url);
    return response.data;
  }

  async getScoresByDefinition(definitionId: number): Promise<KPMRHukumScore[]> {
    console.log(`📥 GET from: /kpmr-hukum/scores/definition/${definitionId}`);
    const response = await api_hukum.get<KPMRHukumScore[]>(`/kpmr-hukum/scores/definition/${definitionId}`);
    return response.data;
  }

  async getScoreById(id: number): Promise<KPMRHukumScore> {
    console.log(`📥 GET from: /kpmr-hukum/scores/${id}`);
    const response = await api_hukum.get<KPMRHukumScore>(`/kpmr-hukum/scores/${id}`);
    return response.data;
  }

  async updateScore(id: number, data: UpdateKPMRHukumScoreData): Promise<KPMRHukumScore> {
    console.log(`📤 PUT to: /kpmr-hukum/scores/${id}`, data);
    const response = await api_hukum.put<KPMRHukumScore>(`/kpmr-hukum/scores/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteScore(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-hukum/scores/${id}`);
    const response = await api_hukum.delete<DeleteResponse>(`/kpmr-hukum/scores/${id}`);
    return response.data;
  }

  async deleteScoreByTarget(definitionId: number, year: number, quarter: string): Promise<DeleteResponse> {
    console.log('🗑️ POST to: /kpmr-hukum/scores/target/delete', { definitionId, year, quarter });
    const response = await api_hukum.post<DeleteResponse>('/kpmr-hukum/scores/target/delete', { definitionId, year, quarter });
    return response.data;
  }

  // ========== COMPLEX QUERIES ==========
  async getFullData(year: number): Promise<KPMRHukumFullDataResponse> {
    console.log(`📥 GET full data from: /kpmr-hukum/full-data/${year}`);
    const response = await api_hukum.get<KPMRHukumFullDataResponse>(`/kpmr-hukum/full-data/${year}`);
    return response.data;
  }

  async searchKPMR(year?: number, query?: string, aspekNo?: string): Promise<KPMRHukumDefinition[]> {
    let url = '/kpmr-hukum/search';
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (query) params.append('query', query);
    if (aspekNo) params.append('aspekNo', aspekNo);

    if (params.toString()) url += `?${params.toString()}`;
    console.log('📥 GET from:', url);
    const response = await api_hukum.get<KPMRHukumDefinition[]>(url);
    return response.data;
  }

  async getAvailableYears(): Promise<number[]> {
    console.log('📥 GET from: /kpmr-hukum/years');
    const response = await api_hukum.get<YearsResponse>('/kpmr-hukum/years');
    return response.data.data;
  }

  async getPeriods(): Promise<Period[]> {
    console.log('📥 GET from: /kpmr-hukum/periods');
    const response = await api_hukum.get<PeriodsResponse>('/kpmr-hukum/periods');
    return response.data.data;
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const kpmrHukumApiService = new KPMRHukumApiService();

// ============================================================================
// UTILITY FUNCTIONS untuk Transform Data
// ============================================================================

export const transformDefinitionToComponent = (definition: KPMRHukumDefinition, scores: KPMRHukumScore[] = []) => {
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

export const transformFullDataToGroups = (fullData: KPMRHukumFullDataResponse) => {
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
