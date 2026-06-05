// src/features/Dashboard/pages/RiskProfile/pages/Kepatuhan/services/kpmr-kepatuhan.service.ts

import api_kepatuhan from "../api-kepatuhan.service";
// ============================================================================
// INTERFACES - Sesuai dengan Entity Backend (dengan Year) - HARD DELETE ONLY
// ============================================================================

// ---------- ASPEK (Master) ----------
export interface KPMRKepatuhanAspect {
  id: number;
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKPMRKepatuhanAspectData {
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
}

export interface UpdateKPMRKepatuhanAspectData {
  aspekNo?: string;
  aspekTitle?: string;
  aspekBobot?: number;
}

// ---------- QUESTION (Master Pertanyaan) ----------
export interface KPMRKepatuhanQuestion {
  id: number;
  year: number;
  aspekNo: string;
  sectionNo: string;
  sectionTitle: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKPMRKepatuhanQuestionData {
  year: number;
  aspekNo: string;
  sectionNo: string;
  sectionTitle: string;
}

export interface UpdateKPMRKepatuhanQuestionData {
  aspekNo?: string;
  sectionNo?: string;
  sectionTitle?: string;
}

// ---------- DEFINITION (Year-Level) ----------
export interface KPMRKepatuhanDefinition {
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
  scores?: KPMRKepatuhanScore[];
}

export interface CreateKPMRKepatuhanDefinitionData {
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

export interface UpdateKPMRKepatuhanDefinitionData {
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
export interface KPMRKepatuhanScore {
  id: number;
  definitionId: number;
  year: number;
  quarter: string;
  sectionSkor: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  definition?: KPMRKepatuhanDefinition;
}

export interface CreateKPMRKepatuhanScoreData {
  definitionId: number;
  year: number;
  quarter: string;
  sectionSkor?: number;
}

export interface UpdateKPMRKepatuhanScoreData {
  definitionId?: number;
  year?: number;
  quarter?: string;
  sectionSkor?: number;
}

// ---------- RESPONSE INTERFACES ----------
export interface KPMRKepatuhanFullDataResponse {
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

class KPMRKepatuhanApiService {
  // ========== ASPECT API ==========
  async createAspect(data: CreateKPMRKepatuhanAspectData): Promise<KPMRKepatuhanAspect> {
    console.log('📤 POST to: /kpmr-kepatuhan/aspects', data);
    const response = await api_kepatuhan.post<KPMRKepatuhanAspect>('/kpmr-kepatuhan/aspects', data);
    return response.data;
  }

  async getAllAspects(year?: number): Promise<KPMRKepatuhanAspect[]> {
    let url = '/kpmr-kepatuhan/aspects';
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_kepatuhan.get<KPMRKepatuhanAspect[]>(url);
    return response.data;
  }

  async getAspectById(id: number): Promise<KPMRKepatuhanAspect> {
    console.log(`📥 GET from: /kpmr-kepatuhan/aspects/${id}`);
    const response = await api_kepatuhan.get<KPMRKepatuhanAspect>(`/kpmr-kepatuhan/aspects/${id}`);
    return response.data;
  }

  async updateAspect(id: number, data: UpdateKPMRKepatuhanAspectData): Promise<KPMRKepatuhanAspect> {
    console.log(`📤 PUT to: /kpmr-kepatuhan/aspects/${id}`, data);
    const response = await api_kepatuhan.put<KPMRKepatuhanAspect>(`/kpmr-kepatuhan/aspects/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteAspect(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-kepatuhan/aspects/${id}`);
    const response = await api_kepatuhan.delete<DeleteResponse>(`/kpmr-kepatuhan/aspects/${id}`);
    return response.data;
  }

  // ========== QUESTION API ==========
  async createQuestion(data: CreateKPMRKepatuhanQuestionData): Promise<KPMRKepatuhanQuestion> {
    console.log('📤 POST to: /kpmr-kepatuhan/questions', data);
    const response = await api_kepatuhan.post<KPMRKepatuhanQuestion>('/kpmr-kepatuhan/questions', data);
    return response.data;
  }

  async getAllQuestions(year?: number): Promise<KPMRKepatuhanQuestion[]> {
    let url = '/kpmr-kepatuhan/questions';
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_kepatuhan.get<KPMRKepatuhanQuestion[]>(url);
    return response.data;
  }

  async getQuestionsByAspect(aspekNo: string, year?: number): Promise<KPMRKepatuhanQuestion[]> {
    let url = `/kpmr-kepatuhan/questions/aspect/${aspekNo}`;
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_kepatuhan.get<KPMRKepatuhanQuestion[]>(url);
    return response.data;
  }

  async getQuestionById(id: number): Promise<KPMRKepatuhanQuestion> {
    console.log(`📥 GET from: /kpmr-kepatuhan/questions/${id}`);
    const response = await api_kepatuhan.get<KPMRKepatuhanQuestion>(`/kpmr-kepatuhan/questions/${id}`);
    return response.data;
  }

  async updateQuestion(id: number, data: UpdateKPMRKepatuhanQuestionData): Promise<KPMRKepatuhanQuestion> {
    console.log(`📤 PUT to: /kpmr-kepatuhan/questions/${id}`, data);
    const response = await api_kepatuhan.put<KPMRKepatuhanQuestion>(`/kpmr-kepatuhan/questions/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteQuestion(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-kepatuhan/questions/${id}`);
    const response = await api_kepatuhan.delete<DeleteResponse>(`/kpmr-kepatuhan/questions/${id}`);
    return response.data;
  }

  // ========== DEFINITION API ==========
  async createOrUpdateDefinition(data: CreateKPMRKepatuhanDefinitionData): Promise<KPMRKepatuhanDefinition> {
    console.log('📤 POST to: /kpmr-kepatuhan/definitions', data);
    const response = await api_kepatuhan.post<KPMRKepatuhanDefinition>('/kpmr-kepatuhan/definitions', data);
    return response.data;
  }

  async getAllDefinitions(): Promise<KPMRKepatuhanDefinition[]> {
    console.log('📥 GET from: /kpmr-kepatuhan/definitions');
    const response = await api_kepatuhan.get<KPMRKepatuhanDefinition[]>('/kpmr-kepatuhan/definitions');
    return response.data;
  }

  async getDefinitionsByYear(year: number): Promise<KPMRKepatuhanDefinition[]> {
    console.log(`📥 GET from: /kpmr-kepatuhan/definitions/year/${year}`);
    const response = await api_kepatuhan.get<KPMRKepatuhanDefinition[]>(`/kpmr-kepatuhan/definitions/year/${year}`);
    return response.data;
  }

  async getDefinitionById(id: number): Promise<KPMRKepatuhanDefinition> {
    console.log(`📥 GET from: /kpmr-kepatuhan/definitions/${id}`);
    const response = await api_kepatuhan.get<KPMRKepatuhanDefinition>(`/kpmr-kepatuhan/definitions/${id}`);
    return response.data;
  }

  async updateDefinition(id: number, data: UpdateKPMRKepatuhanDefinitionData): Promise<KPMRKepatuhanDefinition> {
    console.log(`📤 PUT to: /kpmr-kepatuhan/definitions/${id}`, data);
    const response = await api_kepatuhan.put<KPMRKepatuhanDefinition>(`/kpmr-kepatuhan/definitions/${id}`, data);
    return response.data;
  }

  // HARD DELETE definition with scores
  async deleteDefinitionPermanent(definitionId: number, year: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE to: /kpmr-kepatuhan/definition/${definitionId}/${year}`);
    const response = await api_kepatuhan.delete<DeleteResponse>(`/kpmr-kepatuhan/definition/${definitionId}/${year}`);
    return response.data;
  }

  // ========== SCORE API ==========
  async createOrUpdateScore(data: CreateKPMRKepatuhanScoreData): Promise<KPMRKepatuhanScore> {
    console.log('📤 POST to: /kpmr-kepatuhan/scores', data);
    const response = await api_kepatuhan.post<KPMRKepatuhanScore>('/kpmr-kepatuhan/scores', data);
    return response.data;
  }

  async getAllScores(): Promise<KPMRKepatuhanScore[]> {
    console.log('📥 GET from: /kpmr-kepatuhan/scores');
    const response = await api_kepatuhan.get<KPMRKepatuhanScore[]>('/kpmr-kepatuhan/scores');
    return response.data;
  }

  async getScoresByPeriod(year: number, quarter?: string): Promise<KPMRKepatuhanScore[]> {
    let url = `/kpmr-kepatuhan/scores/period?year=${year}`;
    if (quarter) url += `&quarter=${quarter}`;
    console.log('📥 GET from:', url);
    const response = await api_kepatuhan.get<KPMRKepatuhanScore[]>(url);
    return response.data;
  }

  async getScoresByDefinition(definitionId: number): Promise<KPMRKepatuhanScore[]> {
    console.log(`📥 GET from: /kpmr-kepatuhan/scores/definition/${definitionId}`);
    const response = await api_kepatuhan.get<KPMRKepatuhanScore[]>(`/kpmr-kepatuhan/scores/definition/${definitionId}`);
    return response.data;
  }

  async getScoreById(id: number): Promise<KPMRKepatuhanScore> {
    console.log(`📥 GET from: /kpmr-kepatuhan/scores/${id}`);
    const response = await api_kepatuhan.get<KPMRKepatuhanScore>(`/kpmr-kepatuhan/scores/${id}`);
    return response.data;
  }

  async updateScore(id: number, data: UpdateKPMRKepatuhanScoreData): Promise<KPMRKepatuhanScore> {
    console.log(`📤 PUT to: /kpmr-kepatuhan/scores/${id}`, data);
    const response = await api_kepatuhan.put<KPMRKepatuhanScore>(`/kpmr-kepatuhan/scores/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteScore(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-kepatuhan/scores/${id}`);
    const response = await api_kepatuhan.delete<DeleteResponse>(`/kpmr-kepatuhan/scores/${id}`);
    return response.data;
  }

  async deleteScoreByTarget(definitionId: number, year: number, quarter: string): Promise<DeleteResponse> {
    console.log('🗑️ POST to: /kpmr-kepatuhan/scores/target/delete', { definitionId, year, quarter });
    const response = await api_kepatuhan.post<DeleteResponse>('/kpmr-kepatuhan/scores/target/delete', { definitionId, year, quarter });
    return response.data;
  }

  // ========== COMPLEX QUERIES ==========
  async getFullData(year: number): Promise<KPMRKepatuhanFullDataResponse> {
    console.log(`📥 GET full data from: /kpmr-kepatuhan/full-data/${year}`);
    const response = await api_kepatuhan.get<KPMRKepatuhanFullDataResponse>(`/kpmr-kepatuhan/full-data/${year}`);
    return response.data;
  }

  async searchKPMR(year?: number, query?: string, aspekNo?: string): Promise<KPMRKepatuhanDefinition[]> {
    let url = '/kpmr-kepatuhan/search';
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (query) params.append('query', query);
    if (aspekNo) params.append('aspekNo', aspekNo);

    if (params.toString()) url += `?${params.toString()}`;
    console.log('📥 GET from:', url);
    const response = await api_kepatuhan.get<KPMRKepatuhanDefinition[]>(url);
    return response.data;
  }

  async getAvailableYears(): Promise<number[]> {
    console.log('📥 GET from: /kpmr-kepatuhan/years');
    const response = await api_kepatuhan.get<YearsResponse>('/kpmr-kepatuhan/years');
    return response.data.data;
  }

  async getPeriods(): Promise<Period[]> {
    console.log('📥 GET from: /kpmr-kepatuhan/periods');
    const response = await api_kepatuhan.get<PeriodsResponse>('/kpmr-kepatuhan/periods');
    return response.data.data;
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const kpmrKepatuhanApiService = new KPMRKepatuhanApiService();

// ============================================================================
// UTILITY FUNCTIONS untuk Transform Data
// ============================================================================

export const transformDefinitionToComponent = (definition: KPMRKepatuhanDefinition, scores: KPMRKepatuhanScore[] = []) => {
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

export const transformFullDataToGroups = (fullData: KPMRKepatuhanFullDataResponse) => {
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
