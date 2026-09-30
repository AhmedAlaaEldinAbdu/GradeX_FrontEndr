import Card from './Card';
import CustomImage from './CustomImage';

interface PersonSummaryCardProps {
  name: string;
  subtitle: string;
  avatar: string;
  className?: string;
}

export default function PersonSummaryCard({
  name,
  subtitle,
  avatar,
  className = '',
}: PersonSummaryCardProps) {
  return (
    <Card className={`border-emerald-100 bg-emerald-50/60 ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white bg-white shadow-xs">
            <CustomImage src={avatar} alt={name} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-2">
            <h2 className="flex text-2xl font-semibold text-gray-900">{name}</h2>
            <p className="text-lg text-gray-600">{subtitle}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
