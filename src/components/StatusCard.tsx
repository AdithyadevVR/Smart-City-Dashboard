import { ReactNode } from 'react';

interface StatusCardProps {
  title: string;
  value: string | number;
  label?: string;
  icon: ReactNode;
  colorClass: string;
}

const StatusCard = ({ title, value, label, icon, colorClass }: StatusCardProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`p-2 rounded-md ${colorClass}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
      {label && (
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      )}
    </div>
  );
};

export default StatusCard;
