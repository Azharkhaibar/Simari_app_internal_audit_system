// rekap-data-2.hook.ts
import { useState, useEffect, useCallback } from 'react';
import { useHeaderStore } from '../../../store/header';
import { CATEGORIES } from '../contants/rekap-data-2';
import rekapData2ApiService from '../service/rekap-data-2.service';

interface SummaryItem {
  id: string;
  nama: string;
  Icon: React.ComponentType<{
    className?: string;
    size?: number;
    color?: string;
  }>;
  inherentSummary: number;
  kpmrSummary: number;
}

export const useGlobalSummaryAdapter = (): SummaryItem[] => {
  const { year, activeQuarter } = useHeaderStore();
  const [summaryData, setSummaryData] = useState<SummaryItem[]>([]);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      // Panggil service (bukan fetch langsung)
      const json = await rekapData2ApiService.getRekapData({
        year,
        quarter: activeQuarter,
      });

      // Mapping backend response ke format SummaryItem
      const data = json.map((item) => {
        const category = CATEGORIES.find((c) => c.id === item.id);
        return {
          id: item.id,
          nama: item.nama,
          Icon: category?.Icon,
          inherentSummary: item.inherentSummary ?? 0,
          kpmrSummary: item.kpmrSummary ?? 0,
        };
      });

      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      setSummaryData([]);
    }
  }, [year, activeQuarter]);

  useEffect(() => {
    fetchData();

    const handleUpdate = (): void => {
      fetchData();
    };

    window.addEventListener('risk-data-updated', handleUpdate);

    return () => {
      window.removeEventListener('risk-data-updated', handleUpdate);
    };
  }, [fetchData]);

  return summaryData;
};
