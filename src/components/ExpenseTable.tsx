import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Expense } from "@/types/expense";
import { StatusBadge } from "./StatusBadge";

interface ExpenseTableProps {
  expenses: Expense[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-bold">Employee</TableHead>
            <TableHead className="font-bold">Description</TableHead>
            <TableHead className="font-bold">Date</TableHead>
            <TableHead className="font-bold">Category</TableHead>
            <TableHead className="font-bold">Paid By</TableHead>
            <TableHead className="font-bold">Remarks</TableHead>
            <TableHead className="font-bold text-right">Amount</TableHead>
            <TableHead className="font-bold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow 
              key={expense.id}
              className="hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <TableCell className="font-medium">{expense.employee}</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>{expense.paidBy}</TableCell>
              <TableCell className="text-muted-foreground">{expense.remarks || "—"}</TableCell>
              <TableCell className="text-right font-semibold">
                {expense.amount} {expense.currency}
              </TableCell>
              <TableCell>
                <StatusBadge status={expense.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
