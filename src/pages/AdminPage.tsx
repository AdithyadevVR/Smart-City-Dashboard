import { useState } from 'react';
import { useCityStore, SensorData } from '../store/cityStore';
import { toast } from 'sonner';

const AdminPage = () => {
  const addRecord = useCityStore((s) => s.addRecord);

  const [traffic, setTraffic] = useState<SensorData['traffic']>('Moderate');
  const [aqi, setAqi] = useState('78');
  const [waterLevel, setWaterLevel] = useState('64');
  const [energy, setEnergy] = useState('342');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const aqiNum = parseInt(aqi);
    const waterNum = parseInt(waterLevel);
    const energyNum = parseInt(energy);

    if (isNaN(aqiNum) || isNaN(waterNum) || isNaN(energyNum)) {
      toast.error('Please enter valid numbers');
      return;
    }
    if (aqiNum < 0 || aqiNum > 500) {
      toast.error('AQI must be between 0 and 500');
      return;
    }
    if (waterNum < 0 || waterNum > 100) {
      toast.error('Water level must be between 0 and 100');
      return;
    }
    if (energyNum < 0 || energyNum > 10000) {
      toast.error('Energy must be between 0 and 10000');
      return;
    }

    addRecord({ traffic, aqi: aqiNum, waterLevel: waterNum, energy: energyNum });
    toast.success('Sensor data updated successfully');
  };

  const inputClass =
    'w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring';
  const labelClass = 'block text-sm font-medium text-foreground mb-1.5';

  return (
    <div className="max-w-lg">
      <p className="text-sm text-muted-foreground mb-6">
        Insert new sensor readings into the system. The dashboard will display the latest record.
      </p>

      <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 space-y-5">
        <div>
          <label className={labelClass}>Traffic Status</label>
          <select
            value={traffic}
            onChange={(e) => setTraffic(e.target.value as SensorData['traffic'])}
            className={inputClass}
          >
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Air Quality Index (0-500)</label>
          <input
            type="number"
            value={aqi}
            onChange={(e) => setAqi(e.target.value)}
            min="0"
            max="500"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Water Level % (0-100)</label>
          <input
            type="number"
            value={waterLevel}
            onChange={(e) => setWaterLevel(e.target.value)}
            min="0"
            max="100"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Energy Consumption in MW (0-10000)</label>
          <input
            type="number"
            value={energy}
            onChange={(e) => setEnergy(e.target.value)}
            min="0"
            max="10000"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Submit Data
        </button>
      </form>
    </div>
  );
};

export default AdminPage;
