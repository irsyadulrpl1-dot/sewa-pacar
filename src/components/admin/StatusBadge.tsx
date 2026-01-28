import { Badge } from '@/components/ui/badge';
import { BookingStatus } from '@/types/admin';

interface StatusBadgeProps {
  status: BookingStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'outline', label: 'Pending' },
    approved: { variant: 'default', label: 'Approved' },
    rejected: { variant: 'destructive', label: 'Rejected' },
    completed: { variant: 'secondary', label: 'Completed' },
    cancelled: { variant: 'outline', label: 'Cancelled' },
  };

  const config = variants[status] || { variant: 'outline', label: status };

  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}