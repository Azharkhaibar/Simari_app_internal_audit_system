// src/features/Dashboard/pages/RiskProfile/pages/Operasional/services/kpmr-operasional.service.ts

import api_operasional from '../api.service';
// ============================================================================
// INTERFACES - Sesuai dengan Entity Backend (dengan Year) - HARD DELETE ONLY
// ============================================================================

// ---------- ASPEK (Master) ----------
export interface KPMROperasionalAspect {
  id: number;
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKPMROperasionalAspectData {
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
}

export interface UpdateKPMROperasionalAspectData {
  aspekNo?: string;
  aspekTitle?: string;
  aspekBobot?: number;
}

// ---------- QUESTION (Master Pertanyaan) ----------
export interface KPMROperasionalQuestion {
  id: number;
  year: number;
  aspekNo: string;
  sectionNo: string;
  sectionTitle: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKPMROperasionalQuestionData {
  year: number;
  aspekNo: string;
  sectionNo: string;
  sectionTitle: string;
}

export interface UpdateKPMROperasionalQuestionData {
  aspekNo?: string;
  sectionNo?: string;
  sectionTitle?: string;
}

// ---------- DEFINITION (Year-Level) ----------
export interface KPMROperasionalDefinition {
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
  scores?: KPMROperasionalScore[];
}

export interface CreateKPMROperasionalDefinitionData {
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

export interface UpdateKPMROperasionalDefinitionData {
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
export interface KPMROperasionalScore {
  id: number;
  definitionId: number;
  year: number;
  quarter: string;
  sectionSkor: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  definition?: KPMROperasionalDefinition;
}

export interface CreateKPMROperasionalScoreData {
  definitionId: number;
  year: number;
  quarter: string;
  sectionSkor?: number;
}

export interface UpdateKPMROperasionalScoreData {
  definitionId?: number;
  year?: number;
  quarter?: string;
  sectionSkor?: number;
}

// ---------- RESPONSE INTERFACES ----------
export interface KPMROperasionalFullDataResponse {
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

class KPMROperasionalApiService {
  // ========== ASPECT API ==========
  async createAspect(data: CreateKPMROperasionalAspectData): Promise<KPMROperasionalAspect> {
    console.log('📤 POST to: /kpmr-operasional/aspects', data);
    const response = await api_operasional.post<KPMROperasionalAspect>('/kpmr-operasional/aspects', data);
    return response.data;
  }

  async getAllAspects(year?: number): Promise<KPMROperasionalAspect[]> {
    let url = '/kpmr-operasional/aspects';
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_operasional.get<KPMROperasionalAspect[]>(url);
    return response.data;
  }

  async getAspectById(id: number): Promise<KPMROperasionalAspect> {
    console.log(`📥 GET from: /kpmr-operasional/aspects/${id}`);
    const response = await api_operasional.get<KPMROperasionalAspect>(`/kpmr-operasional/aspects/${id}`);
    return response.data;
  }

  async updateAspect(id: number, data: UpdateKPMROperasionalAspectData): Promise<KPMROperasionalAspect> {
    console.log(`📤 PUT to: /kpmr-operasional/aspects/${id}`, data);
    const response = await api_operasional.put<KPMROperasionalAspect>(`/kpmr-operasional/aspects/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteAspect(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-operasional/aspects/${id}`);
    const response = await api_operasional.delete<DeleteResponse>(`/kpmr-operasional/aspects/${id}`);
    return response.data;
  }

  // ========== QUESTION API ==========
  async createQuestion(data: CreateKPMROperasionalQuestionData): Promise<KPMROperasionalQuestion> {
    console.log('📤 POST to: /kpmr-operasional/questions', data);
    const response = await api_operasional.post<KPMROperasionalQuestion>('/kpmr-operasional/questions', data);
    return response.data;
  }

  async getAllQuestions(year?: number): Promise<KPMROperasionalQuestion[]> {
    let url = '/kpmr-operasional/questions';
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_operasional.get<KPMROperasionalQuestion[]>(url);
    return response.data;
  }

  async getQuestionsByAspect(aspekNo: string, year?: number): Promise<KPMROperasionalQuestion[]> {
    let url = `/kpmr-operasional/questions/aspect/${aspekNo}`;
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_operasional.get<KPMROperasionalQuestion[]>(url);
    return response.data;
  }

  async getQuestionById(id: number): Promise<KPMROperasionalQuestion> {
    console.log(`📥 GET from: /kpmr-operasional/questions/${id}`);
    const response = await api_operasional.get<KPMROperasionalQuestion>(`/kpmr-operasional/questions/${id}`);
    return response.data;
  }

  async updateQuestion(id: number, data: UpdateKPMROperasionalQuestionData): Promise<KPMROperasionalQuestion> {
    console.log(`📤 PUT to: /kpmr-operasional/questions/${id}`, data);
    const response = await api_operasional.put<KPMROperasionalQuestion>(`/kpmr-operasional/questions/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteQuestion(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-operasional/questions/${id}`);
    const response = await api_operasional.delete<DeleteResponse>(`/kpmr-operasional/questions/${id}`);
    return response.data;
  }

  // ========== DEFINITION API ==========
  async createOrUpdateDefinition(data: CreateKPMROperasionalDefinitionData): Promise<KPMROperasionalDefinition> {
    console.log('📤 POST to: /kpmr-operasional/definitions', data);
    const response = await api_operasional.post<KPMROperasionalDefinition>('/kpmr-operasional/definitions', data);
    return response.data;
  }

  async getAllDefinitions(): Promise<KPMROperasionalDefinition[]> {
    console.log('📥 GET from: /kpmr-operasional/definitions');
    const response = await api_operasional.get<KPMROperasionalDefinition[]>('/kpmr-operasional/definitions');
    return response.data;
  }

  async getDefinitionsByYear(year: number): Promise<KPMROperasionalDefinition[]> {
    console.log(`📥 GET from: /kpmr-operasional/definitions/year/${year}`);
    const response = await api_operasional.get<KPMROperasionalDefinition[]>(`/kpmr-operasional/definitions/year/${year}`);
    return response.data;
  }

  async getDefinitionById(id: number): Promise<KPMROperasionalDefinition> {
    console.log(`📥 GET from: /kpmr-operasional/definitions/${id}`);
    const response = await api_operasional.get<KPMROperasionalDefinition>(`/kpmr-operasional/definitions/${id}`);
    return response.data;
  }

  async updateDefinition(id: number, data: UpdateKPMROperasionalDefinitionData): Promise<KPMROperasionalDefinition> {
    console.log(`📤 PUT to: /kpmr-operasional/definitions/${id}`, data);
    const response = await api_operasional.put<KPMROperasionalDefinition>(`/kpmr-operasional/definitions/${id}`, data);
    return response.data;
  }

  // HARD DELETE definition with scores
  async deleteDefinitionPermanent(definitionId: number, year: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE to: /kpmr-operasional/definition/${definitionId}/${year}`);
    const response = await api_operasional.delete<DeleteResponse>(`/kpmr-operasional/definition/${definitionId}/${year}`);
    return response.data;
  }

  // ========== SCORE API ==========
  async createOrUpdateScore(data: CreateKPMROperasionalScoreData): Promise<KPMROperasionalScore> {
    console.log('📤 POST to: /kpmr-operasional/scores', data);
    const response = await api_operasional.post<KPMROperasionalScore>('/kpmr-operasional/scores', data);
    return response.data;
  }

  async getAllScores(): Promise<KPMROperasionalScore[]> {
    console.log('📥 GET from: /kpmr-operasional/scores');
    const response = await api_operasional.get<KPMROperasionalScore[]>('/kpmr-operasional/scores');
    return response.data;
  }

  async getScoresByPeriod(year: number, quarter?: string): Promise<KPMROperasionalScore[]> {
    let url = `/kpmr-operasional/scores/period?year=${year}`;
    if (quarter) url += `&quarter=${quarter}`;
    console.log('📥 GET from:', url);
    const response = await api_operasional.get<KPMROperasionalScore[]>(url);
    return response.data;
  }

  async getScoresByDefinition(definitionId: number): Promise<KPMROperasionalScore[]> {
    console.log(`📥 GET from: /kpmr-operasional/scores/definition/${definitionId}`);
    const response = await api_operasional.get<KPMROperasionalScore[]>(`/kpmr-operasional/scores/definition/${definitionId}`);
    return response.data;
  }

  async getScoreById(id: number): Promise<KPMROperasionalScore> {
    console.log(`📥 GET from: /kpmr-operasional/scores/${id}`);
    const response = await api_operasional.get<KPMROperasionalScore>(`/kpmr-operasional/scores/${id}`);
    return response.data;
  }

  async updateScore(id: number, data: UpdateKPMROperasionalScoreData): Promise<KPMROperasionalScore> {
    console.log(`📤 PUT to: /kpmr-operasional/scores/${id}`, data);
    const response = await api_operasional.put<KPMROperasionalScore>(`/kpmr-operasional/scores/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteScore(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-operasional/scores/${id}`);
    const response = await api_operasional.delete<DeleteResponse>(`/kpmr-operasional/scores/${id}`);
    return response.data;
  }

  async deleteScoreByTarget(definitionId: number, year: number, quarter: string): Promise<DeleteResponse> {
    console.log('🗑️ POST to: /kpmr-operasional/scores/target/delete', { definitionId, year, quarter });
    const response = await api_operasional.post<DeleteResponse>('/kpmr-operasional/scores/target/delete', { definitionId, year, quarter });
    return response.data;
  }

  // ========== COMPLEX QUERIES ==========
  async getFullData(year: number): Promise<KPMROperasionalFullDataResponse> {
    console.log(`📥 GET full data from: /kpmr-operasional/full-data/${year}`);
    const response = await api_operasional.get<KPMROperasionalFullDataResponse>(`/kpmr-operasional/full-data/${year}`);
    return response.data;
  }

  async searchKPMR(year?: number, query?: string, aspekNo?: string): Promise<KPMROperasionalDefinition[]> {
    let url = '/kpmr-operasional/search';
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (query) params.append('query', query);
    if (aspekNo) params.append('aspekNo', aspekNo);

    if (params.toString()) url += `?${params.toString()}`;
    console.log('📥 GET from:', url);
    const response = await api_operasional.get<KPMROperasionalDefinition[]>(url);
    return response.data;
  }

  async getAvailableYears(): Promise<number[]> {
    console.log('📥 GET from: /kpmr-operasional/years');
    const response = await api_operasional.get<YearsResponse>('/kpmr-operasional/years');
    return response.data.data;
  }

  async getPeriods(): Promise<Period[]> {
    console.log('📥 GET from: /kpmr-operasional/periods');
    const response = await api_operasional.get<PeriodsResponse>('/kpmr-operasional/periods');
    return response.data.data;
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const kpmrOperasionalApiService = new KPMROperasionalApiService();

// ============================================================================
// UTILITY FUNCTIONS untuk Transform Data
// ============================================================================

export const transformDefinitionToComponent = (definition: KPMROperasionalDefinition, scores: KPMROperasionalScore[] = []) => {
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

export const transformFullDataToGroups = (fullData: KPMROperasionalFullDataResponse) => {
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
