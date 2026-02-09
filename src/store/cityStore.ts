import { create } from 'zustand';

export interface SensorData {
  id: number;
  traffic: 'Low' | 'Moderate' | 'High';
  aqi: number;
  waterLevel: number;
  energy: number;
  timestamp: string;
}

interface CityStore {
  records: SensorData[];
  addRecord: (data: Omit<SensorData, 'id' | 'timestamp'>) => void;
  getLatest: () => SensorData | null;
}

const initialRecord: SensorData = {
  id: 1,
  traffic: 'Moderate',
  aqi: 78,
  waterLevel: 64,
  energy: 342,
  timestamp: new Date().toISOString(),
};

export const useCityStore = create<CityStore>((set, get) => ({
  records: [initialRecord],
  addRecord: (data) => {
    set((state) => ({
      records: [
        ...state.records,
        {
          ...data,
          id: state.records.length + 1,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  },
  getLatest: () => {
    const { records } = get();
    return records.length > 0 ? records[records.length - 1] : null;
  },
}));
