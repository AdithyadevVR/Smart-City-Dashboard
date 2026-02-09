import { useCityStore } from '../store/cityStore';

const RecordsPage = () => {
  const records = useCityStore((s) => s.records);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        All sensor records stored in the system ({records.length} total).
      </p>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Traffic</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">AQI</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Water %</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Energy (MW)</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {[...records].reverse().map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">{r.id}</td>
                  <td className="px-4 py-3 text-foreground">{r.traffic}</td>
                  <td className="px-4 py-3 text-foreground">{r.aqi}</td>
                  <td className="px-4 py-3 text-foreground">{r.waterLevel}%</td>
                  <td className="px-4 py-3 text-foreground">{r.energy}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecordsPage;
