import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  amount: string;
  label: string;
  variant: 'draft' | 'submitted' | 'approved';
}

export function SummaryCard({ amount, label, variant }: SummaryCardProps) {
  const variantStyles = {
    draft: "border-l-4 border-l-warning",
    submitted: "border-l-4 border-l-primary",
    approved: "border-l-4 border-l-success",
  };

  return (
    <Card className={cn(
      "p-6 hover:shadow-lg transition-all duration-300 bg-gradient-card",
      variantStyles[variant]
    )}>
      <div className="space-y-2">
        <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {amount}
        </p>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </div>
    </Card>
  );
}
