import api_likuiditas from '../api-likuiditas.service';
// ============================================================================
// INTERFACES - Sesuai dengan Entity Backend (dengan Year) - HARD DELETE ONLY
// ============================================================================

// ---------- ASPEK (Master) ----------
export interface KPMRLikuiditasAspect {
  id: number;
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKPMRLikuiditasAspectData {
  year: number;
  aspekNo: string;
  aspekTitle: string;
  aspekBobot: number;
}

export interface UpdateKPMRLikuiditasAspectData {
  aspekNo?: string;
  aspekTitle?: string;
  aspekBobot?: number;
}

// ---------- QUESTION (Master Pertanyaan) ----------
export interface KPMRLikuiditasQuestion {
  id: number;
  year: number;
  aspekNo: string;
  sectionNo: string;
  sectionTitle: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKPMRLikuiditasQuestionData {
  year: number;
  aspekNo: string;
  sectionNo: string;
  sectionTitle: string;
}

export interface UpdateKPMRLikuiditasQuestionData {
  aspekNo?: string;
  sectionNo?: string;
  sectionTitle?: string;
}

// ---------- DEFINITION (Year-Level) ----------
export interface KPMRLikuiditasDefinition {
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
  scores?: KPMRLikuiditasScore[];
}

export interface CreateKPMRLikuiditasDefinitionData {
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

export interface UpdateKPMRLikuiditasDefinitionData {
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
export interface KPMRLikuiditasScore {
  id: number;
  definitionId: number;
  year: number;
  quarter: string;
  sectionSkor: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  definition?: KPMRLikuiditasDefinition;
}

export interface CreateKPMRLikuiditasScoreData {
  definitionId: number;
  year: number;
  quarter: string;
  sectionSkor?: number;
}

export interface UpdateKPMRLikuiditasScoreData {
  definitionId?: number;
  year?: number;
  quarter?: string;
  sectionSkor?: number;
}

// ---------- RESPONSE INTERFACES ----------
export interface KPMRLikuiditasFullDataResponse {
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

class KPMRLikuiditasApiService {
  // ========== ASPECT API ==========
  async createAspect(data: CreateKPMRLikuiditasAspectData): Promise<KPMRLikuiditasAspect> {
    console.log('📤 POST to: /kpmr-likuiditas/aspects', data);
    const response = await api_likuiditas.post<KPMRLikuiditasAspect>('/kpmr-likuiditas/aspects', data);
    return response.data;
  }

  async getAllAspects(year?: number): Promise<KPMRLikuiditasAspect[]> {
    let url = '/kpmr-likuiditas/aspects';
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_likuiditas.get<KPMRLikuiditasAspect[]>(url);
    return response.data;
  }

  async getAspectById(id: number): Promise<KPMRLikuiditasAspect> {
    console.log(`📥 GET from: /kpmr-likuiditas/aspects/${id}`);
    const response = await api_likuiditas.get<KPMRLikuiditasAspect>(`/kpmr-likuiditas/aspects/${id}`);
    return response.data;
  }

  async updateAspect(id: number, data: UpdateKPMRLikuiditasAspectData): Promise<KPMRLikuiditasAspect> {
    console.log(`📤 PUT to: /kpmr-likuiditas/aspects/${id}`, data);
    const response = await api_likuiditas.put<KPMRLikuiditasAspect>(`/kpmr-likuiditas/aspects/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteAspect(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-likuiditas/aspects/${id}`);
    const response = await api_likuiditas.delete<DeleteResponse>(`/kpmr-likuiditas/aspects/${id}`);
    return response.data;
  }

  // ========== QUESTION API ==========
  async createQuestion(data: CreateKPMRLikuiditasQuestionData): Promise<KPMRLikuiditasQuestion> {
    console.log('📤 POST to: /kpmr-likuiditas/questions', data);
    const response = await api_likuiditas.post<KPMRLikuiditasQuestion>('/kpmr-likuiditas/questions', data);
    return response.data;
  }

  async getAllQuestions(year?: number): Promise<KPMRLikuiditasQuestion[]> {
    let url = '/kpmr-likuiditas/questions';
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_likuiditas.get<KPMRLikuiditasQuestion[]>(url);
    return response.data;
  }

  async getQuestionsByAspect(aspekNo: string, year?: number): Promise<KPMRLikuiditasQuestion[]> {
    let url = `/kpmr-likuiditas/questions/aspect/${aspekNo}`;
    if (year) url += `?year=${year}`;
    console.log('📥 GET from:', url);
    const response = await api_likuiditas.get<KPMRLikuiditasQuestion[]>(url);
    return response.data;
  }

  async getQuestionById(id: number): Promise<KPMRLikuiditasQuestion> {
    console.log(`📥 GET from: /kpmr-likuiditas/questions/${id}`);
    const response = await api_likuiditas.get<KPMRLikuiditasQuestion>(`/kpmr-likuiditas/questions/${id}`);
    return response.data;
  }

  async updateQuestion(id: number, data: UpdateKPMRLikuiditasQuestionData): Promise<KPMRLikuiditasQuestion> {
    console.log(`📤 PUT to: /kpmr-likuiditas/questions/${id}`, data);
    const response = await api_likuiditas.put<KPMRLikuiditasQuestion>(`/kpmr-likuiditas/questions/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteQuestion(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-likuiditas/questions/${id}`);
    const response = await api_likuiditas.delete<DeleteResponse>(`/kpmr-likuiditas/questions/${id}`);
    return response.data;
  }

  // ========== DEFINITION API ==========
  async createOrUpdateDefinition(data: CreateKPMRLikuiditasDefinitionData): Promise<KPMRLikuiditasDefinition> {
    console.log('📤 POST to: /kpmr-likuiditas/definitions', data);
    const response = await api_likuiditas.post<KPMRLikuiditasDefinition>('/kpmr-likuiditas/definitions', data);
    return response.data;
  }

  async getAllDefinitions(): Promise<KPMRLikuiditasDefinition[]> {
    console.log('📥 GET from: /kpmr-likuiditas/definitions');
    const response = await api_likuiditas.get<KPMRLikuiditasDefinition[]>('/kpmr-likuiditas/definitions');
    return response.data;
  }

  async getDefinitionsByYear(year: number): Promise<KPMRLikuiditasDefinition[]> {
    console.log(`📥 GET from: /kpmr-likuiditas/definitions/year/${year}`);
    const response = await api_likuiditas.get<KPMRLikuiditasDefinition[]>(`/kpmr-likuiditas/definitions/year/${year}`);
    return response.data;
  }

  async getDefinitionById(id: number): Promise<KPMRLikuiditasDefinition> {
    console.log(`📥 GET from: /kpmr-likuiditas/definitions/${id}`);
    const response = await api_likuiditas.get<KPMRLikuiditasDefinition>(`/kpmr-likuiditas/definitions/${id}`);
    return response.data;
  }

  async updateDefinition(id: number, data: UpdateKPMRLikuiditasDefinitionData): Promise<KPMRLikuiditasDefinition> {
    console.log(`📤 PUT to: /kpmr-likuiditas/definitions/${id}`, data);
    const response = await api_likuiditas.put<KPMRLikuiditasDefinition>(`/kpmr-likuiditas/definitions/${id}`, data);
    return response.data;
  }

  // HARD DELETE definition with scores
  async deleteDefinitionPermanent(definitionId: number, year: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE to: /kpmr-likuiditas/definition/${definitionId}/${year}`);
    const response = await api_likuiditas.delete<DeleteResponse>(`/kpmr-likuiditas/definition/${definitionId}/${year}`);
    return response.data;
  }

  // ========== SCORE API ==========
  async createOrUpdateScore(data: CreateKPMRLikuiditasScoreData): Promise<KPMRLikuiditasScore> {
    console.log('📤 POST to: /kpmr-likuiditas/scores', data);
    const response = await api_likuiditas.post<KPMRLikuiditasScore>('/kpmr-likuiditas/scores', data);
    return response.data;
  }

  async getAllScores(): Promise<KPMRLikuiditasScore[]> {
    console.log('📥 GET from: /kpmr-likuiditas/scores');
    const response = await api_likuiditas.get<KPMRLikuiditasScore[]>('/kpmr-likuiditas/scores');
    return response.data;
  }

  async getScoresByPeriod(year: number, quarter?: string): Promise<KPMRLikuiditasScore[]> {
    let url = `/kpmr-likuiditas/scores/period?year=${year}`;
    if (quarter) url += `&quarter=${quarter}`;
    console.log('📥 GET from:', url);
    const response = await api_likuiditas.get<KPMRLikuiditasScore[]>(url);
    return response.data;
  }

  async getScoresByDefinition(definitionId: number): Promise<KPMRLikuiditasScore[]> {
    console.log(`📥 GET from: /kpmr-likuiditas/scores/definition/${definitionId}`);
    const response = await api_likuiditas.get<KPMRLikuiditasScore[]>(`/kpmr-likuiditas/scores/definition/${definitionId}`);
    return response.data;
  }

  async getScoreById(id: number): Promise<KPMRLikuiditasScore> {
    console.log(`📥 GET from: /kpmr-likuiditas/scores/${id}`);
    const response = await api_likuiditas.get<KPMRLikuiditasScore>(`/kpmr-likuiditas/scores/${id}`);
    return response.data;
  }

  async updateScore(id: number, data: UpdateKPMRLikuiditasScoreData): Promise<KPMRLikuiditasScore> {
    console.log(`📤 PUT to: /kpmr-likuiditas/scores/${id}`, data);
    const response = await api_likuiditas.put<KPMRLikuiditasScore>(`/kpmr-likuiditas/scores/${id}`, data);
    return response.data;
  }

  // HARD DELETE
  async deleteScore(id: number): Promise<DeleteResponse> {
    console.log(`🗑️ DELETE (hard) from: /kpmr-likuiditas/scores/${id}`);
    const response = await api_likuiditas.delete<DeleteResponse>(`/kpmr-likuiditas/scores/${id}`);
    return response.data;
  }

  async deleteScoreByTarget(definitionId: number, year: number, quarter: string): Promise<DeleteResponse> {
    console.log('🗑️ POST to: /kpmr-likuiditas/scores/target/delete', { definitionId, year, quarter });
    const response = await api_likuiditas.post<DeleteResponse>('/kpmr-likuiditas/scores/target/delete', { definitionId, year, quarter });
    return response.data;
  }

  // ========== COMPLEX QUERIES ==========
  async getFullData(year: number): Promise<KPMRLikuiditasFullDataResponse> {
    console.log(`📥 GET full data from: /kpmr-likuiditas/full-data/${year}`);
    const response = await api_likuiditas.get<KPMRLikuiditasFullDataResponse>(`/kpmr-likuiditas/full-data/${year}`);
    return response.data;
  }

  async searchKPMR(year?: number, query?: string, asksNo?: string): Promise<KPMRLikuiditasDefinition[]> {
    let url = '/kpmr-likuiditas/search';
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (query) params.append('query', query);
    if (asksNo) params.append('aspekNo', asksNo);

    if (params.toString()) url += `?${params.toString()}`;
    console.log('📥 GET from:', url);
    const response = await api_likuiditas.get<KPMRLikuiditasDefinition[]>(url);
    return response.data;
  }

  async getAvailableYears(): Promise<number[]> {
    console.log('📥 GET from: /kpmr-likuiditas/years');
    const response = await api_likuiditas.get<YearsResponse>('/kpmr-likuiditas/years');
    return response.data.data;
  }

  async getPeriods(): Promise<Period[]> {
    console.log('📥 GET from: /kpmr-likuiditas/periods');
    const response = await api_likuiditas.get<PeriodsResponse>('/kpmr-likuiditas/periods');
    return response.data.data;
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const kpmrLikuiditasApiService = new KPMRLikuiditasApiService();

// ============================================================================
// UTILITY FUNCTIONS untuk Transform Data
// ============================================================================

export const transformDefinitionToComponent = (definition: KPMRLikuiditasDefinition, scores: KPMRLikuiditasScore[] = []) => {
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

export const transformFullDataToGroups = (fullData: KPMRLikuiditasFullDataResponse) => {
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
