// src/features/Dashboard/pages/RiskProfile/pages/Reputasi/services/kpmr-reputasi.service.ts

import api_reputasi from '../api.service';
// ============================================================================
// INTERFACES - Sesuai dengan Entity Backend (dengan Year) - HARD DELETE ONLY
// ============================================================================

// ---------- ASPEK (Master) ----------
export interface KPMRReputasiAspect {
  id: number;
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKPMRReputasiAspectData {
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
}

export interface UpdateKPMRReputasiAspectData {
  aspekNo?: string;
  aspekTitle?: string;
  aspekBobot?: number;
}

// ---------- QUESTION (Master Pertanyaan) ----------
export interface KPMRReputasiQuestion {
  id: number;
  year: number;
  aspekNo: string;
  sectionNo: string;
  sectionTitle: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKPMRReputasiQuestionData {
  year: number;
  aspekNo: string;
  sectionNo: string;
  sectionTitle: string;
}

export interface UpdateKPMRReputasiQuestionData {
  aspekNo?: string;
  sectionNo?: string;
  sectionTitle?: string;
}

// ---------- DEFINITION (Year-Level) ----------
export interface KPMRReputasiDefinition {
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
  scores?: KPMRReputasiScore[];
}

export interface CreateKPMRReputasiDefinitionData {
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

export interface UpdateKPMRReputasiDefinitionData {
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
export interface KPMRReputasiScore {
  id: number;
  definitionId: number;
  year: number;
  quarter: string;
  sectionSkor: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  definition?: KPMRReputasiDefinition;
}

export interface CreateKPMRReputasiScoreData {
  definitionId: number;
  year: number;
  quarter: string;
  sectionSkor?: number;
}

export interface UpdateKPMRReputasiScoreData {
  definitionId?: number;
  year?: number;
  quarter?: string;
  sectionSkor?: number;
}

// ---------- RESPONSE INTERFACES ----------
export interface KPMRReputasiFullDataResponse {
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

class KPMRReputasiApiService {
  // ========== ASPECT API ==========
  async createAspect(data: CreateKPMRReputasiAspectData): Promise<KPMRReputasiAspect> {
    console.log('📤 POST to: /kpmr-reputasi/aspects', data);
    const response = await api_reputasi.post<KPMRReputasiAspect>('/kpmr-reputasi/aspects', data);
    return response.data;
  }

  async getAllAspects(year?: number): Promise<KPMRReputasiAspect[]> {
    let url = '/kpmr-reputasi/aspects';
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_reputasi.get<KPMRReputasiAspect[]>(url);
    return response.data;
  }

  async getAspectById(id: number): Promise<KPMRReputasiAspect> {
    console.log(`📥 GET from: /kpmr-reputasi/aspects/${id}`);
    const response = await api_reputasi.get<KPMRReputasiAspect>(`/kpmr-reputasi/aspects/${id}`);
    return response.data;
  }

  async updateAspect(id: number, data: UpdateKPMRReputasiAspectData): Promise<KPMRReputasiAspect> {
    console.log(`📤 PUT to: /kpmr-reputasi/aspects/${id}`, data);
    const response = await api_reputasi.put<KPMRReputasiAspect>(`/kpmr-reputasi/aspects/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteAspect(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-reputasi/aspects/${id}`);
    const response = await api_reputasi.delete<DeleteResponse>(`/kpmr-reputasi/aspects/${id}`);
    return response.data;
  }

  // ========== QUESTION API ==========
  async createQuestion(data: CreateKPMRReputasiQuestionData): Promise<KPMRReputasiQuestion> {
    console.log('📤 POST to: /kpmr-reputasi/questions', data);
    const response = await api_reputasi.post<KPMRReputasiQuestion>('/kpmr-reputasi/questions', data);
    return response.data;
  }

  async getAllQuestions(year?: number): Promise<KPMRReputasiQuestion[]> {
    let url = '/kpmr-reputasi/questions';
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_reputasi.get<KPMRReputasiQuestion[]>(url);
    return response.data;
  }

  async getQuestionsByAspect(aspekNo: string, year?: number): Promise<KPMRReputasiQuestion[]> {
    let url = `/kpmr-reputasi/questions/aspect/${aspekNo}`;
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_reputasi.get<KPMRReputasiQuestion[]>(url);
    return response.data;
  }

  async getQuestionById(id: number): Promise<KPMRReputasiQuestion> {
    console.log(`📥 GET from: /kpmr-reputasi/questions/${id}`);
    const response = await api_reputasi.get<KPMRReputasiQuestion>(`/kpmr-reputasi/questions/${id}`);
    return response.data;
  }

  async updateQuestion(id: number, data: UpdateKPMRReputasiQuestionData): Promise<KPMRReputasiQuestion> {
    console.log(`📤 PUT to: /kpmr-reputasi/questions/${id}`, data);
    const response = await api_reputasi.put<KPMRReputasiQuestion>(`/kpmr-reputasi/questions/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteQuestion(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-reputasi/questions/${id}`);
    const response = await api_reputasi.delete<DeleteResponse>(`/kpmr-reputasi/questions/${id}`);
    return response.data;
  }

  // ========== DEFINITION API ==========
  async createOrUpdateDefinition(data: CreateKPMRReputasiDefinitionData): Promise<KPMRReputasiDefinition> {
    console.log('📤 POST to: /kpmr-reputasi/definitions', data);
    const response = await api_reputasi.post<KPMRReputasiDefinition>('/kpmr-reputasi/definitions', data);
    return response.data;
  }

  async getAllDefinitions(): Promise<KPMRReputasiDefinition[]> {
    console.log('📥 GET from: /kpmr-reputasi/definitions');
    const response = await api_reputasi.get<KPMRReputasiDefinition[]>('/kpmr-reputasi/definitions');
    return response.data;
  }

  async getDefinitionsByYear(year: number): Promise<KPMRReputasiDefinition[]> {
    console.log(`📥 GET from: /kpmr-reputasi/definitions/year/${year}`);
    const response = await api_reputasi.get<KPMRReputasiDefinition[]>(`/kpmr-reputasi/definitions/year/${year}`);
    return response.data;
  }

  async getDefinitionById(id: number): Promise<KPMRReputasiDefinition> {
    console.log(`📥 GET from: /kpmr-reputasi/definitions/${id}`);
    const response = await api_reputasi.get<KPMRReputasiDefinition>(`/kpmr-reputasi/definitions/${id}`);
    return response.data;
  }

  async updateDefinition(id: number, data: UpdateKPMRReputasiDefinitionData): Promise<KPMRReputasiDefinition> {
    console.log(`📤 PUT to: /kpmr-reputasi/definitions/${id}`, data);
    const response = await api_reputasi.put<KPMRReputasiDefinition>(`/kpmr-reputasi/definitions/${id}`, data);
    return response.data;
  }

  // HARD DELETE definition with scores
  async deleteDefinitionPermanent(definitionId: number, year: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE to: /kpmr-reputasi/definition/${definitionId}/${year}`);
    const response = await api_reputasi.delete<DeleteResponse>(`/kpmr-reputasi/definition/${definitionId}/${year}`);
    return response.data;
  }

  // ========== SCORE API ==========
  async createOrUpdateScore(data: CreateKPMRReputasiScoreData): Promise<KPMRReputasiScore> {
    console.log('📤 POST to: /kpmr-reputasi/scores', data);
    const response = await api_reputasi.post<KPMRReputasiScore>('/kpmr-reputasi/scores', data);
    return response.data;
  }

  async getAllScores(): Promise<KPMRReputasiScore[]> {
    console.log('📥 GET from: /kpmr-reputasi/scores');
    const response = await api_reputasi.get<KPMRReputasiScore[]>('/kpmr-reputasi/scores');
    return response.data;
  }

  async getScoresByPeriod(year: number, quarter?: string): Promise<KPMRReputasiScore[]> {
    let url = `/kpmr-reputasi/scores/period?year=${year}`;
    if (quarter) url += `&quarter=${quarter}`;
    console.log('📥 GET from:', url);
    const response = await api_reputasi.get<KPMRReputasiScore[]>(url);
    return response.data;
  }

  async getScoresByDefinition(definitionId: number): Promise<KPMRReputasiScore[]> {
    console.log(`📥 GET from: /kpmr-reputasi/scores/definition/${definitionId}`);
    const response = await api_reputasi.get<KPMRReputasiScore[]>(`/kpmr-reputasi/scores/definition/${definitionId}`);
    return response.data;
  }

  async getScoreById(id: number): Promise<KPMRReputasiScore> {
    console.log(`📥 GET from: /kpmr-reputasi/scores/${id}`);
    const response = await api_reputasi.get<KPMRReputasiScore>(`/kpmr-reputasi/scores/${id}`);
    return response.data;
  }

  async updateScore(id: number, data: UpdateKPMRReputasiScoreData): Promise<KPMRReputasiScore> {
    console.log(`📤 PUT to: /kpmr-reputasi/scores/${id}`, data);
    const response = await api_reputasi.put<KPMRReputasiScore>(`/kpmr-reputasi/scores/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteScore(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-reputasi/scores/${id}`);
    const response = await api_reputasi.delete<DeleteResponse>(`/kpmr-reputasi/scores/${id}`);
    return response.data;
  }

  async deleteScoreByTarget(definitionId: number, year: number, quarter: string): Promise<DeleteResponse> {
    console.log('🗑️ POST to: /kpmr-reputasi/scores/target/delete', { definitionId, year, quarter });
    const response = await api_reputasi.post<DeleteResponse>('/kpmr-reputasi/scores/target/delete', { definitionId, year, quarter });
    return response.data;
  }

  // ========== COMPLEX QUERIES ==========
  async getFullData(year: number): Promise<KPMRReputasiFullDataResponse> {
    console.log(`📥 GET full data from: /kpmr-reputasi/full-data/${year}`);
    const response = await api_reputasi.get<KPMRReputasiFullDataResponse>(`/kpmr-reputasi/full-data/${year}`);
    return response.data;
  }

  async searchKPMR(year?: number, query?: string, aspekNo?: string): Promise<KPMRReputasiDefinition[]> {
    let url = '/kpmr-reputasi/search';
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (query) params.append('query', query);
    if (aspekNo) params.append('aspekNo', aspekNo);

    if (params.toString()) url += `?${params.toString()}`;
    console.log('📥 GET from:', url);
    const response = await api_reputasi.get<KPMRReputasiDefinition[]>(url);
    return response.data;
  }

  async getAvailableYears(): Promise<number[]> {
    console.log('📥 GET from: /kpmr-reputasi/years');
    const response = await api_reputasi.get<YearsResponse>('/kpmr-reputasi/years');
    return response.data.data;
  }

  async getPeriods(): Promise<Period[]> {
    console.log('📥 GET from: /kpmr-reputasi/periods');
    const response = await api_reputasi.get<PeriodsResponse>('/kpmr-reputasi/periods');
    return response.data.data;
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const kpmrReputasiApiService = new KPMRReputasiApiService();

// ============================================================================
// UTILITY FUNCTIONS untuk Transform Data
// ============================================================================

export const transformDefinitionToComponent = (definition: KPMRReputasiDefinition, scores: KPMRReputasiScore[] = []) => {
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

export const transformFullDataToGroups = (fullData: KPMRReputasiFullDataResponse) => {
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
