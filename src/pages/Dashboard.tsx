import { Car, Wind, Droplets, Zap } from 'lucide-react';
import StatusCard from '../components/StatusCard';
import { useCityStore } from '../store/cityStore';

const getAqiLabel = (aqi: number) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  return 'Poor';
};

const getTrafficColor = (traffic: string) => {
  if (traffic === 'Low') return 'bg-success/15 text-success';
  if (traffic === 'Moderate') return 'bg-warning/15 text-warning';
  return 'bg-destructive/15 text-destructive';
};

const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return 'bg-success/15 text-success';
  if (aqi <= 100) return 'bg-warning/15 text-warning';
  return 'bg-destructive/15 text-destructive';
};

const Dashboard = () => {
  const latest = useCityStore((s) => s.getLatest());

  if (!latest) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available. Please add data from the Update Data page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing latest sensor readings · Recorded at{' '}
          {new Date(latest.timestamp).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Traffic Status"
          value={latest.traffic}
          label={`Level: ${latest.traffic}`}
          icon={<Car className="h-4 w-4" />}
          colorClass={getTrafficColor(latest.traffic)}
        />
        <StatusCard
          title="Air Quality Index"
          value={latest.aqi}
          label={`Status: ${getAqiLabel(latest.aqi)}`}
          icon={<Wind className="h-4 w-4" />}
          colorClass={getAqiColor(latest.aqi)}
        />
        <StatusCard
          title="Water Level"
          value={`${latest.waterLevel}%`}
          label="Reservoir capacity"
          icon={<Droplets className="h-4 w-4" />}
          colorClass="bg-info/15 text-info"
        />
        <StatusCard
          title="Energy Consumption"
          value={`${latest.energy} MW`}
          label="Current usage"
          icon={<Zap className="h-4 w-4" />}
          colorClass="bg-warning/15 text-warning"
        />
      </div>

      {/* Simple bar visualization */}
      <div className="mt-8 bg-card rounded-lg border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Sensor Overview</h3>
        <div className="space-y-4">
          <BarRow label="AQI" value={latest.aqi} max={300} color="bg-primary" />
          <BarRow label="Water Level" value={latest.waterLevel} max={100} color="bg-info" />
          <BarRow label="Energy (MW)" value={latest.energy} max={1000} color="bg-warning" />
        </div>
      </div>
    </div>
  );
};

const BarRow = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default Dashboard;
