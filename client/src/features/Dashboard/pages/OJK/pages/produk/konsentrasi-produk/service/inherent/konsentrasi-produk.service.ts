// services/konsentrasi-produk.service.ts
import api_konsentrasi_produk from '../konsentrasi-produk-api.service';

// =============================================
// TYPES BERDASARKAN BACKEND ENTITY
// =============================================

export interface KonsentrasiProdukOjkEntity {
  id: number;
  year: number;
  quarter: number;
  isActive: boolean;
  parameters?: KonsentrasiParameterEntity[];
  summary?: {
    totalWeighted?: number;
    summaryBg?: string;
    computedAt?: Date;
  };
  isLocked?: boolean;
  lockedAt?: Date | null;
  lockedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  version?: string;
  notes?: string;
}

export interface KonsentrasiParameterEntity {
  id: number;
  nomor?: string;
  judul: string;
  bobot: number;
  kategori?: {
    model?: string;
    prinsip?: string;
    jenis?: string;
    underlying?: string[];
  };
  nilaiList?: KonsentrasiNilaiEntity[];
  orderIndex: number;
  konsentrasiProdukOjkId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KonsentrasiNilaiEntity {
  id: number;
  nomor?: string;
  judul: {
    type?: string;
    text?: string;
    value?: string | number | null;
    pembilang?: string;
    valuePembilang?: string | number | null;
    penyebut?: string;
    valuePenyebut?: string | number | null;
    formula?: string;
    percent?: boolean;
  };
  bobot: number;
  portofolio?: string;
  keterangan?: string;
  riskindikator?: {
    low?: string;
    lowToModerate?: string;
    moderate?: string;
    moderateToHigh?: string;
    high?: string;
  };
  parameterId: number;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================
// DTOs UNTUK CREATE/UPDATE (SESUAI BACKEND)
// =============================================

export interface CreateKonsentrasiProdukInherentDto {
  year: number;
  quarter: number;
  isActive?: boolean;
  createdBy?: string;
  version?: string;
}

export interface UpdateKonsentrasiProdukInherentDto {
  year?: number;
  quarter?: number;
  isActive?: boolean;
  summary?: {
    totalWeighted?: number;
    summaryBg?: string;
    computedAt?: Date;
  };
  isLocked?: boolean;
  lockedBy?: string;
  lockedAt?: Date;
  notes?: string;
  updatedBy?: string;
}

export interface CreateParameterDto {
  nomor?: string;
  judul: string;
  bobot: number;
  kategori?: {
    model?: string;
    prinsip?: string;
    jenis?: string;
    underlying?: string[];
  };
  orderIndex?: number;
}

export interface UpdateParameterDto {
  nomor?: string;
  judul?: string;
  bobot?: number;
  kategori?: {
    model?: string;
    prinsip?: string;
    jenis?: string;
    underlying?: string[];
  };
  orderIndex?: number;
}

export interface CreateNilaiDto {
  nomor?: string;
  judul: {
    type?: string;
    text?: string;
    value?: string | number | null;
    pembilang?: string;
    valuePembilang?: string | number | null;
    penyebut?: string;
    valuePenyebut?: string | number | null;
    formula?: string;
    percent?: boolean;
  };
  bobot: number;
  portofolio?: string;
  keterangan?: string;
  riskindikator?: {
    low?: string;
    lowToModerate?: string;
    moderate?: string;
    moderateToHigh?: string;
    high?: string;
  };
  orderIndex?: number;
}

export interface UpdateNilaiDto {
  nomor?: string;
  judul?: {
    type?: string;
    text?: string;
    value?: string | number | null;
    pembilang?: string;
    valuePembilang?: string | number | null;
    penyebut?: string;
    valuePenyebut?: string | number | null;
    formula?: string;
    percent?: boolean;
  };
  bobot?: number;
  portofolio?: string;
  keterangan?: string;
  riskindikator?: {
    low?: string;
    lowToModerate?: string;
    moderate?: string;
    moderateToHigh?: string;
    high?: string;
  };
  orderIndex?: number;
}

// =============================================
// REFERENCE TYPES
// =============================================

export interface ReferenceItem {
  id: number;
  type: string;
  key: string;
  label: string;
  color?: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================
// MAIN SERVICE CLASS
// =============================================

export class KonsentrasiProdukService {
  private baseUrl = '/konsentrasi';

  async findOrCreate(
    year: number,
    quarter: number,
  ): Promise<{
    success: boolean;
    data: KonsentrasiProdukOjkEntity | null;
    isNew: boolean;
    message: string;
  }> {
    console.log(`[Service] findOrCreate: ${year}-Q${quarter}`);

    try {
      const existingData = await this.findByYearQuarter(year, quarter);

      if (existingData) {
        console.log(`[Service] findOrCreate: Found existing ID=${existingData.id}`);
        return {
          success: true,
          data: existingData,
          isNew: false,
          message: 'Data ditemukan',
        };
      }

      console.log(`[Service] findOrCreate: Creating new data`);
      const newData = await this.create({
        year,
        quarter,
        isActive: true,
        createdBy: 'system',
        version: '1.0.0',
      });

      if (!newData?.parameters) newData.parameters = [];

      console.log(`[Service] findOrCreate: Created ID=${newData.id}`);
      return {
        success: true,
        data: newData,
        isNew: true,
        message: 'Data berhasil dibuat',
      };
    } catch (error: any) {
      console.error('[Service] findOrCreate error:', error.message);

      try {
        const retryData = await this.findByYearQuarter(year, quarter);
        if (retryData) {
          return { success: true, data: retryData, isNew: false, message: 'Data ditemukan (retry)' };
        }
      } catch {}

      return {
        success: false,
        data: null,
        isNew: false,
        message: error.message || 'Gagal memuat data',
      };
    }
  }

  async ensureDataExists(year: number, quarter: number): Promise<KonsentrasiProdukOjkEntity> {
    console.log(`[Service] ensureDataExists: ${year}-Q${quarter}`);

    const result = await this.findOrCreate(year, quarter);

    if (!result.success || !result.data) {
      throw new Error(`Gagal memastikan data tersedia: ${result.message}`);
    }

    if (!Array.isArray(result.data.parameters)) {
      result.data.parameters = [];
    }

    return result.data;
  }

  async loadOrCreateData(year: number, quarter: number): Promise<KonsentrasiProdukOjkEntity> {
    console.log(`[Service] loadOrCreateData: ${year}-Q${quarter}`);

    const result = await this.findOrCreate(year, quarter);

    if (!result.success || !result.data) {
      throw new Error(result.message || 'Gagal memuat data');
    }

    return result.data;
  }

  public formatToFrontend(entity: KonsentrasiProdukOjkEntity | null): any[] {
    console.log('[Service] formatToFrontend - Input entity:', {
      entity,
      entityType: typeof entity,
      hasParameters: !!entity?.parameters,
      parametersType: Array.isArray(entity?.parameters) ? 'array' : typeof entity?.parameters,
    });

    if (!entity) {
      console.log('[Service] formatToFrontend: Entity is null, returning empty array');
      return [];
    }

    const parameters = Array.isArray(entity.parameters) ? entity.parameters : [];

    console.log(`[Service] formatToFrontend: Processing ${parameters.length} parameters`);

    const result = parameters.map((param, index) => {
      const nilaiList = Array.isArray(param.nilaiList) ? param.nilaiList : [];

      const formattedParam = {
        id: param.id?.toString() || `temp-${Date.now()}-${index}`,
        nomor: param.nomor || '',
        judul: param.judul || '',
        bobot: param.bobot || 0,
        kategori: param.kategori || {
          model: '',
          prinsip: '',
          jenis: '',
          underlying: [],
        },
        orderIndex: param.orderIndex || index,
        nilaiList: nilaiList.map((nilai, idx) => ({
          id: nilai.id?.toString() || `temp-nilai-${Date.now()}-${idx}`,
          nomor: nilai.nomor || '',
          judul: nilai.judul || {
            type: 'Tanpa Faktor',
            text: '',
            value: null,
            pembilang: '',
            valuePembilang: null,
            penyebut: '',
            valuePenyebut: null,
            formula: '',
            percent: false,
          },
          bobot: nilai.bobot || 0,
          portofolio: nilai.portofolio || '',
          keterangan: nilai.keterangan || '',
          riskindikator: nilai.riskindikator || {
            low: '',
            lowToModerate: '',
            moderate: '',
            moderateToHigh: '',
            high: '',
          },
          orderIndex: nilai.orderIndex || idx,
        })),
        metadata: {
          inherentId: entity.id,
          year: entity.year,
          quarter: entity.quarter,
          isActive: entity.isActive,
          isLocked: entity.isLocked || false,
          summary: entity.summary,
        },
      };

      console.log(`[Service] formatToFrontend: Parameter ${index} formatted:`, {
        id: formattedParam.id,
        judul: formattedParam.judul,
        nilaiCount: formattedParam.nilaiList.length,
      });

      return formattedParam;
    });

    console.log('[Service] formatToFrontend: Final result length:', result.length);
    return result;
  }

  private handleError(error: any, operation: string, url?: string): never {
    const errorDetails = {
      operation,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: url || error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
    };

    console.error(`[KonsentrasiProdukService] Error in ${operation}:`, errorDetails);

    let errorMessage = `Gagal melakukan operasi ${operation}`;

    if (error.response?.status === 404) {
      errorMessage = `Endpoint tidak ditemukan: ${url}`;
    } else if (error.response?.status === 500) {
      errorMessage = `Server error: ${error.response?.data?.message || 'Internal server error'}`;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }

  private logApiCall(method: string, url: string, params?: any, data?: any) {
    console.log(`[Service] API ${method.toUpperCase()}:`, {
      url,
      params,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // =============================================
  // CRUD UTAMA
  // =============================================

  async findActive(): Promise<KonsentrasiProdukOjkEntity | null> {
    const url = `${this.baseUrl}/active`;
    this.logApiCall('GET', url);

    try {
      const response = await api_konsentrasi_produk.get<KonsentrasiProdukOjkEntity>(url);

      console.log('[Service] findActive - Response:', {
        status: response.status,
        hasData: !!response.data,
        parameters: Array.isArray(response.data?.parameters) ? response.data.parameters.length : 'not array',
      });

      if (!response.data) {
        console.log('[Service] findActive: No data returned');
        return null;
      }

      if (!Array.isArray(response.data.parameters)) {
        response.data.parameters = [];
      }

      return response.data;
    } catch (error: any) {
      console.log('[Service] findActive - Error:', {
        status: error.response?.status,
        message: error.message,
        url,
      });

      if (error.response?.status === 404) {
        console.log('[Service] findActive: 404 - No active data found');
        return null;
      }

      this.handleError(error, 'findActive', url);
    }
  }

  async findByYearQuarter(year: number, quarter: number): Promise<KonsentrasiProdukOjkEntity | null> {
    const url = this.baseUrl;
    const params = { year, quarter };

    this.logApiCall('GET', url, params);

    try {
      const response = await api_konsentrasi_produk.get<any>(url, { params });

      console.log('[Service] findByYearQuarter - Response:', {
        status: response.status,
        hasSuccess: response.data?.success !== undefined,
        hasData: !!response.data?.data,
      });

      if (response.data?.success !== undefined) {
        const result = response.data.data;

        if (!result) {
          console.log('[Service] findByYearQuarter: Data not found (null from backend)');
          return null;
        }

        if (!Array.isArray(result.parameters)) {
          result.parameters = [];
        }

        return result;
      }

      let data = response.data;
      if (Array.isArray(data)) {
        data = data.length > 0 ? data[0] : null;
      }
      if (!data) return null;
      if (!Array.isArray(data.parameters)) data.parameters = [];

      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('[Service] findByYearQuarter: 404 - Data not found');
        return null;
      }
      this.handleError(error, 'findByYearQuarter', `${url}?year=${year}&quarter=${quarter}`);
    }
  }

  async getAll(): Promise<KonsentrasiProdukOjkEntity[]> {
    const url = this.baseUrl;
    this.logApiCall('GET', url);

    try {
      const response = await api_konsentrasi_produk.get<any>(url);

      console.log('[Service] getAll - Response type:', Array.isArray(response.data) ? 'array' : typeof response.data);

      let data = response.data;

      if (!Array.isArray(data)) {
        console.log('[Service] getAll: Converting non-array response to array');
        data = data ? [data] : [];
      }

      const result = data.map((item: any, index: number) => ({
        ...item,
        parameters: Array.isArray(item.parameters) ? item.parameters : [],
      }));

      console.log('[Service] getAll: Returning', result.length, 'items');
      return result;
    } catch (error: any) {
      this.handleError(error, 'getAll', url);
    }
  }

  async getById(id: number): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/${id}`;
    this.logApiCall('GET', url);

    try {
      const response = await api_konsentrasi_produk.get<KonsentrasiProdukOjkEntity>(url);

      if (response.data && !Array.isArray(response.data.parameters)) {
        response.data.parameters = [];
      }

      return response.data;
    } catch (error: any) {
      this.handleError(error, 'getById', url);
    }
  }

  async create(createDto: CreateKonsentrasiProdukInherentDto): Promise<KonsentrasiProdukOjkEntity> {
    const url = this.baseUrl;
    this.logApiCall('POST', url, undefined, createDto);

    try {
      const response = await api_konsentrasi_produk.post<KonsentrasiProdukOjkEntity>(url, createDto);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'create', url);
    }
  }

  async update(id: number, updateDto: UpdateKonsentrasiProdukInherentDto): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/${id}`;
    this.logApiCall('PUT', url, undefined, updateDto);

    try {
      const response = await api_konsentrasi_produk.put<KonsentrasiProdukOjkEntity>(url, updateDto);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'update', url);
    }
  }

  async updateActiveStatus(id: number, isActive: boolean): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/${id}/status`;
    this.logApiCall('PUT', url, undefined, { isActive });

    try {
      const response = await api_konsentrasi_produk.put<KonsentrasiProdukOjkEntity>(url, { isActive });
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'updateActiveStatus', url);
    }
  }

  async updateSummary(id: number, summary: UpdateKonsentrasiProdukInherentDto['summary']): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/${id}/summary`;
    this.logApiCall('PUT', url, undefined, { summary });

    try {
      const response = await api_konsentrasi_produk.put<KonsentrasiProdukOjkEntity>(url, { summary });
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'updateSummary', url);
    }
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const url = `${this.baseUrl}/${id}`;
    this.logApiCall('DELETE', url);

    try {
      const response = await api_konsentrasi_produk.delete<{ message: string; id: number }>(url);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'remove', url);
    }
  }

  // =============================================
  // OPERASI PARAMETER
  // =============================================

  async addParameter(inherentId: number, dto: CreateParameterDto): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/${inherentId}/parameters`;

    console.log('[Service] addParameter:', { url, inherentId, dto });

    try {
      const payload: CreateParameterDto = {
        ...dto,
        judul: typeof dto.judul === 'string' ? dto.judul.trim() : String(dto.judul || '').trim(),
        bobot: Number(dto.bobot) || 0,
      };

      this.logApiCall('POST', url, undefined, payload);

      const response = await api_konsentrasi_produk.post<KonsentrasiProdukOjkEntity>(url, payload);

      if (response.data && !Array.isArray(response.data.parameters)) {
        response.data.parameters = [];
      }

      console.log('[Service] addParameter - Success:', { newParameterId: response.data.id });

      return response.data;
    } catch (error: any) {
      console.error('[Service] Error in addParameter:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url,
      });

      this.handleError(error, 'addParameter', url);
    }
  }

  async updateParameter(inherentId: number, parameterId: number, dto: UpdateParameterDto): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/${inherentId}/parameters/${parameterId}`;

    try {
      const payload: UpdateParameterDto = { ...dto };

      if (dto.judul !== undefined) {
        payload.judul = typeof dto.judul === 'string' ? dto.judul.trim() : String(dto.judul || '').trim();
      }

      if (dto.bobot !== undefined) {
        payload.bobot = Number(dto.bobot);
      }

      this.logApiCall('PUT', url, undefined, payload);

      const response = await api_konsentrasi_produk.put<KonsentrasiProdukOjkEntity>(url, payload);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'updateParameter', url);
    }
  }

  async copyParameter(inherentId: number, parameterId: number): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/${inherentId}/parameters/${parameterId}/copy`;
    this.logApiCall('POST', url);

    try {
      const response = await api_konsentrasi_produk.post<KonsentrasiProdukOjkEntity>(url);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'copyParameter', url);
    }
  }

  async removeParameter(inherentId: number, parameterId: number): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/${inherentId}/parameters/${parameterId}`;
    this.logApiCall('DELETE', url);

    try {
      const response = await api_konsentrasi_produk.delete<KonsentrasiProdukOjkEntity>(url);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'removeParameter', url);
    }
  }

  async reorderParameters(inherentId: number, parameterIds: number[]): Promise<{ message: string }> {
    const url = `${this.baseUrl}/${inherentId}/parameters/reorder`;

    try {
      const response = await api_konsentrasi_produk.put<{ message: string }>(url, { parameterIds });
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'reorderParameters', url);
    }
  }

  // =============================================
  // OPERASI NILAI
  // =============================================

  async addNilai(inherentId: number, parameterId: number, dto: CreateNilaiDto): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/${inherentId}/parameters/${parameterId}/nilai`;

    try {
      const payload: CreateNilaiDto = {
        ...dto,
        judul: {
          ...dto.judul,
          text: typeof dto.judul.text === 'string' ? dto.judul.text.trim() : String(dto.judul.text || '').trim(),
        },
        bobot: Number(dto.bobot) || 0,
      };

      this.logApiCall('POST', url, undefined, payload);

      const response = await api_konsentrasi_produk.post<KonsentrasiProdukOjkEntity>(url, payload);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'addNilai', url);
    }
  }

  async updateNilai(inherentId: number, parameterId: number, nilaiId: number, dto: UpdateNilaiDto): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/${inherentId}/parameters/${parameterId}/nilai/${nilaiId}`;

    try {
      const payload: UpdateNilaiDto = { ...dto };

      if (dto.judul?.text !== undefined) {
        payload.judul = {
          ...dto.judul,
          text: typeof dto.judul.text === 'string' ? dto.judul.text.trim() : String(dto.judul.text || '').trim(),
        };
      }

      if (dto.bobot !== undefined) {
        payload.bobot = Number(dto.bobot);
      }

      this.logApiCall('PUT', url, undefined, payload);

      const response = await api_konsentrasi_produk.put<KonsentrasiProdukOjkEntity>(url, payload);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'updateNilai', url);
    }
  }

  async copyNilai(inherentId: number, parameterId: number, nilaiId: number): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/${inherentId}/parameters/${parameterId}/nilai/${nilaiId}/copy`;
    this.logApiCall('POST', url);

    try {
      const response = await api_konsentrasi_produk.post<KonsentrasiProdukOjkEntity>(url);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'copyNilai', url);
    }
  }

  async removeNilai(inherentId: number, parameterId: number, nilaiId: number): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/${inherentId}/parameters/${parameterId}/nilai/${nilaiId}`;
    this.logApiCall('DELETE', url);

    try {
      const response = await api_konsentrasi_produk.delete<KonsentrasiProdukOjkEntity>(url);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'removeNilai', url);
    }
  }

  async reorderNilai(inherentId: number, parameterId: number, nilaiIds: number[]): Promise<{ message: string }> {
    const url = `${this.baseUrl}/${inherentId}/parameters/${parameterId}/nilai/reorder`;

    try {
      const response = await api_konsentrasi_produk.put<{ message: string }>(url, { nilaiIds });
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'reorderNilai', url);
    }
  }

  // =============================================
  // IMPORT/EXPORT OPERATIONS
  // =============================================

  async exportToExcel(inherentId: number): Promise<any> {
    const url = `${this.baseUrl}/${inherentId}/export`;
    this.logApiCall('GET', url);

    try {
      const response = await api_konsentrasi_produk.get<any>(url);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'exportToExcel', url);
    }
  }

  async importFromExcel(importData: any): Promise<KonsentrasiProdukOjkEntity> {
    const url = `${this.baseUrl}/import`;
    this.logApiCall('POST', url, undefined, importData);

    try {
      const response = await api_konsentrasi_produk.post<KonsentrasiProdukOjkEntity>(url, importData);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'importFromExcel', url);
    }
  }

  // =============================================
  // REFERENCE DATA
  // =============================================

  async getReferences(type?: string): Promise<ReferenceItem[]> {
    const url = `${this.baseUrl}/references`;
    const params = type ? { type } : undefined;

    this.logApiCall('GET', url, params);

    try {
      const response = await api_konsentrasi_produk.get<ReferenceItem[]>(url, { params });
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'getReferences', url);
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  async checkExists(year: number, quarter: number): Promise<{ exists: boolean; data: KonsentrasiProdukOjkEntity | null }> {
    try {
      console.log(`[Service] checkExists for ${year}-Q${quarter}`);
      const data = await this.findByYearQuarter(year, quarter);
      return { exists: !!data, data };
    } catch (error: any) {
      console.log('[Service] checkExists error:', error.message);
      return { exists: false, data: null };
    }
  }

  async loadOrCreate(year: number, quarter: number): Promise<KonsentrasiProdukOjkEntity> {
    console.log(`[Service] loadOrCreate: ${year}-Q${quarter}`);

    try {
      let data = await this.findByYearQuarter(year, quarter);

      if (data) {
        console.log(`[Service] loadOrCreate: Found existing data, ID: ${data.id}`);

        if (!Array.isArray(data.parameters)) {
          data.parameters = [];
        }

        return data;
      }

      console.log(`[Service] loadOrCreate: Creating new data`);

      const createDto: CreateKonsentrasiProdukInherentDto = {
        year,
        quarter,
        isActive: true,
        createdBy: 'system',
      };

      data = await this.create(createDto);

      if (!Array.isArray(data.parameters)) {
        data.parameters = [];
      }

      console.log(`[Service] loadOrCreate: New data created, ID: ${data.id}`);
      return data;
    } catch (error: any) {
      console.error('[Service] loadOrCreate error:', {
        message: error.message,
        year,
        quarter,
        stack: error.stack,
      });

      const fallbackData: KonsentrasiProdukOjkEntity = {
        id: -1,
        year,
        quarter,
        isActive: true,
        parameters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('[Service] loadOrCreate: Returning fallback data');
      return fallbackData;
    }
  }

  async getFormattedData(year?: number, quarter?: number): Promise<any[]> {
    console.log(`[Service] getFormattedData: year=${year}, quarter=${quarter}`);

    try {
      let data: KonsentrasiProdukOjkEntity | null = null;

      if (year && quarter) {
        data = await this.findByYearQuarter(year, quarter);
      } else {
        data = await this.findActive();
      }

      const result = this.formatToFrontend(data);

      console.log(`[Service] getFormattedData: Returning ${result.length} parameters`);
      return result;
    } catch (error: any) {
      console.error('[Service] getFormattedData error:', {
        message: error.message,
        year,
        quarter,
      });

      return [];
    }
  }

  formatParameterJudul(judul: any): string {
    if (!judul) return '';

    if (typeof judul === 'string') {
      return judul.trim();
    }

    if (typeof judul === 'object' && judul !== null) {
      return judul.text || judul.judul || judul.value || judul.label || '';
    }

    return String(judul).trim();
  }

  formatNilaiJudul(judul: any): CreateNilaiDto['judul'] {
    if (!judul) {
      return {
        type: 'Tanpa Faktor',
        text: '',
        value: null,
        pembilang: '',
        valuePembilang: null,
        penyebut: '',
        valuePenyebut: null,
        formula: '',
        percent: false,
      };
    }

    if (typeof judul === 'string') {
      return {
        type: 'Tanpa Faktor',
        text: judul.trim(),
        value: null,
        pembilang: '',
        valuePembilang: null,
        penyebut: '',
        valuePenyebut: null,
        formula: '',
        percent: false,
      };
    }

    return {
      type: judul.type || 'Tanpa Faktor',
      text: judul.text || '',
      value: judul.value ?? null,
      pembilang: judul.pembilang || '',
      valuePembilang: judul.valuePembilang ?? null,
      penyebut: judul.penyebut || '',
      valuePenyebut: judul.valuePenyebut ?? null,
      formula: judul.formula || '',
      percent: judul.percent || false,
    };
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await api_konsentrasi_produk.get(this.baseUrl, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('[Service] API connection failed:', error);
      return false;
    }
  }
}

export const konsentrasiProdukService = new KonsentrasiProdukService();
export default konsentrasiProdukService;