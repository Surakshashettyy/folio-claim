import { Badge } from "@/components/ui/badge";
import { ExpenseStatus } from "@/types/expense";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ExpenseStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    draft: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
    submitted: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
    approved: "bg-success/10 text-success border-success/20 hover:bg-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  };

  const labels = {
    draft: "Draft",
    submitted: "Submitted",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-semibold transition-colors",
        variants[status]
      )}
    >
      {labels[status]}
    </Badge>
  );
}
